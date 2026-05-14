"""Auto-layout service: packs sections into a responsive grid."""

from typing import List, Dict, Any


def pack_layout(sections: List[Dict[str, Any]], cols: int = 12) -> List[Dict[str, Any]]:
    """
    Simple bin-packing: place sections left-to-right, top-to-bottom.
    sections: list of {id, w, h, ...}
    Returns: list of {id, x, y, w, h}
    """
    layout = []
    col_heights = [0] * cols

    for sec in sections:
        w = min(sec.get("w", 3), cols)
        h = sec.get("h", 2)
        # Find best horizontal position
        best_x = 0
        best_y = max(col_heights)
        for x in range(cols - w + 1):
            y = max(col_heights[x:x + w])
            if y < best_y:
                best_y = y
                best_x = x

        # Place
        layout.append({
            "i": str(sec.get("id", "")),
            "x": best_x,
            "y": best_y,
            "w": w,
            "h": h,
        })
        for c in range(best_x, best_x + w):
            col_heights[c] = best_y + h

    return layout


def importance_sort(sections_with_scores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort by importance_score descending."""
    return sorted(sections_with_scores, key=lambda s: s.get("importance_score", 0), reverse=True)


def assign_sizes(sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Assign w/h based on rank:
    - Top 1-2: large (w=8, h=4)
    - Next 3-4: medium (w=4, h=3)
    - Rest: small (w=3, h=2)
    """
    result = []
    for i, sec in enumerate(sections):
        if i < 2:
            w, h = 8, 4
        elif i < 6:
            w, h = 4, 3
        else:
            w, h = 3, 2
        # Respect min constraints
        min_w = sec.get("min_w", 2)
        min_h = sec.get("min_h", 1)
        result.append({**sec, "w": max(w, min_w), "h": max(h, min_h)})
    return result
