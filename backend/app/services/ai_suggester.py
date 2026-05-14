"""
AI Suggester service.
- Rules-based indicator recommendation (no API key needed)
- Optional LLM enhancement via Anthropic/OpenAI
- Non-destructive applies create Revision rows
- Cache suggestions per (dashboard_id, data_hash) for 30 min
"""

import hashlib
import json
import time
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app import models
from app.indicator_registry import get_indicator
from app.config import settings

# In-memory cache: {cache_key: (timestamp, result)}
_cache: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL = 30 * 60  # 30 minutes


def _cache_key(dashboard_id: int, data_hash: str) -> str:
    return f"{dashboard_id}:{data_hash}"


def _extract_features(section: models.Section, db: Session) -> Dict[str, Any]:
    """Extract features from a section for indicator recommendation."""
    fields = section.fields
    field_count = len(fields)
    numeric_count = sum(1 for f in fields if f.data_type in ("number", "currency", "percent"))
    text_count = sum(1 for f in fields if f.data_type == "text")
    series_count = sum(1 for f in fields if f.data_type == "series")
    table_count = sum(1 for f in fields if f.data_type == "table")
    has_target = any(f.key in ("target", "max", "goal") for f in fields)

    # Count weeks of history
    weeks_of_history = 0
    if fields:
        fid = fields[0].id
        count = db.query(models.FieldValue).filter_by(field_id=fid).count()
        weeks_of_history = count

    # Heuristic flags
    is_composition = table_count > 0 and field_count > 2
    is_ranked = table_count > 0 and field_count >= 2
    is_time_series = series_count > 0 or weeks_of_history >= 4
    is_matrix = table_count > 0 and field_count > 4

    # WoW volatility (simplified)
    wow_volatility = 0.0
    if fields and weeks_of_history >= 2:
        fid = fields[0].id
        vals = db.query(models.FieldValue).filter_by(field_id=fid).order_by(models.FieldValue.week_start.desc()).limit(4).all()
        nums = [v.value_num for v in vals if v.value_num is not None]
        if len(nums) >= 2:
            diffs = [abs(nums[i] - nums[i+1]) / max(abs(nums[i+1]), 1) for i in range(len(nums)-1)]
            wow_volatility = sum(diffs) / len(diffs)

    # Importance score
    importance_score = (
        numeric_count * 2 +
        series_count * 3 +
        table_count * 1.5 +
        weeks_of_history * 0.1 +
        (5 if has_target else 0) +
        (3 if is_time_series else 0)
    )

    return {
        "field_count": field_count,
        "numeric_count": numeric_count,
        "text_count": text_count,
        "series_count": series_count,
        "table_count": table_count,
        "has_target": has_target,
        "weeks_of_history": weeks_of_history,
        "is_composition": is_composition,
        "is_ranked": is_ranked,
        "is_time_series": is_time_series,
        "is_matrix": is_matrix,
        "wow_volatility": wow_volatility,
        "importance_score": importance_score,
    }


