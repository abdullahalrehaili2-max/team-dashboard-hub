from fastapi import APIRouter
from app.indicator_registry import get_registry

router = APIRouter()


@router.get("")
def list_indicators():
    return get_registry()
