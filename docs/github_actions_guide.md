# Phase 5: CI/CD Pipeline with GitHub Actions

This guide will walk you through setting up an automatic system that **tests and deploys your code** every time you push it to GitHub. No more manually typing `sam deploy`!

---

## Part A: Push Your Project to GitHub

### Step 1: Create a GitHub Account (Skip if you already have one)
1. Go to [github.com](https://github.com) in your browser.
2. Click **Sign Up** and create a free account.

### Step 2: Create a New Repository
1. After logging in, click the **+** button in the top-right corner and select **New repository**.
2. Fill in these details:
   - **Repository name**: `serverless-student-management`
   - **Description**: `A serverless CRUD application built on AWS`
   - **Visibility**: Select **Public** (so you can show it in your portfolio!) or **Private** if you prefer.
   - **DO NOT** check "Add a README file" (we already have one).
3. Click **Create repository**.
4. GitHub will show you a page with some commands. **Keep this page open** — you will need the URL it shows you. It will look something like:
   ```
   https://github.com/YOUR_USERNAME/serverless-student-management.git
   ```

### Step 3: Install Git (Skip if you already have it)
1. Open your Command Prompt and type:
   ```cmd
   git --version
   ```
2. If it shows a version number (like `git version 2.x.x`), you already have Git! Skip to Step 4.
3. If it says "not recognized", download Git from [git-scm.com](https://git-scm.com/download/win) and install it. **Close and reopen your Command Prompt** after installing.

### Step 4: Upload Your Code to GitHub
Open your Command Prompt and type these commands **one by one**, pressing Enter after each:

```cmd
cd "c:\Serverless management system"
```

```cmd
git init
```
> This tells Git: "Start tracking this folder."

```cmd
git add .
```
> This tells Git: "Include all my files."

```cmd
git commit -m "Initial commit - Full serverless student management system"
```
> This tells Git: "Save a snapshot of all my files with this message."

```cmd
git branch -M main
```
> This renames the default branch to "main".

```cmd
git remote add origin https://github.com/YOUR_USERNAME/serverless-student-management.git
```
> **IMPORTANT:** Replace `YOUR_USERNAME` with your actual GitHub username and the URL with the one GitHub showed you in Step 2.

```cmd
git push -u origin main
```
> This uploads everything to GitHub! It may ask for your GitHub username and password (or a Personal Access Token — see the note below).

> **If GitHub asks for a password**, it actually wants a **Personal Access Token (PAT)**, not your regular password. To create one:
> 1. Go to GitHub → Click your profile picture → **Settings** → **Developer settings** (at the very bottom of the left sidebar) → **Personal access tokens** → **Tokens (classic)**.
> 2. Click **Generate new token (classic)**.
> 3. Give it a name like `my-laptop`, check the **repo** checkbox, and click **Generate token**.
> 4. **Copy the token** and paste it when the terminal asks for your password.

### Step 5: Verify
Go back to your GitHub page in the browser and **refresh it**. You should see all your project files there!

---

## Part B: Store Your AWS Credentials in GitHub

GitHub Actions needs your AWS Access Key and Secret Key to deploy to AWS, but we **never** put passwords directly in code. Instead, we store them as **Secrets** that only GitHub can see.

### Step 6: Add AWS Secrets to GitHub
1. On your GitHub repository page, click the **Settings** tab (the gear icon at the top).
2. In the left sidebar, click **Secrets and variables** → **Actions**.
3. Click the **New repository secret** button.
4. Add the first secret:
   - **Name**: `AWS_ACCESS_KEY_ID`
   - **Secret**: Paste your AWS Access Key ID (the same one you used during `aws configure`).
   - Click **Add secret**.
5. Click **New repository secret** again and add the second secret:
   - **Name**: `AWS_SECRET_ACCESS_KEY`
   - **Secret**: Paste your AWS Secret Access Key.
   - Click **Add secret**.
6. Click **New repository secret** one more time:
   - **Name**: `AWS_REGION`
   - **Secret**: `ap-south-1` (or whatever region you are using).
   - Click **Add secret**.

You should now see 3 secrets listed on the page.

---

## Part C: Create the GitHub Actions Workflow File

This is a special file that tells GitHub: "When new code is pushed, run these steps automatically."

### Step 7: Create the Workflow File
1. In your project folder on your computer, create these folders and file:
   ```
   c:\Serverless management system\.github\workflows\deploy.yml
   ```
   - First, create a folder called `.github` inside your project folder.
   - Inside `.github`, create a folder called `workflows`.
   - Inside `workflows`, create a file called `deploy.yml`.

2. Open `deploy.yml` in Notepad (or your code editor) and paste this exact content:

```yaml
name: Test and Deploy

on:
  push:
    branches:
      - main

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest

    steps:
      # Step 1: Download our code
      - name: Checkout code
        uses: actions/checkout@v4

      # Step 2: Install Python
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      # Step 3: Install test dependencies
      - name: Install dependencies
        run: pip install -r requirements.txt

      # Step 4: Run our unit tests
      - name: Run tests
        run: pytest tests/ -v

      # Step 5: Install SAM CLI
      - name: Set up SAM CLI
        uses: aws-actions/setup-sam@v2

      # Step 6: Log into AWS
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      # Step 7: Build the SAM application
      - name: SAM Build
        run: sam build

      # Step 8: Deploy to AWS
      - name: SAM Deploy
        run: sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
```

3. **Save** the file.

### Step 8: Push This New File to GitHub
Open your Command Prompt again:

```cmd
cd "c:\Serverless management system"
```

```cmd
git add .
```

```cmd
git commit -m "Add CI/CD pipeline with GitHub Actions"
```

```cmd
git push
```

---

## Part D: Watch the Magic Happen!

### Step 9: See Your Pipeline Run
1. Go to your GitHub repository page in the browser.
2. Click the **Actions** tab at the top.
3. You should see a workflow running called **"Test and Deploy"** with an orange spinning circle.
4. Click on it to watch each step in real-time!
5. If everything passes, all steps will show green checkmarks.

### What Happens Now?
From this point forward, every time you make a change to your code and run `git push`, GitHub will automatically:
1. Run your unit tests
2. Deploy your updated code to AWS

**You never need to type `sam deploy` manually again!**

> **WARNING:** If any test fails, the pipeline will **stop** and will NOT deploy the broken code to AWS. This protects you from accidentally breaking your live application! You can check the **Actions** tab to see which test failed and why.

---

## Summary of What You Need to Do

| Step | What to Do | Where |
|------|-----------|-------|
| 1-2 | Create GitHub account and repository | Browser (github.com) |
| 3 | Install Git | Command Prompt |
| 4 | Push your code to GitHub | Command Prompt |
| 5 | Verify code is on GitHub | Browser |
| 6 | Add 3 AWS secrets | Browser (GitHub Settings) |
| 7 | Create the workflow file | Your computer (Notepad/editor) |
| 8 | Push the workflow file | Command Prompt |
| 9 | Watch the pipeline run! | Browser (GitHub Actions tab) |
