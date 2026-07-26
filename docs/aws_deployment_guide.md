# AWS Deployment Guide for Serverless Student Management System

This document contains the step-by-step instructions for deploying your serverless application to AWS, as discussed in our chat.

---

## Step 1: Create the DynamoDB Table
1. Log in to the **AWS Management Console** and search for **DynamoDB**.
2. Make sure you are in the **`ap-south-1` (Asia Pacific - Mumbai)** region (or your preferred region).
3. Click on the **Create table** button.
4. Configure the following settings:
   - **Table name**: `Students`
   - **Partition key**: `student_id` (Type: `String`)
   - Leave the other settings as their defaults.
5. Click **Create table** and wait for its status to become "Active".

---

## Step 2: Create the IAM Execution Role
Your Lambda functions need permission to read/write to the DynamoDB table and write logs to CloudWatch.

1. In the AWS Console, search for and open **IAM**.
2. In the left sidebar, click **Roles**, then click the **Create role** button.
3. For the trusted entity type, select **AWS service**, then choose **Lambda**. Click **Next**.
4. Click **Create policy** (this will open a new tab).
5. Switch to the **JSON** editor. Delete the placeholder JSON and paste the exact contents of your `iam/lambda_execution_role.json` file.
6. Click **Next**, name the policy `StudentManagementDynamoDBPolicy`, and click **Create policy**.
7. Go back to your original "Create role" tab. Hit the refresh button, search for `StudentManagementDynamoDBPolicy`, check the box next to it, and click **Next**.
8. Name the role **`StudentManagementLambdaRole`** and click **Create role**.

---

## Step 3: Zipping Your Code
AWS Lambda needs your code packaged up in a single `.zip` file so it can upload it all at once. 

1. Open your File Explorer on your computer and navigate to your project folder.
2. Open the **`src`** folder.
3. You should see three folders: `config`, `handlers`, and `utils`.
4. **Select all three of these folders at the same time.** 
5. **Right-click** on the selected folders and click **"Compress to ZIP file"** (or "Send to" -> "Compressed (zipped) folder").
6. Name this new file `my_code.zip`.

---

## Step 4: Create the 4 Lambda Functions
1. Search for and open **AWS Lambda** in the console.
2. For **each** of the four functions below, click **Create function**:
   - Choose **Author from scratch**.
   - **Runtime**: Select `Python 3.11`.
   - **Permissions**: Expand "Change default execution role", select **Use an existing role**, and choose `StudentManagementLambdaRole`.
   - Click **Create function**.

Create these four functions:
*   `CreateStudent`
*   `GetStudent`
*   `UpdateStudent`
*   `DeleteStudent`

**For all four functions, configure the following:**

1.  **Add the Environment Variable:**
    - Go to the **Configuration** tab, select **Environment variables**, and click **Edit**.
    - Add a variable with Key: `DYNAMODB_TABLE_NAME` and Value: `Students`. Save.
2.  **Upload the Zip file:**
    - Go to the **Code** tab.
    - Click **Upload from** -> **.zip file**.
    - Upload the `my_code.zip` file you created in Step 3.
3.  **Set the Handler:**
    - Scroll down to the **Runtime settings** section and click **Edit**.
    - Delete the default text (`lambda_function.lambda_handler`).
    - Type in the correct address for the function:
        - For `CreateStudent`: `handlers.create_student.lambda_handler`
        - For `GetStudent`: `handlers.get_student.lambda_handler`
        - For `UpdateStudent`: `handlers.update_student.lambda_handler`
        - For `DeleteStudent`: `handlers.delete_student.lambda_handler`
    - Click **Save**.

---

## Step 5: Create API Gateway REST API
1. Search for and open **API Gateway** in the AWS Console.
2. Find **REST API** (the one that does *not* say Private) and click **Build**.
3. Select **New API**, name it `StudentManagementAPI`, and click **Create API**.

**Create the `/students` resource:**
1. Click **Actions** -> **Create Resource**.
2. Resource Name: `students`. Click Create.
3. With `/students` selected, click **Create Method** -> `POST`.
    - Integration type: Lambda Function, Region: `ap-south-1`
    - Lambda Function: type `CreateStudent` and save.
4. With `/students` selected, click **Create Method** -> `GET`.
    - Point it to the `GetStudent` Lambda function.

**Create the `/students/{student_id}` resource:**
1. Select the `/students` resource you just made, then click **Create Resource**.
2. Resource Name: `student_id`, Resource Path: `{student_id}`. Click Create.
3. With `/{student_id}` selected, add these three methods:
    - Method `GET` -> `GetStudent`
    - Method `PUT` -> `UpdateStudent`
    - Method `DELETE` -> `DeleteStudent`

**Enable CORS & Deploy:**
1. Select the `/students` resource, click **Actions** -> **Enable CORS**. Leave defaults and save.
2. Select the `/{student_id}` resource, and **Enable CORS**.
3. Click **Actions** -> **Deploy API**.
4. Deployment stage: `[New Stage]`, Stage name: `dev`. Click Deploy.
5. Copy the **Invoke URL** at the top of the screen.

---

## Step 6: Test Endpoints with Postman
1. Open Postman.
2. Import the `postman/StudentManagementSystem.postman_collection.json` file.
3. Update the `base_url` variable with your **Invoke URL**.
4. Run the requests in order to test the system.

---

## Appendix: Estimated AWS Costs (ap-south-1)

| AWS Service | AWS Free Tier (Per Month) | Pay-As-You-Go Cost (Beyond Free Tier) |
| :--- | :--- | :--- |
| **AWS Lambda** | **1,000,000 requests**<br>400,000 GB-seconds compute | **~$0.20** per 1 million requests. |
| **API Gateway** | **1,000,000 API calls** *(First 12 months)* | **$3.50** per 1 million API calls. |
| **DynamoDB** | **25 GB** storage. *(Applies to Provisioned Capacity)* | **~$1.41** per 1 million writes.<br>**~$0.28** per 1 million reads. |
| **CloudWatch** | **5 GB** ingested & stored.<br>3 Custom Dashboards. | **$0.57** per GB ingested. |
| **AWS IAM** | **Always Free** | **$0.00** |

*Estimated monthly cost for a learning/portfolio project: $0.00*
