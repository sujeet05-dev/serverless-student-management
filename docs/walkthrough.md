# Phase 4 Complete: Authentication & Security! 🔒

We have successfully locked down your Student Management System! Your API and web dashboard are now protected by **Amazon Cognito**.

## What We Accomplished

1. **Created a Cognito User Pool**: An enterprise-grade user database.
2. **Added API Gateway Security**: We attached a Cognito Authorizer to your API so it rejects anyone who doesn't have a valid login token.
3. **Updated the Frontend App**: We added a secure Login Screen. Now, your `app.js` checks if you are logged in, redirects you to the AWS Login page if you aren't, and attaches your secret token to every API request!

## How to Verify (Action Required)

Follow these precise steps to get your secure login working:

### Step 1: Deploy to AWS
Because we added a whole new security system to `template.yaml`, you need to deploy it.
1. Open your terminal and run:
   ```cmd
   cd "c:\Serverless management system"
   sam deploy
   ```
2. Press `y` when it asks if you want to deploy.
3. **Important:** When the deployment finishes, look at the **Outputs** table in your terminal. You will see two new values: `CognitoClientID` and `CognitoDomainURL`. Copy them!

### Step 2: Configure Your App
1. Open the file [frontend/app.js](file:///c:/Serverless%20management%20system/frontend/app.js).
2. Look at lines 6 and 7:
   ```javascript
   const COGNITO_DOMAIN = "https://educloud-app-YOURACCOUNTID.auth.ap-south-1.amazoncognito.com";
   const CLIENT_ID = "YOUR_CLIENT_ID";
   ```
3. Replace those placeholders with the values you just copied from your terminal! *(I already restored your `API_BASE_URL` for you).*
4. Save the file.

### Step 3: Run the App
Because Cognito login requires a real web server to work securely, you must run it through Python (you can no longer just double click `index.html`).
1. In your terminal, go to the frontend folder:
   ```cmd
   cd frontend
   ```
2. Start the local server:
   ```cmd
   python -m http.server 8000
   ```
3. Open your web browser and go to `http://localhost:8000`. 
4. You will see a Login Screen! Click it, sign up as a new user, and log in. You should now be able to add students securely!
