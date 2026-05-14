from datetime import date, timedelta
from typing import Optional
from app.config import settings


def iso_week_start(d: Optional[date] = None) -> date:
    """Return the ISO week-start (Monday by default) for a given date."""
    if d is None:
        d = date.today()
    # settings.WEEK_STARTS_ON: monday|sunday
    if settings.WEEK_STARTS_ON.lower() == "sunday":
        # Adjust so week starts Sunday (weekday: Mon=0 ... Sun=6)
        dow = (d.weekday() + 1) % 7  # Sun=0 ... Sat=6
        return d - timedelta(days=dow)
    else:  # default monday
        return d - timedelta(days=d.weekday())


def prev_week_start(ws: date) -> date:
    return ws - timedelta(weeks=1)


def delta(this: Optional[float], last: Optional[float]) -> Optional[float]:
    if this is None or last is None:
        return None
    return this - last


def delta_pct(this: Optional[float], last: Optional[float]) -> Optional[float]:
    if this is None or last is None:
        return None
    if last == 0:
        return None
    return ((this - last) / abs(last)) * 100


def trend(d: Optional[float]) -> str:
    """Return 'up', 'down', or 'flat'."""
    if d is None:
        return "flat"
    if d > 0:
        return "up"
    if d < 0:
        return "down"
    return "flat"


def color_for(direction_good: str, d: Optional[float]) -> str:
    """Return 'green', 'red', or 'neutral' based on direction and delta."""
    t = trend(d)
    if t == "flat":
        return "neutral"
    if direction_good == "up":
        return "green" if t == "up" else "red"
    if direction_good == "down":
        return "green" if t == "down" else "red"
    return "neutral"


def is_big_move(d_pct: Optional[float]) -> bool:
    if d_pct is None:
        return False
    return abs(d_pct) >= settings.BIG_MOVE_THRESHOLD_PCT
