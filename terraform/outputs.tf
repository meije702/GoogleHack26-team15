output "backend_url" {
  description = "Cloud Run backend URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "Cloud Run frontend URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "artifact_registry" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
}

output "region" {
  value = var.region
}

output "project_id" {
  value = var.project_id
}
