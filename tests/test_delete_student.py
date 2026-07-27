"""Tests for the Delete Student Lambda handler."""

import json
import pytest
from moto import mock_aws


@mock_aws
class TestDeleteStudent:
    """Test suite for DELETE /students/{student_id}."""

    def _seed_student(self, dynamodb_table, student_id="test-id-789"):
        """Insert a test student directly into the mocked table."""
        dynamodb_table.put_item(Item={
            "student_id": student_id,
            "admin_id": "test-admin-123",
            "first_name": "Neha",
            "last_name": "Gupta",
            "email": "neha@example.com",
            "age": 19,
            "course": "Chemistry",
            "enrollment_date": "2026-03-01",
            "created_at": "2026-03-01T00:00:00+00:00",
            "updated_at": "2026-03-01T00:00:00+00:00",
        })

    def _invoke(self, api_event, dynamodb_table, student_id=None):
        """Helper to import and invoke the handler inside the mock context."""
        import src.utils.db as db_module
        db_module._dynamodb_resource = None
        db_module._table = None

        from src.handlers.delete_student import lambda_handler
        path_params = {"student_id": student_id} if student_id else None
        event = api_event(method="DELETE", path_params=path_params)
        return lambda_handler(event, None)

    def test_delete_student_success(self, api_event, dynamodb_table):
        """Deleting an existing student returns 200 with the deleted record."""
        self._seed_student(dynamodb_table)
        response = self._invoke(api_event, dynamodb_table, student_id="test-id-789")

        assert response["statusCode"] == 200
        body = json.loads(response["body"])
        assert body["message"] == "Student deleted successfully"
        assert body["student"]["student_id"] == "test-id-789"
        assert body["student"]["first_name"] == "Neha"

    def test_delete_student_actually_removed(self, api_event, dynamodb_table):
        """Verify the student is actually removed from DynamoDB after deletion."""
        self._seed_student(dynamodb_table)
        self._invoke(api_event, dynamodb_table, student_id="test-id-789")

        # Confirm the item no longer exists
        result = dynamodb_table.get_item(Key={"student_id": "test-id-789"})
        assert "Item" not in result

    def test_delete_student_not_found(self, api_event, dynamodb_table):
        """Deleting a non-existent student returns 404."""
        response = self._invoke(api_event, dynamodb_table, student_id="nonexistent")

        assert response["statusCode"] == 404
        body = json.loads(response["body"])
        assert "not found" in body["error"]

    def test_delete_student_missing_path_param(self, api_event, dynamodb_table):
        """Missing student_id in path returns 400."""
        response = self._invoke(api_event, dynamodb_table, student_id=None)

        assert response["statusCode"] == 400

    def test_delete_student_idempotent(self, api_event, dynamodb_table):
        """Deleting the same student twice returns 404 on the second attempt."""
        self._seed_student(dynamodb_table)

        first = self._invoke(api_event, dynamodb_table, student_id="test-id-789")
        assert first["statusCode"] == 200

        second = self._invoke(api_event, dynamodb_table, student_id="test-id-789")
        assert second["statusCode"] == 404
