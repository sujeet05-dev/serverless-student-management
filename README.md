# Serverless Student Management System

A serverless CRUD application built on AWS as a hands-on learning project.

## Architecture

- **AWS Lambda** — Serverless compute (Python 3.11 runtime)
- **Amazon API Gateway** — RESTful API endpoint
- **Amazon DynamoDB** — NoSQL database
- **Amazon CloudWatch** — Monitoring & logging
- **IAM** — Security & access control

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/students` | Create a new student |
| GET | `/students` | List all students |
| GET | `/students/{student_id}` | Get a specific student |
| PUT | `/students/{student_id}` | Update a student |
| DELETE | `/students/{student_id}` | Delete a student |

## Project Structure

```
├── src/
│   ├── handlers/          # Lambda function handlers
│   ├── utils/             # Shared utilities (db, response, validator)
│   └── config/            # Environment-based settings
├── tests/                 # Unit tests
├── iam/                   # IAM policy documents
├── postman/               # Postman collection exports
└── docs/                  # Documentation
```

## Setup

### Phase 2 (Automated Setup via AWS SAM) - **Recommended**
We have upgraded the project to use **Infrastructure as Code**.
Please follow the extremely simple [SAM Deployment Guide](docs/sam_deployment_guide.md) to automatically deploy this entire project with just one command!

### Phase 1 (Legacy Manual Setup)
For manual deployment instructions using the AWS Console, refer to the [AWS Deployment Guide](docs/aws_deployment_guide.md).

## Status

🚧 **Phase 4** — Authentication & Security with Amazon Cognito (In Progress)
