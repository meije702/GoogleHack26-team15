terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# -------------------------------------------------------------------
# Enable required APIs
# -------------------------------------------------------------------
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "aiplatform.googleapis.com",
    "cloudbuild.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# -------------------------------------------------------------------
# Artifact Registry repository for Docker images
# -------------------------------------------------------------------
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "marketing-ai"
  format        = "DOCKER"
  description   = "Docker images for Marketing AI Agency"

  depends_on = [google_project_service.apis]
}

# -------------------------------------------------------------------
# Service Account for Cloud Run backend (needs Vertex AI)
# -------------------------------------------------------------------
resource "google_service_account" "backend_sa" {
  account_id   = "marketing-ai-backend"
  display_name = "Marketing AI Backend"
}

resource "google_project_iam_member" "backend_vertex" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

# -------------------------------------------------------------------
# Cloud Run — Backend
# -------------------------------------------------------------------
resource "google_cloud_run_v2_service" "backend" {
  name     = "marketing-ai-backend"
  location = var.region

  template {
    service_account = google_service_account.backend_sa.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/marketing-ai/backend:latest"

      ports {
        container_port = 8080
      }

      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "GOOGLE_CLOUD_LOCATION"
        value = var.region
      }
      env {
        name  = "GOOGLE_GENAI_USE_VERTEXAI"
        value = "TRUE"
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "1Gi"
        }
      }

      startup_probe {
        http_get {
          path = "/api/health"
          port = 8080
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/api/health"
          port = 8080
        }
        period_seconds = 30
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }

  depends_on = [google_project_service.apis]
}

# Allow unauthenticated access to backend (frontend calls it)
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# -------------------------------------------------------------------
# Cloud Run — Frontend
# -------------------------------------------------------------------
resource "google_cloud_run_v2_service" "frontend" {
  name     = "marketing-ai-frontend"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/marketing-ai/frontend:latest"

      ports {
        container_port = 3000
      }

      env {
        name  = "BACKEND_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
      env {
        name  = "NEXT_PUBLIC_WS_URL"
        value = ""
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/"
          port = 3000
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }

  depends_on = [google_project_service.apis]
}

# Allow unauthenticated access to frontend
resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
