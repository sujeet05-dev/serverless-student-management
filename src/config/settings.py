"""
Application Settings
Environment-based configuration for the Student Management System.
Reads from Lambda environment variables with local development fallbacks.
"""

import os


# ──────────────────────────────────────────────
# AWS Configuration
# ──────────────────────────────────────────────
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-1")

# ──────────────────────────────────────────────
# DynamoDB Configuration
# ──────────────────────────────────────────────
DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME", "Students")

# ──────────────────────────────────────────────
# Application Configuration
# ──────────────────────────────────────────────
APP_NAME = "Student Management System"
APP_VERSION = "1.0.0"
