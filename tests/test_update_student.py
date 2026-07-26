"""Tests for the Update Student Lambda handler."""

import json
import pytest
from moto import mock_aws


@mock_aws
class TestUpdateStudent:
    """Test suite for PUT /students/{student_id}."""

    def _seed_student(self, dynamodb_table, student_id="test-id-456"):
        """Insert a test student directly into the mocked table."""
        dynamodb_table.put_item(Item={
            "student_id": student_id,
            "first_name": "Amit",
            "last_name": "Kumar",
            "email": "amit@example.com",
            "age": 22,
            "course": "Physics",
            "enrollment_date": "2026-01-15",
            "created_at": "2026-01-15T00:00:00+00:00",
            "updated_at": "2026-01-15T00:00:00+00:00",
        })

    def _invoke(self, api_event, dynamodb_table, student_id=None, body=None):
        """Helper to import and invoke the handler inside the mock context."""
        import src.utils.db as db_module
        db_module._dynamodb_resource = None
        db_module._table = None

        from src.handlers.update_student import lambda_handler
        path_params = {"student_id": student_id} if student_id else None
        event = api_event(method="PUT", body=body, path_params=path_params)
        return lambda_handler(event, None)

    def test_update_student_success(self, api_event, dynamodb_table):
        """Updating an existing student returns 200 with the updated record."""
        self._seed_student(dynamodb_table)
        response = self._invoke(
            api_event, dynamodb_table,
            student_id="test-id-456",
            body={"course": "Data Science", "age": 23},
        )

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["student"]["course"] == "Data Science"
        assert body["student"]["age"] == 23
        assert body["message"] == "Student updated successfully"

    def test_update_student_not_found(self, api_event, dynamodb_table):
        """Updating a non-existent student returns 404."""
        response = self._invoke(
            api_event, dynamodb_table,
            student_id="nonexistent",
            body={"course": "Art"},
        )

        assert response["statusCode"] == 404

    def test_update_student_no_valid_fields(self, api_event, dynamodb_table):
        """Sending only non-updatable fields returns 400."""
        self._seed_student(dynamodb_table)
        response = self._invoke(
            api_event, dynamodb_table,
            student_id="test-id-456",
            body={"student_id": "hacked", "created_at": "tampered"},
        )

        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "No valid fields" in body["error"]

    def test_update_student_missing_path_param(self, api_event, dynamodb_table):
        """Missing student_id in path returns 400."""
        response = self._invoke(
            api_event, dynamodb_table,
            student_id=None,
            body={"course": "Art"},
        )

        assert response["statusCode"] == 400

    def test_update_student_partial_update(self, api_event, dynamodb_table):
        """Only the specified fields are updated; others remain unchanged."""
        self._seed_student(dynamodb_table)
        response = self._invoke(
            api_event, dynamodb_table,
            student_id="test-id-456",
            body={"first_name": "Amit Kumar"},
        )

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["student"]["first_name"] == "Amit Kumar"
        # Unchanged fields should still be present
        assert body["student"]["course"] == "Physics"
        assert body["student"]["email"] == "amit@example.com"
