"""
Badge catalog and award logic for Safe Exit and other achievements.
Badge IDs are used in the app for icons and labels.
"""

from typing import List
from datetime import datetime, timezone

# Unique, attractive badges for the app
BADGE_CATALOG = {
    "safe_return": {
        "name": "Safe Return",
        "description": "Chose to turn back safely. Wisdom over risk.",
        "icon": "shield-checkmark",
        "gradient": ["#10B981", "#059669"],
    },
    "first_steps": {
        "name": "First Steps",
        "description": "Completed your first checkpoint.",
        "icon": "footsteps",
        "gradient": ["#6366F1", "#8B5CF6"],
    },
    "halfway_hero": {
        "name": "Halfway Hero",
        "description": "Completed 50% or more checkpoints before safe exit.",
        "icon": "trophy",
        "gradient": ["#F59E0B", "#F97316"],
    },
    "mountain_sage": {
        "name": "Mountain Sage",
        "description": "Knew when to pause. The trail will wait.",
        "icon": "leaf",
        "gradient": ["#3B82F6", "#6366F1"],
    },
    "checkpoint_champion": {
        "name": "Checkpoint Champion",
        "description": "Conquered multiple checkpoints this trek.",
        "icon": "flag",
        "gradient": ["#EC4899", "#F43F5E"],
    },
    "altitude_aware": {
        "name": "Altitude Aware",
        "description": "Acknowledged rapid altitude gain. Stay safe up high.",
        "icon": "cloud",
        "gradient": ["#06B6D4", "#0EA5E9"],
    },
}


def get_badges_to_award(
    completed_count: int,
    total_count: int,
    challenge_id: str,
    challenge_title: str,
) -> List[dict]:
    """
    Returns list of badge records to add for a safe exit.
    Each record: { badge_id, earned_at, challenge_id, challenge_title }
    """
    if total_count == 0:
        return []

    now = datetime.now(timezone.utc).isoformat()
    records = []

    # Always award Safe Return for choosing to exit safely
    records.append({
        "badge_id": "safe_return",
        "earned_at": now,
        "challenge_id": challenge_id,
        "challenge_title": challenge_title,
    })

    # Mountain Sage - chose to turn back (same as safe return but we keep one)
    # We already have safe_return. Add Mountain Sage as extra flair.
    records.append({
        "badge_id": "mountain_sage",
        "earned_at": now,
        "challenge_id": challenge_id,
        "challenge_title": challenge_title,
    })

    if completed_count >= 1:
        records.append({
            "badge_id": "first_steps",
            "earned_at": now,
            "challenge_id": challenge_id,
            "challenge_title": challenge_title,
        })

    if completed_count >= 2:
        records.append({
            "badge_id": "checkpoint_champion",
            "earned_at": now,
            "challenge_id": challenge_id,
            "challenge_title": challenge_title,
        })

    if total_count > 0 and (completed_count / total_count) >= 0.5:
        records.append({
            "badge_id": "halfway_hero",
            "earned_at": now,
            "challenge_id": challenge_id,
            "challenge_title": challenge_title,
        })

    return records


def get_badge_catalog_for_app() -> dict:
    """Returns full catalog for the app (names, descriptions, icons)."""
    return BADGE_CATALOG
