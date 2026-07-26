# AWS SAM Deployment Guide

Welcome to Phase 2! We are now using **Infrastructure as Code** with a tool called **AWS SAM (Serverless Application Model)**.

In Phase 1, you had to manually click through the AWS Console to create your database, IAM roles, and Lambdas. With AWS SAM, the entire system is built automatically using the instructions we wrote in the `template.yaml` file.

Follow these simple steps to deploy your completely automated project!

---

## Step 1: Install Required Tools

To talk to AWS from your computer, you need two tools installed.

### 1. Install the AWS CLI (Command Line Interface)
This tool lets your computer securely sign into your AWS account.
- **Windows:** Download and run the 64-bit installer from the [official AWS CLI page](https://awscli.amazonaws.com/AWSCLIV2.msi).
- Open your terminal (Command Prompt or PowerShell) and type `aws configure`.
- Enter your **Access Key ID**, **Secret Access Key**, default region (e.g., `ap-south-1`), and output format (type `json`).

### 2. Install the AWS SAM CLI
This tool reads our `template.yaml` file and sends it to AWS.
- **Windows:** Download and run the installer from the [official AWS SAM page](https://github.com/aws/aws-sam-cli/releases/latest/download/AWS_SAM_CLI_64_PY3.msi).

---

## Step 2: Deploy Your Project

Now for the magic! We will deploy everything with one single command.

1. Open your terminal and navigate to your project folder (where the `template.yaml` file is located).
2. Type the following command and press Enter:

   ```bash
   sam deploy --guided
   ```

3. SAM will ask you a series of questions. You can just hit **Enter** for most of them to accept the default settings. Here is exactly how to answer:

   - **Stack Name**: Type `student-management-sam` and press Enter.
   - **AWS Region**: Press Enter to accept your default (e.g., `ap-south-1`).
   - **Confirm changes before deploy**: Press `y` and Enter.
   - **Allow SAM CLI IAM role creation**: Press `y` and Enter. (SAM is creating our security roles for us!)
   - **Disable rollback**: Press Enter (default `N`).
   - **CreateStudentFunction may not have authorization defined, Is this okay?**: Press `y` and Enter. (Do this for all 4 functions it asks about).
   - **Save arguments to configuration file**: Press Enter (`Y`).
   - **SAM configuration file**: Press Enter (`samconfig.toml`).
   - **SAM configuration environment**: Press Enter (`default`).

4. SAM will now show you a summary of everything it is going to build. It will ask: `Deploy this changeset? [y/N]`.
5. Press **`y`** and hit Enter!

Now, sit back and watch. SAM will zip your code, create your DynamoDB table, create your IAM roles, build your API Gateway, and link everything together automatically. This usually takes about 2-3 minutes.

---

## Step 3: Test Your New API!

When the deployment finishes, look at the very bottom of the terminal output. You will see an **Outputs** section that looks something like this:

```
-----------------------------------------------------------------------------------------
Outputs
-----------------------------------------------------------------------------------------
Key                 ApiURL
Description         Your New API Gateway Invoke URL
Value               https://xyz123abc.execute-api.ap-south-1.amazonaws.com/Prod
-----------------------------------------------------------------------------------------
```

1. **Copy** that URL.
2. Open **Postman**.
3. Go to your Collection Variables (just like you did in Phase 1) and paste this brand new URL into the `base_url` variable.
4. Run your `POST` request to create a student, and then your `GET` request to verify!

You've successfully deployed a fully automated Serverless application! 🎉
