"""
Shared pytest fixtures for the Student Management System tests.
Uses moto to mock DynamoDB so tests run locally without AWS credentials.
"""

import json
import os
import pytest
import boto3
from moto import mock_aws


@pytest.fixture(autouse=True)
def aws_env(monkeypatch):
    """Set dummy AWS credentials and config for moto."""
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_SECURITY_TOKEN", "testing")
    monkeypatch.setenv("AWS_SESSION_TOKEN", "testing")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "ap-south-1")
    monkeypatch.setenv("AWS_REGION", "ap-south-1")
    monkeypatch.setenv("DYNAMODB_TABLE_NAME", "Students")


@pytest.fixture
def dynamodb_table(aws_env):
    """Create a mocked DynamoDB Students table and return the table resource."""
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
        table = dynamodb.create_table(
            TableName="Students",
            KeySchema=[{"AttributeName": "student_id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "student_id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        table.meta.client.get_waiter("table_exists").wait(TableName="Students")
        yield table


@pytest.fixture
def sample_student_body():
    """Return a valid student request body as a dict."""
    return {
        "first_name": "Rahul",
        "last_name": "Sharma",
        "email": "rahul.sharma@example.com",
        "age": 21,
        "course": "Computer Science",
    }


@pytest.fixture
def api_event(sample_student_body):
    """Build a minimal API Gateway proxy event."""
    def _make_event(method="POST", body=None, path_params=None):
        event = {
            "httpMethod": method,
            "body": json.dumps(body) if body else None,
            "pathParameters": path_params,
            "headers": {"Content-Type": "application/json"},
        }
        return event
    return _make_event
