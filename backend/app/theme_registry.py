"""Registry of preset themes including GASTAT Executive as default."""

from typing import Dict, Any, List

GASTAT_EXECUTIVE = {
    "palette": {
        "primary": "#4137A8",
        "accent": "#27CED7",
        "danger": "#CC3641",
        "warning": "#F5A623",
        "success": "#27AE60",
        "bg": "#0f0e1c",
        "surface": "#f4f4f8",
        "surface_alt": "#1a1930",
        "text": "#f4f4f8",
        "text_muted": "#9b9bb4",
        "border": "#2d2b4e",
    },
    "typography": {
        "fontFamilyHeading": "IBM Plex Sans Arabic",
        "fontFamilyBody": "IBM Plex Sans Arabic",
        "fontFamilyMono": "IBM Plex Mono",
        "scaleBase": 16,
    },
    "radius": "soft",       # sharp | soft | round
    "density": "cozy",      # compact | cozy | spacious
    "elevation": "glass",   # flat | raised | glass
    "motion": "expressive", # minimal | standard | expressive
    "background": "gradient",  # solid | gradient | mesh
}

PRESET_THEMES: Dict[str, Dict[str, Any]] = {
    "gastat_executive": {
        "name": "GASTAT Executive",
        "tokens": GASTAT_EXECUTIVE,
    },
    "executive_light": {
        "name": "Executive Light",
        "tokens": {
            "palette": {
                "primary": "#1a1a2e",
                "accent": "#2563eb",
                "danger": "#dc2626",
                "warning": "#d97706",
                "success": "#059669",
                "bg": "#f8fafc",
                "surface": "#ffffff",
                "surface_alt": "#f1f5f9",
                "text": "#0f172a",
                "text_muted": "#64748b",
                "border": "#e2e8f0",
            },
            "typography": {
                "fontFamilyHeading": "Inter",
                "fontFamilyBody": "Inter",
                "fontFamilyMono": "JetBrains Mono",
                "scaleBase": 16,
            },
            "radius": "soft",
            "density": "cozy",
            "elevation": "raised",
            "motion": "standard",
            "background": "solid",
        },
    },
    "midnight_pro": {
        "name": "Midnight Pro",
        "tokens": {
            "palette": {
                "primary": "#7c3aed",
                "accent": "#06b6d4",
                "danger": "#ef4444",
                "warning": "#f59e0b",
                "success": "#10b981",
                "bg": "#030712",
                "surface": "#111827",
                "surface_alt": "#1f2937",
                "text": "#f9fafb",
                "text_muted": "#6b7280",
                "border": "#374151",
            },
            "typography": {
                "fontFamilyHeading": "Inter",
                "fontFamilyBody": "Inter",
                "fontFamilyMono": "JetBrains Mono",
                "scaleBase": 16,
            },
            "radius": "sharp",
            "density": "compact",
            "elevation": "flat",
            "motion": "minimal",
            "background": "solid",
        },
    },
    "glass_aurora": {
        "name": "Glass Aurora",
        "tokens": {
            "palette": {
                "primary": "#8b5cf6",
                "accent": "#34d399",
                "danger": "#f43f5e",
                "warning": "#fbbf24",
                "success": "#34d399",
                "bg": "#0a0a1a",
                "surface": "rgba(255,255,255,0.08)",
                "surface_alt": "rgba(255,255,255,0.04)",
                "text": "#e0e7ff",
                "text_muted": "#818cf8",
                "border": "rgba(139,92,246,0.3)",
            },
            "typography": {
                "fontFamilyHeading": "Sora",
                "fontFamilyBody": "DM Sans",
                "fontFamilyMono": "Fira Code",
                "scaleBase": 16,
            },
            "radius": "round",
            "density": "spacious",
            "elevation": "glass",
            "motion": "expressive",
            "background": "mesh",
        },
    },
    "terminal": {
        "name": "Terminal",
        "tokens": {
            "palette": {
                "primary": "#00ff41",
                "accent": "#00bfff",
                "danger": "#ff0000",
                "warning": "#ffff00",
                "success": "#00ff41",
                "bg": "#000000",
                "surface": "#0d0d0d",
                "surface_alt": "#1a1a1a",
                "text": "#00ff41",
                "text_muted": "#006600",
                "border": "#003300",
            },
            "typography": {
                "fontFamilyHeading": "Fira Code",
                "fontFamilyBody": "Fira Code",
                "fontFamilyMono": "Fira Code",
                "scaleBase": 14,
            },
            "radius": "sharp",
            "density": "compact",
            "elevation": "flat",
            "motion": "minimal",
            "background": "solid",
        },
    },
    "pastel_soft": {
        "name": "Pastel Soft",
        "tokens": {
            "palette": {
                "primary": "#7c3aed",
                "accent": "#ec4899",
                "danger": "#ef4444",
                "warning": "#f59e0b",
                "success": "#10b981",
                "bg": "#fdf4ff",
                "surface": "#ffffff",
                "surface_alt": "#fce7f3",
                "text": "#1e1b4b",
                "text_muted": "#7c3aed",
                "border": "#e9d5ff",
            },
            "typography": {
                "fontFamilyHeading": "Nunito",
                "fontFamilyBody": "Nunito",
                "fontFamilyMono": "JetBrains Mono",
                "scaleBase": 16,
            },
            "radius": "round",
            "density": "spacious",
            "elevation": "raised",
            "motion": "expressive",
            "background": "gradient",
        },
    },
    "high_contrast": {
        "name": "High Contrast",
        "tokens": {
            "palette": {
                "primary": "#ffffff",
                "accent": "#ffff00",
                "danger": "#ff6b6b",
                "warning": "#ffd93d",
                "success": "#6bcb77",
                "bg": "#000000",
                "surface": "#111111",
                "surface_alt": "#222222",
                "text": "#ffffff",
                "text_muted": "#cccccc",
                "border": "#ffffff",
            },
            "typography": {
                "fontFamilyHeading": "Inter",
                "fontFamilyBody": "Inter",
                "fontFamilyMono": "Courier New",
                "scaleBase": 18,
            },
            "radius": "sharp",
            "density": "cozy",
            "elevation": "flat",
            "motion": "minimal",
            "background": "solid",
        },
    },
    "brand_blank": {
        "name": "Brand Blank",
        "tokens": {
            "palette": {
                "primary": "#000000",
                "accent": "#000000",
                "danger": "#ef4444",
                "warning": "#f59e0b",
                "success": "#10b981",
                "bg": "#ffffff",
                "surface": "#ffffff",
                "surface_alt": "#f9fafb",
                "text": "#000000",
                "text_muted": "#6b7280",
                "border": "#e5e7eb",
            },
            "typography": {
                "fontFamilyHeading": "Inter",
                "fontFamilyBody": "Inter",
                "fontFamilyMono": "Fira Code",
                "scaleBase": 16,
            },
            "radius": "soft",
            "density": "cozy",
            "elevation": "flat",
            "motion": "minimal",
            "background": "solid",
        },
    },
}


def get_all_presets() -> List[Dict[str, Any]]:
    result = []
    for slug, data in PRESET_THEMES.items():
        result.append({
            "slug": slug,
            "name": data["name"],
            "tokens": data["tokens"],
        })
    return result


def get_preset(slug: str) -> Dict[str, Any]:
    return PRESET_THEMES.get(slug, PRESET_THEMES["gastat_executive"])
