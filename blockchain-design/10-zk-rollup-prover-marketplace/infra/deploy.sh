#!/bin/bash

# Deployment script template for AWS/GCP CLI
# Copy this to each project's infra/ directory and customize

set -e

PROJECT_NAME="${PROJECT_NAME:-project-name}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
REGION="${REGION:-us-east-1}"

echo "🚀 Deploying $PROJECT_NAME to $ENVIRONMENT in $REGION"

# AWS CLI deployment
if command -v aws &> /dev/null; then
    echo "📦 Deploying to AWS..."
    # Add AWS deployment commands here
    # Example: aws cloudformation deploy --template-file infra/template.yaml --stack-name $PROJECT_NAME-$ENVIRONMENT
fi

# GCP CLI deployment
if command -v gcloud &> /dev/null; then
    echo "📦 Deploying to GCP..."
    # Add GCP deployment commands here
    # Example: gcloud run deploy $PROJECT_NAME --source . --region $REGION
fi

echo "✅ Deployment complete!"

