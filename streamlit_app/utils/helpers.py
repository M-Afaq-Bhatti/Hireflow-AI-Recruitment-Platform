import streamlit as st
from datetime import datetime
from typing import Any

STAGE_COLORS = {
    "APPLIED": "🔵",
    "SCREENING": "🟦",
    "SCREENED_OUT": "🔴",
    "ASSESSMENT": "🟨",
    "EVALUATING": "🟧",
    "INTERVIEW": "🟪",
    "HIRED": "🟢",
    "REJECTED": "🔴",
}

STAGE_ORDER = {
    "APPLIED": 1,
    "SCREENING": 2,
    "SCREENED_OUT": 8,
    "ASSESSMENT": 3,
    "EVALUATING": 4,
    "INTERVIEW": 5,
    "HIRED": 6,
    "REJECTED": 7,
}

def format_stage(stage: str) -> str:
    """Format stage name with emoji"""
    emoji = STAGE_COLORS.get(stage, "⚪")
    return f"{emoji} {stage.replace('_', ' ')}"

def get_score_color(score: float) -> str:
    """Get color for score"""
    if score >= 70:
        return "🟢"
    elif score >= 50:
        return "🟡"
    else:
        return "🔴"

def format_score(score: float) -> str:
    """Format score with color"""
    if score is None:
        return "N/A"
    color = get_score_color(score)
    return f"{color} {score:.0f}%"

def format_datetime(dt: str) -> str:
    """Format datetime string"""
    if not dt:
        return "N/A"
    try:
        dt_obj = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        return dt_obj.strftime("%Y-%m-%d %H:%M")
    except:
        return dt

def paginate_list(items: list, page_size: int = 10) -> tuple:
    """Paginate a list of items"""
    total_pages = (len(items) + page_size - 1) // page_size
    page = st.number_input("Page", 1, total_pages, 1) - 1
    start = page * page_size
    end = start + page_size
    return items[start:end], page + 1, total_pages
