# 🎓 Serverless Student Management System

A full-stack, enterprise-grade Serverless CRUD Application built on **AWS** featuring a modern **Glassmorphic Frontend**, **Amazon Cognito Authentication**, **Infrastructure as Code (AWS SAM)**, and an automated **CI/CD Pipeline (GitHub Actions)**.

---

## 🌟 Key Features & Tech Stack

### 🚀 Backend & Cloud Architecture
- **AWS Lambda (Python 3.11)** — Serverless compute handlers for CRUD operations (`Create`, `Read`, `Update`, `Delete`).
- **Amazon API Gateway** — RESTful API endpoints with CORS and Cognito Authorizers.
- **Amazon DynamoDB** — Fast, single-table NoSQL database with auto-scaling pay-per-request capacity.
- **Amazon Cognito** — Enterprise-grade authentication with User Pools, OAuth2 implicit flow, and Hosted UI login.
- **AWS SAM (Serverless Application Model)** — Infrastructure as Code (IaC) to define and deploy all cloud resources automatically.

### 🎨 Frontend Web Application
- **Modern Glassmorphic UI** — Sleek dark-mode dashboard with vibrant gradients and subtle micro-animations.
- **Student Dashboard** — Form to enroll new students with multiple course selections (Artificial Intelligence, Machine Learning, Cloud Computing, IoT, Computer Science, Data Science, Software Engineering).
- **Student Management Table** — View enrolled students, search instantly by name/email/course, open detailed modal popups, and edit student records.
- **Authentication Integration** — Automatic login redirection and JWT token authorization headers.

### 🔄 DevOps & CI/CD
- **Pytest Suite** — Unit tests covering API response handlers and DynamoDB operations.
- **GitHub Actions Pipeline** — Automated CI/CD workflow that runs tests and deploys code to AWS on every push to `main`.

---

## 📐 Architecture Overview

```
Client (Browser / Postman)
      │
      ▼
Amazon Cognito (Hosted UI) ──► JWT Auth Token
      │
      ▼
Amazon API Gateway (REST API + Authorizer)
      │
      ▼
AWS Lambda Functions (Python 3.11)
      │
      ▼
Amazon DynamoDB (Students Table)
```

---

## 🛣️ API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/students` | Yes | Create a new student record |
| `GET` | `/students` | Yes | List all enrolled students |
| `GET` | `/students/{student_id}` | Yes | Fetch details for a specific student |
| `PUT` | `/students/{student_id}` | Yes | Update an existing student record |
| `DELETE` | `/students/{student_id}` | Yes | Delete a student record |

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD Pipeline
├── frontend/
│   ├── index.html              # Single Page Application HTML structure
│   ├── styles.css              # Glassmorphic Dark-Mode CSS Design System
│   └── app.js                  # Frontend API & Cognito authentication logic
├── src/
│   ├── handlers/               # Lambda functions (create, get, update, delete)
│   ├── utils/                  # Shared utilities (DB connection, response formatters)
│   └── config/                 # Environment configuration
├── tests/                      # Pytest unit testing suite
├── iam/                        # IAM policy documents
├── postman/                    # Postman collection export
└── template.yaml               # AWS SAM Infrastructure as Code configuration
```

---

## 🛠️ Local Development & Deployment Guide

### Prerequisites
1. **Python 3.11** installed.
2. **AWS CLI** configured (`aws configure`).
3. **AWS SAM CLI** installed.

### 1. Deploy Cloud Stack (AWS SAM)
Deploy the entire infrastructure (DynamoDB, API Gateway, Cognito, Lambdas) to AWS with a single command:

```bash
sam deploy --guided
```

### 2. Configure Frontend
Open `frontend/app.js` and set your deployment variables output by SAM:
```javascript
const API_BASE_URL = "https://<YOUR-API-ID>.execute-api.ap-south-1.amazonaws.com/Prod";
const COGNITO_DOMAIN = "https://<YOUR-COGNITO-DOMAIN>.auth.ap-south-1.amazoncognito.com";
const CLIENT_ID = "<YOUR-COGNITO-CLIENT-ID>";
```

### 3. Run Frontend Locally
Navigate to the `frontend/` directory and start a local HTTP server:

```bash
cd frontend
python -m http.server 8000
```
Open **`http://localhost:8000`** in your browser to log in and manage students!

---

## ⚙️ Automated CI/CD (GitHub Actions)

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`). 

Every time code is pushed to the `main` branch:
1. Automated unit tests (`pytest`) are executed.
2. AWS credentials are securely verified using GitHub Secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`).
3. AWS SAM builds and deploys the updated stack automatically.

---

## ✅ Status

🎉 **Project Complete!** All 5 Phases implemented (Core Backend, IaC with SAM, Frontend Dashboard, Cognito Authentication, and GitHub Actions CI/CD Pipeline).
