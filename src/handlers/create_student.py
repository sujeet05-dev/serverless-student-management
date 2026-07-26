"""
Create Student Lambda Handler
Handles POST /students requests to create a new student record in DynamoDB.
"""

import json
import uuid
import logging
from datetime import datetime, timezone

from botocore.exceptions import ClientError

import sys
import os

# Allow imports from the src directory when running inside Lambda
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.db import get_table
from utils.response import created, bad_request, internal_error

# ──────────────────────────────────────────────
# Logger
# ──────────────────────────────────────────────
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Fields that must be present in the request body
REQUIRED_FIELDS = ["first_name", "last_name", "email", "age", "course"]


def lambda_handler(event, context):
    """
    AWS Lambda entry point for creating a new student.

    Expects a JSON body with: first_name, last_name, email, age, course.
    Optionally accepts: enrollment_date.

    Returns:
        201 Created  — Student record successfully created.
        400 Bad Request — Missing or invalid request body.
        500 Internal Server Error — Unexpected failure.
    """
    logger.info("CreateStudent — invoked")

    # ── Parse request body ───────────────────
    try:
        body = json.loads(event.get("body", "{}") or "{}")
    except (json.JSONDecodeError, TypeError) as exc:
        logger.error("Invalid JSON in request body: %s", exc)
        return bad_request("Request body must be valid JSON")

    # ── Validate required fields ─────────────
    missing = [f for f in REQUIRED_FIELDS if f not in body or body[f] == ""]
    if missing:
        logger.warning("Missing required fields: %s", missing)
        return bad_request(f"Missing required fields: {', '.join(missing)}")

    # ── Build the student record ─────────────
    now = datetime.now(timezone.utc).isoformat()
    student = {
        "student_id": str(uuid.uuid4()),
        "first_name": str(body["first_name"]).strip(),
        "last_name": str(body["last_name"]).strip(),
        "email": str(body["email"]).strip().lower(),
        "age": int(body["age"]),
        "course": str(body["course"]).strip(),
        "enrollment_date": body.get("enrollment_date", now[:10]),  # default to today
        "created_at": now,
        "updated_at": now,
    }

    # ── Write to DynamoDB ────────────────────
    try:
        table = get_table()
        table.put_item(Item=student)
        logger.info("Student created: %s", student["student_id"])
    except (ClientError, ConnectionError) as exc:
        logger.error("DynamoDB put_item failed: %s", exc)
        return internal_error("Failed to create student record")

    return created({
        "message": "Student created successfully",
        "student": student,
    })
