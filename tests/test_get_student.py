"""Tests for the Get Student Lambda handler."""

import json
import pytest
from moto import mock_aws


@mock_aws
class TestGetStudent:
    """Test suite for GET /students and GET /students/{student_id}."""

    def _seed_student(self, dynamodb_table, student_id="test-id-123"):
        """Insert a test student directly into the mocked table."""
        dynamodb_table.put_item(Item={
            "student_id": student_id,
            "admin_id": "test-admin-123",
            "first_name": "Priya",
            "last_name": "Patel",
            "email": "priya@example.com",
            "age": 20,
            "course": "Mathematics",
            "enrollment_date": "2026-01-15",
            "created_at": "2026-01-15T00:00:00+00:00",
            "updated_at": "2026-01-15T00:00:00+00:00",
        })

    def _invoke(self, api_event, dynamodb_table, path_params=None):
        """Helper to import and invoke the handler inside the mock context."""
        import src.utils.db as db_module
        db_module._dynamodb_resource = None
        db_module._table = None

        from src.handlers.get_student import lambda_handler
        event = api_event(method="GET", path_params=path_params)
        return lambda_handler(event, None)

    def test_get_single_student_success(self, api_event, dynamodb_table):
        """Fetching an existing student by ID returns 200 with the record."""
        self._seed_student(dynamodb_table)
        response = self._invoke(api_event, dynamodb_table, path_params={"student_id": "test-id-123"})

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["student"]["first_name"] == "Priya"
        assert body["student"]["student_id"] == "test-id-123"

    def test_get_single_student_not_found(self, api_event, dynamodb_table):
        """Fetching a non-existent student returns 404."""
        response = self._invoke(api_event, dynamodb_table, path_params={"student_id": "nonexistent"})

        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "not found" in body["error"]

    def test_list_all_students_empty(self, api_event, dynamodb_table):
        """Listing students on an empty table returns 200 with count 0."""
        response = self._invoke(api_event, dynamodb_table)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["count"] == 0
        assert body["students"] == []

    def test_list_all_students_multiple(self, api_event, dynamodb_table):
        """Listing students returns all seeded records."""
        self._seed_student(dynamodb_table, student_id="id-1")
        self._seed_student(dynamodb_table, student_id="id-2")
        self._seed_student(dynamodb_table, student_id="id-3")

        response = self._invoke(api_event, dynamodb_table)

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["count"] == 3
        assert len(body["students"]) == 3
