"""
Get Student Lambda Handler
Handles GET /students and GET /students/{student_id} requests.
- Single student:  GET /students/{student_id}  →  200 | 404
- List all:        GET /students               →  200 (array)
"""

import logging

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from utils.db import get_table
from utils.response import success, not_found, internal_error

# ──────────────────────────────────────────────
# Logger
# ──────────────────────────────────────────────
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    """
    AWS Lambda entry point for retrieving student records.

    Route behaviour is determined by the presence of pathParameters:
      • {student_id} present → fetch a single student
      • No path parameter    → list all students (with scan pagination)

    Returns:
        200 OK — Student record(s) returned.
        404 Not Found — Student with the given ID does not exist.
        500 Internal Server Error — Unexpected failure.
    """
    logger.info("GetStudent — invoked")

    try:
        table = get_table()
    except ConnectionError as exc:
        logger.error("DynamoDB connection failed: %s", exc)
        return internal_error("Database connection failed")

    # ── Determine single vs. list mode ───────
    path_params = event.get("pathParameters") or {}
    student_id = path_params.get("student_id")
    
    admin_id = event.get("requestContext", {}).get("authorizer", {}).get("claims", {}).get("sub")
    if not admin_id:
        logger.error("Could not find Cognito sub in authorizer claims")
        return internal_error("Could not determine user identity")

    if student_id:
        return _get_single_student(table, student_id, admin_id)
    return _list_all_students(table, admin_id)


# ──────────────────────────────────────────────
# Private helpers
# ──────────────────────────────────────────────

def _get_single_student(table, student_id, admin_id):
    """Fetch a single student by student_id and verify ownership."""
    try:
        response = table.get_item(Key={"student_id": student_id})
    except ClientError as exc:
        logger.error("DynamoDB get_item failed: %s", exc)
        return internal_error("Failed to retrieve student record")

    student = response.get("Item")
    if not student or student.get("admin_id") != admin_id:
        logger.info("Student not found or access denied: %s", student_id)
        return not_found(f"Student with ID '{student_id}' not found")

    logger.info("Student retrieved: %s", student_id)
    return success({"student": student})


def _list_all_students(table, admin_id):
    """Query the AdminIndex and return all students belonging to this admin."""
    students = []
    try:
        query_kwargs = {
            "IndexName": "AdminIndex",
            "KeyConditionExpression": Key("admin_id").eq(admin_id)
        }
        while True:
            response = table.query(**query_kwargs)
            students.extend(response.get("Items", []))

            # DynamoDB returns max 1 MB per query; if there's more data,
            # LastEvaluatedKey is present and we must continue querying.
            last_key = response.get("LastEvaluatedKey")
            if not last_key:
                break
            query_kwargs["ExclusiveStartKey"] = last_key

    except ClientError as exc:
        logger.error("DynamoDB scan failed: %s", exc)
        return internal_error("Failed to retrieve student records")

    logger.info("Listed %d student(s)", len(students))
    return success({
        "count": len(students),
        "students": students,
    })
