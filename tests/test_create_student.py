"""Tests for the Create Student Lambda handler."""

import json
import pytest
from moto import mock_aws


@mock_aws
class TestCreateStudent:
    """Test suite for POST /students."""

    def _invoke(self, api_event, dynamodb_table, body=None):
        """Helper to import and invoke the handler inside the mock context."""
        # Import inside mock context so the handler picks up the mocked DynamoDB
        import importlib
        import src.utils.db as db_module

        # Reset singleton so it reconnects to the mocked DynamoDB
        db_module._dynamodb_resource = None
        db_module._table = None

        from src.handlers.create_student import lambda_handler
        event = api_event(method="POST", body=body)
        return lambda_handler(event, None)

    def test_create_student_success(self, api_event, dynamodb_table, sample_student_body):
        """Creating a student with valid data returns 201 and the student record."""
        response = self._invoke(api_event, dynamodb_table, body=sample_student_body)

        assert response["statusCode"] == 201
        body = json.loads(response["body"])
        assert body["message"] == "Student created successfully"
        assert body["student"]["first_name"] == "Rahul"
        assert body["student"]["email"] == "rahul.sharma@example.com"
        assert "student_id" in body["student"]
        assert "created_at" in body["student"]

    def test_create_student_missing_fields(self, api_event, dynamodb_table):
        """Missing required fields returns 400."""
        incomplete_body = {"first_name": "Rahul"}
        response = self._invoke(api_event, dynamodb_table, body=incomplete_body)

        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "Missing required fields" in body["error"]

    def test_create_student_empty_body(self, api_event, dynamodb_table):
        """Empty request body returns 400."""
        response = self._invoke(api_event, dynamodb_table, body={})

        assert response["statusCode"] == 400

    def test_create_student_invalid_json(self, api_event, dynamodb_table):
        """Invalid JSON in request body returns 400."""
        event = api_event(method="POST")
        event["body"] = "not valid json {{"

        import src.utils.db as db_module
        db_module._dynamodb_resource = None
        db_module._table = None

        from src.handlers.create_student import lambda_handler
        response = lambda_handler(event, None)

        assert response["statusCode"] == 400
        body = json.loads(response["body"])
        assert "valid JSON" in body["error"]

    def test_create_student_email_lowercase(self, api_event, dynamodb_table, sample_student_body):
        """Email addresses are normalized to lowercase."""
        sample_student_body["email"] = "RAHUL@EXAMPLE.COM"
        response = self._invoke(api_event, dynamodb_table, body=sample_student_body)

        body = json.loads(response["body"])
        assert body["student"]["email"] == "rahul@example.com"

    def test_create_student_stored_in_dynamodb(self, api_event, dynamodb_table, sample_student_body):
        """Verify the student is actually stored in DynamoDB."""
        response = self._invoke(api_event, dynamodb_table, body=sample_student_body)

        body = json.loads(response["body"])
        student_id = body["student"]["student_id"]

        # Verify the record exists in the table
        item = dynamodb_table.get_item(Key={"student_id": student_id})
        assert "Item" in item
        assert item["Item"]["first_name"] == "Rahul"
