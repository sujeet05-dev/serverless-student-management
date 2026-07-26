"""
API Response Builder
====================
Creates standardized HTTP responses for API Gateway Lambda Proxy Integration.
"""

import json
from decimal import Decimal


class DecimalEncoder(json.JSONEncoder):
    """
    Custom JSON encoder to handle DynamoDB Decimal types.
    Converts Decimals to int (if whole number) or float for JSON serialization.
    """

    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super().default(obj)


# ──────────────────────────────────────────────
# Standard CORS headers
# ──────────────────────────────────────────────
CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}


def build_response(status_code, body):
    """
    Build a standardized API Gateway response.

    Args:
        status_code (int): HTTP status code (200, 201, 400, 404, 500, etc.)
        body (dict | list | str): Response payload — will be serialized to JSON string

    Returns:
        dict: Properly formatted API Gateway response
    """
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder),
    }


# ──────────────────────────────────────────────
# Convenience functions for responses
# ──────────────────────────────────────────────
def success(body, status_code=200):
    """Shortcut for a 200 OK response."""
    return build_response(status_code, body)


def created(body):
    """Shortcut for a 201 Created response."""
    return build_response(201, body)


def bad_request(message="Bad request"):
    """Shortcut for a 400 Bad Request response."""
    return build_response(400, {"error": message})


def not_found(message="Resource not found"):
    """Shortcut for a 404 Not Found response."""
    return build_response(404, {"error": message})


def internal_error(message="Internal server error"):
    """Shortcut for a 500 Internal Server Error response."""
    return build_response(500, {"error": message})


def success_response(data, message="Operation successful", status_code=200):
    """Structured success response wrapper."""
    return build_response(status_code, {
        "message": message,
        "data": data,
    })


def error_response(message, status_code=400, errors=None):
    """Structured error response wrapper."""
    body = {"error": message}
    if errors:
        body["errors"] = errors
    return build_response(status_code, body)
