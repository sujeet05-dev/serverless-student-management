"""
Update Student Lambda Handler
Handles PUT /students/{student_id} requests to update student records.
Uses DynamoDB UpdateExpression for partial updates — only the fields
included in the request body are modified.
"""

import json
import logging
from datetime import datetime, timezone

from botocore.exceptions import ClientError

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.db import get_table
from utils.response import success, bad_request, not_found, internal_error

# ──────────────────────────────────────────────
# Logger
# ──────────────────────────────────────────────
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Fields the client is allowed to update (student_id, created_at are immutable)
UPDATABLE_FIELDS = ["first_name", "last_name", "email", "age", "course", "enrollment_date", "attendance_status", "attendance_records"]


def lambda_handler(event, context):
    """
    AWS Lambda entry point for updating an existing student.

    Expects:
      • Path parameter:  student_id
      • JSON body with one or more updatable fields.

    Returns:
        200 OK — Updated student record.
        400 Bad Request — Missing body or no valid fields to update.
        404 Not Found — Student does not exist.
        500 Internal Server Error — Unexpected failure.
    """
    logger.info("UpdateStudent — invoked")

    # ── Extract student_id ───────────────────
    path_params = event.get("pathParameters") or {}
    student_id = path_params.get("student_id")
    if not student_id:
        return bad_request("Missing student_id in path")

    # ── Parse request body ───────────────────
    try:
        body = json.loads(event.get("body", "{}") or "{}")
    except (json.JSONDecodeError, TypeError) as exc:
        logger.error("Invalid JSON in request body: %s", exc)
        return bad_request("Request body must be valid JSON")

    # ── Filter to updatable fields only ──────
    updates = {k: body[k] for k in UPDATABLE_FIELDS if k in body}
    if not updates:
        return bad_request(
            f"No valid fields to update. Updatable fields: {', '.join(UPDATABLE_FIELDS)}"
        )

    # Always refresh updated_at
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()

    # ── Build the UpdateExpression dynamically ─
    update_parts = []
    expr_attr_names = {}
    expr_attr_values = {}

    for idx, (key, value) in enumerate(updates.items()):
        placeholder_name = f"#f{idx}"
        placeholder_value = f":v{idx}"
        update_parts.append(f"{placeholder_name} = {placeholder_value}")
        expr_attr_names[placeholder_name] = key
        expr_attr_values[placeholder_value] = value

    update_expression = "SET " + ", ".join(update_parts)

    # ── Execute the update ───────────────────
    try:
        table = get_table()
        response = table.update_item(
            Key={"student_id": student_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expr_attr_names,
            ExpressionAttributeValues=expr_attr_values,
            # ConditionExpression ensures the item exists before updating
            ConditionExpression="attribute_exists(student_id)",
            ReturnValues="ALL_NEW",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            logger.info("Student not found for update: %s", student_id)
            return not_found(f"Student with ID '{student_id}' not found")
        logger.error("DynamoDB update_item failed: %s", exc)
        return internal_error("Failed to update student record")
    except ConnectionError as exc:
        logger.error("DynamoDB connection failed: %s", exc)
        return internal_error("Database connection failed")

    updated_student = response.get("Attributes", {})
    logger.info("Student updated: %s", student_id)
    return success({
        "message": "Student updated successfully",
        "student": updated_student,
    })