def _rule_based_recommendation(features: Dict[str, Any], current_type: str) -> Dict[str, Any]:
    """Rule table → recommended indicator type, confidence, reason."""
    fc = features
    
    if fc["is_matrix"] and fc["table_count"] > 0:
        return {"type": "HEATMAP", "confidence": 0.75, "reason": "Matrix data is best displayed as a heatmap"}
    
    if fc["series_count"] > 0 and fc["is_time_series"] and fc["weeks_of_history"] >= 8:
        if fc["wow_volatility"] > 0.15:
            return {"type": "AREA_CHART", "confidence": 0.85, "reason": "Volatile time series benefits from area chart for trend visibility"}
        return {"type": "LINE_CHART", "confidence": 0.80, "reason": "Time series data is best shown as a line chart"}
    
    if fc["is_composition"] and fc["table_count"] > 0 and fc["field_count"] <= 6:
        return {"type": "PIE_DONUT", "confidence": 0.78, "reason": "Composition data with few categories suits a donut chart"}
    
    if fc["is_ranked"] and fc["table_count"] > 0:
        return {"type": "HORIZONTAL_BAR", "confidence": 0.82, "reason": "Ranked categories are clearest as horizontal bars"}
    
    if fc["is_time_series"] and fc["series_count"] > 0 and fc["weeks_of_history"] < 8:
        return {"type": "COLUMN_TREND", "confidence": 0.72, "reason": "Short time series shows well as column trend"}
    
    if fc["has_target"] and fc["numeric_count"] >= 2:
        return {"type": "BULLET_CHART", "confidence": 0.80, "reason": "Has target — bullet chart shows actual vs target clearly"}
    
    if fc["has_target"] and fc["numeric_count"] == 2:
        return {"type": "GAUGE", "confidence": 0.75, "reason": "Value and max/target suits a gauge"}
    
    if fc["numeric_count"] == 1 and fc["field_count"] <= 2:
        if fc["importance_score"] > 15:
            return {"type": "BIG_STAT_HERO", "confidence": 0.70, "reason": "High-importance single metric is best as a hero stat"}
        return {"type": "KPI_CARD", "confidence": 0.85, "reason": "Single numeric metric is ideal as a KPI card"}
    
    if fc["table_count"] > 0:
        return {"type": "TABLE", "confidence": 0.70, "reason": "Tabular data structure suits a table indicator"}
    
    if fc["text_count"] > 0 and fc["numeric_count"] == 0:
        return {"type": "TEXT_NOTE", "confidence": 0.90, "reason": "Text-only content is best as a text note"}
    
    # Keep current
    return {"type": current_type, "confidence": 0.50, "reason": "Current indicator type is appropriate"}


def _llm_enhance(suggestions: List[Dict], features_list: List[Dict]) -> List[Dict]:
    """Optionally enhance suggestions with LLM. Falls back silently."""
    provider = settings.AI_SUGGESTER_PROVIDER

    if provider == "rules":
        return suggestions

    if provider in ("auto", "anthropic") and settings.ANTHROPIC_API_KEY:
        try:
            import httpx
            payload = {
                "model": "claude-3-haiku-20240307",
                "max_tokens": 1024,
                "messages": [{
                    "role": "user",
                    "content": f"Given these dashboard section features and current recommendations, provide refined reasons (JSON array of {{section_index, reason}}):\n{json.dumps({'features': features_list, 'suggestions': suggestions}, indent=2)[:3000]}\nRespond with only a JSON array."
                }]
            }
            resp = httpx.post(
                "https://api.anthropic.com/v1/messages",
                headers={"x-api-key": settings.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                json=payload,
                timeout=10,
            )
            if resp.status_code == 200:
                content = resp.json()["content"][0]["text"]
                enhancements = json.loads(content)
                for enh in enhancements:
                    idx = enh.get("section_index", -1)
                    if 0 <= idx < len(suggestions):
                        suggestions[idx]["reason"] = enh.get("reason", suggestions[idx]["reason"])
        except Exception:
            pass

    elif provider in ("auto", "openai") and settings.OPENAI_API_KEY:
        try:
            import httpx
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{
                    "role": "user",
                    "content": f"Dashboard section features: {json.dumps(features_list, indent=2)[:2000]}\nRefine these indicator recommendations with better reasons: {json.dumps(suggestions, indent=2)[:1000]}\nReturn JSON array of {{section_index, reason}}."
                }],
                "max_tokens": 512,
            }
            resp = httpx.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"},
                json=payload,
                timeout=10,
            )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                enhancements = json.loads(content)
                for enh in enhancements:
                    idx = enh.get("section_index", -1)
                    if 0 <= idx < len(suggestions):
                        suggestions[idx]["reason"] = enh.get("reason", suggestions[idx]["reason"])
        except Exception:
            pass

    return suggestions


