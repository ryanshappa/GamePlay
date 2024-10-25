# ProcessGameUpload Lambda Function

This Lambda function processes game uploads to an S3 bucket, extracts the uploaded zip files, validates their contents, and uploads the extracted files back to S3. It also updates the backend API with the status of the processing.

## Prerequisites

- **AWS CLI** installed and configured with appropriate permissions.
- **Node.js** installed locally.
- AWS Lambda function created in AWS Console named `ProcessGameUpload`.
- S3 bucket configured with the appropriate event notifications.
- Environment variables set in the Lambda function configuration:
  - **BUCKET_NAME:** Your S3 bucket name.
  - **API_ENDPOINT:** Your backend API endpoint (e.g., `https://your-domain.com/api`).

## Setup Instructions

### 1. Install Dependencies

Navigate to the `processGameUpload` directory and install the required dependencies:

```bash
cd lambda/processGameUpload
npm install
```

## Deployment Instructions

Navigate to the `processGameUpload` directory and install the required dependencies:

```bash
cd lambda/processGameUpload
npm install
```
Then, run the following command to deploy the function:

```bash
./deploy_lambda.sh 
```
