"""
Shared ADK session and memory service for the Marketing AI Agency.

Provides a centralized session service used by all agent runners.
In production, replace InMemorySessionService with a persistent store
such as Firestore or Cloud SQL.
"""

from google.adk.sessions import InMemorySessionService

APP_NAME = "marketing_ai_agency"

# Shared session service used across all agents.
# InMemorySessionService stores session state in process memory, which is
# suitable for development and hackathon demos. For production deployments,
# swap this out for a DatabaseSessionService backed by Firestore, Spanner,
# or another persistent backend.
session_service = InMemorySessionService()