def get_indicator_suggestions(dashboard_id: int, db: Session) -> Dict[str, Any]:
    sections = db.query(models.Section).filter_by(dashboard_id=dashboard_id).all()
    
    # Compute data hash for caching
    data_hash = hashlib.md5(
        json.dumps([s.id for s in sections]).encode()
    ).hexdigest()
    cache_key = _cache_key(dashboard_id, data_hash)
    
    now = time.time()
    if cache_key in _cache:
        ts, cached = _cache[cache_key]
        if now - ts < CACHE_TTL:
            return cached

    suggestions = []
    features_list = []
    for section in sections:
        features = _extract_features(section, db)
        rec = _rule_based_recommendation(features, section.indicator_type)
        suggestions.append({
            "section_id": section.id,
            "section_title": section.title,
            "current_type": section.indicator_type,
            "recommended_type": rec["type"],
            "confidence": rec["confidence"],
            "reason": rec["reason"],
            "same": rec["type"] == section.indicator_type,
            "features": features,
        })
        features_list.append(features)

    suggestions = _llm_enhance(suggestions, features_list)

    result = {
        "dashboard_id": dashboard_id,
        "suggestions": suggestions,
        "total": len(suggestions),
        "changes_recommended": sum(1 for s in suggestions if not s["same"]),
    }
    _cache[cache_key] = (now, result)
    return result


def get_layout_suggestions(dashboard_id: int, db: Session) -> Dict[str, Any]:
    from app.services.layout_service import importance_sort, assign_sizes, pack_layout
    sections = db.query(models.Section).filter_by(dashboard_id=dashboard_id).all()
    scored = []
    for sec in sections:
        features = _extract_features(sec, db)
        ind = get_indicator(sec.indicator_type)
        scored.append({
            "id": sec.id,
            "title": sec.title,
            "importance_score": features["importance_score"],
            "min_w": ind.get("min_w", 2),
            "min_h": ind.get("min_h", 1),
        })
    sorted_sections = importance_sort(scored)
    sized = assign_sizes(sorted_sections)
    packed = pack_layout(sized)
    return {
        "dashboard_id": dashboard_id,
        "suggested_layout": packed,
        "reasoning": "Sections sorted by data richness; top 2 given large slots, next 4 medium, rest small.",
    }


def apply_suggestions(
    dashboard_id: int,
    accepted_section_ids: List[int],
    swap_indicators: bool,
    repack_layout: bool,
    regroup_pages: bool,
    user_id: int,
    db: Session,
) -> Dict[str, Any]:
    applied = []
    if swap_indicators:
        sugg = get_indicator_suggestions(dashboard_id, db)
        for s in sugg["suggestions"]:
            if s["section_id"] in accepted_section_ids and not s["same"]:
                section = db.query(models.Section).filter_by(id=s["section_id"]).first()
                if section:
                    old_type = section.indicator_type
                    section.indicator_type = s["recommended_type"]
                    ind = get_indicator(s["recommended_type"])
                    section.indicator_config_json = ind.get("default_config", {})
                    # Revision
                    rev = models.Revision(
                        dashboard_id=dashboard_id,
                        section_id=section.id,
                        user_id=user_id,
                        diff_json={"old_type": old_type, "new_type": s["recommended_type"], "reason": s["reason"]},
                        action="ai_apply",
                    )
                    db.add(rev)
                    applied.append({"section_id": section.id, "new_type": s["recommended_type"]})

    if repack_layout:
        layout_sugg = get_layout_suggestions(dashboard_id, db)
        for item in layout_sugg["suggested_layout"]:
            sec = db.query(models.Section).filter_by(id=int(item["i"])).first()
            if sec:
                gi = sec.grid_item_json or {}
                gi.update({"x": item["x"], "y": item["y"], "w": item["w"], "h": item["h"]})
                sec.grid_item_json = gi

    db.commit()
    return {"applied": len(applied), "sections_updated": applied}


def explain_section(section: models.Section, db: Session) -> Dict[str, Any]:
    features = _extract_features(section, db)
    rec = _rule_based_recommendation(features, section.indicator_type)
    return {
        "section_id": section.id,
        "section_title": section.title,
        "current_type": section.indicator_type,
        "features": features,
        "recommendation": rec,
    }
