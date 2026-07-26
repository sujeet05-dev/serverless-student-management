# Architecture Documentation

## System Overview

This project implements a serverless Student Management System using AWS managed services.

## Request Flow

```
Client (Postman)
    │
    ▼
API Gateway (REST API)
    │  - Routes HTTP requests to the correct Lambda
    │  - Handles CORS headers
    │  - Validates request format
    │
    ▼
AWS Lambda (Python 3.11)
    │  - Processes business logic
    │  - Validates input data
    │  - Interacts with DynamoDB via boto3
    │
    ▼
Amazon DynamoDB (Students Table)
    │  - Stores student records
    │  - Partition Key: student_id (String/UUID)
    │  - On-Demand capacity mode
    │
    ▼
Amazon CloudWatch
       - Captures Lambda logs
       - Tracks metrics (invocations, errors, duration)
       - Triggers alarms on anomalies
```

## IAM Security Model

```
IAM Role: StudentManagementLambdaRole
    │
    ├── Trust Policy: Allows Lambda service to assume this role
    │
    ├── Custom Policy: StudentManagementDynamoDBPolicy
    │   ├── DynamoDB: PutItem, GetItem, UpdateItem, DeleteItem, Scan, Query
    │   │   └── Scoped to: arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Students
    │   │
    │   └── CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents
    │       └── Scoped to: arn:aws:logs:REGION:ACCOUNT_ID:*
    │
    └── No other permissions (least privilege)
```

## DynamoDB Table Schema

| Attribute        | Type   | Description                  |
|-----------------|--------|------------------------------|
| student_id (PK) | String | UUID — unique identifier     |
| first_name      | String | Student's first name         |
| last_name       | String | Student's last name          |
| email           | String | Student's email address      |
| age             | Number | Student's age                |
| course          | String | Enrolled course name         |
| enrollment_date | String | ISO 8601 date                |
| created_at      | String | ISO 8601 timestamp           |
| updated_at      | String | ISO 8601 timestamp           |
