#!/usr/bin/env bash
# deploy.sh — Build, push, and deploy Marketing AI Agency to Cloud Run
# Usage: ./deploy.sh
set -euo pipefail

# -------- Configuration (edit or pass as env vars) --------
PROJECT_ID="${PROJECT_ID:-qwiklabs-asl-01-964394115550}"
REGION="${REGION:-us-central1}"
REPO="marketing-ai"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

echo "========================================="
echo " Marketing AI Agency — Cloud Run Deploy"
echo "========================================="
echo "Project : ${PROJECT_ID}"
echo "Region  : ${REGION}"
echo "Registry: ${REGISTRY}"
echo ""

# -------- Step 1: Terraform --------
echo ">>> Step 1: Provisioning infrastructure with Terraform..."
cd terraform

if [ ! -f terraform.tfvars ]; then
  cat > terraform.tfvars <<EOF
project_id = "${PROJECT_ID}"
region     = "${REGION}"
EOF
  echo "    Created terraform.tfvars"
fi

terraform init
terraform apply -auto-approve

BACKEND_URL=$(terraform output -raw backend_url)
FRONTEND_URL=$(terraform output -raw frontend_url)
cd ..

# -------- Step 2: Configure Docker --------
echo ""
echo ">>> Step 2: Configuring Docker auth..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# -------- Step 3: Build & push images --------
echo ""
echo ">>> Step 3: Building and pushing Docker images..."

echo "    Building backend..."
docker build -t "${REGISTRY}/backend:latest" ./backend

echo "    Building frontend..."
docker build -t "${REGISTRY}/frontend:latest" ./frontend

echo "    Pushing images..."
docker push "${REGISTRY}/backend:latest"
docker push "${REGISTRY}/frontend:latest"

# -------- Step 4: Deploy Cloud Run services --------
echo ""
echo ">>> Step 4: Deploying backend to Cloud Run..."
gcloud run deploy marketing-ai-backend \
  --image "${REGISTRY}/backend:latest" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --service-account "marketing-ai-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GOOGLE_CLOUD_LOCATION=${REGION},GOOGLE_GENAI_USE_VERTEXAI=TRUE"

BACKEND_URL=$(gcloud run services describe marketing-ai-backend --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)')

echo ""
echo ">>> Step 5: Deploying frontend to Cloud Run..."
gcloud run deploy marketing-ai-frontend \
  --image "${REGISTRY}/frontend:latest" \
  --region "${REGION}" \
  --project "${PROJECT_ID}" \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "BACKEND_URL=${BACKEND_URL},NEXT_PUBLIC_API_URL=${BACKEND_URL}"

FRONTEND_URL=$(gcloud run services describe marketing-ai-frontend --region "${REGION}" --project "${PROJECT_ID}" --format='value(status.url)')

# -------- Done --------
echo ""
echo "========================================="
echo " Deployment complete!"
echo "========================================="
echo ""
echo "Backend  : ${BACKEND_URL}"
echo "Frontend : ${FRONTEND_URL}"
echo ""
