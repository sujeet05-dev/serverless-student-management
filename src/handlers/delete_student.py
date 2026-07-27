"""
Delete Student Lambda Handler
Handles DELETE /students/{student_id} requests to remove student records.
Uses a ConditionExpression to return 404 if the student does not exist.
"""

import logging

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


def lambda_handler(event, context):
    """
    AWS Lambda entry point for deleting a student.

    Expects:
      • Path parameter:  student_id

    Returns:
        200 OK — Student deleted successfully (returns the deleted record).
        400 Bad Request — Missing student_id in path.
        404 Not Found — Student does not exist.
        500 Internal Server Error — Unexpected failure.
    """
    logger.info("DeleteStudent — invoked")

    # ── Extract student_id ───────────────────
    path_params = event.get("pathParameters") or {}
    student_id = path_params.get("student_id")
    if not student_id:
        return bad_request("Missing student_id in path")

    # ── Extract admin_id ─────────────────────
    admin_id = event.get("requestContext", {}).get("authorizer", {}).get("claims", {}).get("sub")
    if not admin_id:
        logger.error("Could not find Cognito sub in authorizer claims")
        return internal_error("Could not determine user identity")

    # ── Delete from DynamoDB ─────────────────
    try:
        table = get_table()
        response = table.delete_item(
            Key={"student_id": student_id},
            # ConditionExpression ensures the item exists AND belongs to the current user
            ConditionExpression="attribute_exists(student_id) AND admin_id = :admin_id",
            ExpressionAttributeValues={":admin_id": admin_id},
            ReturnValues="ALL_OLD",
        )
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            logger.info("Student not found for deletion: %s", student_id)
            return not_found(f"Student with ID '{student_id}' not found")
        logger.error("DynamoDB delete_item failed: %s", exc)
        return internal_error("Failed to delete student record")
    except ConnectionError as exc:
        logger.error("DynamoDB connection failed: %s", exc)
        return internal_error("Database connection failed")

    deleted_student = response.get("Attributes", {})
    logger.info("Student deleted: %s", student_id)
    return success({
        "message": "Student deleted successfully",
        "student": deleted_student,
    })
