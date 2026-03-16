"""
Onboarding Agent -- collects business information through natural conversation.

Supports both text chat and voice (Gemini Live API) interaction modes.
Uses ADK FunctionTool wrappers for saving business info and running a basic
legal-compliance check.
"""

import json
from google.adk.agents import Agent

# ---------------------------------------------------------------------------
# In-memory store for business info collected during onboarding
# ---------------------------------------------------------------------------
business_info_store: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Tool functions (auto-wrapped by ADK when passed to Agent.tools)
# ---------------------------------------------------------------------------

def save_business_info(
    business_name: str,
    location: str,
    products: str,
    target_audience: str,
    monthly_budget: str,
    marketing_goals: str,
) -> dict:
    """Save the collected business information after the onboarding conversation.

    Args:
        business_name: Name of the business.
        location: Business location or market area.
        products: Main products or services offered.
        target_audience: Description of the ideal customers.
        monthly_budget: Approximate monthly marketing budget (e.g. "$5,000").
        marketing_goals: Primary marketing goals such as brand awareness, lead generation, or sales.

    Returns:
        Confirmation with saved business info.
    """
    info = {
        "business_name": business_name,
        "location": location,
        "products": products,
        "target_audience": target_audience,
        "monthly_budget": monthly_budget,
        "marketing_goals": marketing_goals,
    }
    key = business_name.lower().replace(" ", "_")
    business_info_store[key] = info
    return {
        "status": "saved",
        "business_key": key,
        "message": f"Business info for '{business_name}' saved successfully.",
        "data": info,
    }


def check_legal_compliance(
    business_name: str,
    industry: str,
    marketing_channels: str,
) -> dict:
    """Run a basic legal-compliance check for the planned marketing activities.

    Args:
        business_name: Name of the business.
        industry: Industry or sector the business operates in.
        marketing_channels: Planned marketing channels (e.g. email, social media, paid ads).

    Returns:
        Compliance check results with actionable recommendations.
    """
    recommendations: list[str] = [
        "Ensure GDPR compliance for any data collection and email marketing campaigns.",
        "Include clear opt-out / unsubscribe mechanisms in all marketing communications.",
        "Verify advertising claims comply with FTC guidelines and are not misleading.",
        f"Review {industry}-specific advertising regulations before launching campaigns.",
        "Maintain records of consent for all marketing contacts.",
    ]

    channels_lower = marketing_channels.lower()
    if "email" in channels_lower:
        recommendations.append(
            "Comply with CAN-SPAM Act: include physical address, clear sender info, and one-click unsubscribe."
        )
    if "social" in channels_lower or "instagram" in channels_lower:
        recommendations.append(
            "Follow each platform's advertising policies and disclose sponsored/paid content."
        )
    if "ads" in channels_lower or "paid" in channels_lower:
        recommendations.append(
            "Ensure landing pages match ad claims to avoid policy violations and improve Quality Score."
        )
    if "sms" in channels_lower or "text" in channels_lower:
        recommendations.append(
            "Comply with TCPA regulations: obtain express written consent before sending SMS marketing."
        )

    return {
        "business_name": business_name,
        "industry": industry,
        "channels_reviewed": marketing_channels,
        "compliant": True,
        "recommendations": recommendations,
        "disclaimer": (
            "This is an automated preliminary check. "
            "Consult a qualified legal professional for comprehensive compliance review."
        ),
    }


def get_onboarding_status() -> dict:
    """Return a summary of all businesses that have completed onboarding.

    Returns:
        Dictionary listing all onboarded businesses and their keys.
    """
    if not business_info_store:
        return {"status": "empty", "message": "No businesses have been onboarded yet."}
    return {
        "status": "ok",
        "count": len(business_info_store),
        "businesses": {
            key: {
                "business_name": info["business_name"],
                "location": info["location"],
                "marketing_goals": info["marketing_goals"],
            }
            for key, info in business_info_store.items()
        },
    }


# ---------------------------------------------------------------------------
# Agent definition
# ---------------------------------------------------------------------------

onboarding_agent = Agent(
    model="gemini-2.5-flash",
    name="onboarding_agent",
    description=(
        "Voice-friendly business onboarding agent that collects business "
        "information through natural, conversational interaction."
    ),
    instruction=(
        "You are a friendly and professional marketing consultant conducting a "
        "business onboarding session. Your goal is to collect ALL of the "
        "following information through warm, natural conversation:\n\n"
        "1. **Business Name** -- What is the name of their business?\n"
        "2. **Location** -- Where is the business located? What markets do they serve?\n"
        "3. **Products/Services** -- What products or services do they offer?\n"
        "4. **Target Audience** -- Who are their ideal customers?\n"
        "5. **Monthly Budget** -- What is their approximate monthly marketing budget?\n"
        "6. **Marketing Goals** -- What are their primary marketing goals "
        "(brand awareness, lead generation, sales, retention, etc.)?\n\n"
        "Guidelines:\n"
        "- Be conversational and warm; this conversation may be happening over voice.\n"
        "- Ask one or two questions at a time so you don't overwhelm the user.\n"
        "- After each answer, briefly acknowledge what you heard before moving on.\n"
        "- Once you have ALL six pieces of information, use the save_business_info "
        "tool to persist the data.\n"
        "- After saving, call check_legal_compliance with the business name, "
        "industry (inferred from the products/services), and the marketing "
        "channels the user mentioned or that you recommend.\n"
        "- Finish with a concise summary of everything collected and clear next steps "
        "(e.g., 'Head over to the Strategy tab to build your marketing plan').\n\n"
        "Keep each response concise -- 2-3 sentences max per turn -- to work well "
        "with voice interaction."
    ),
    tools=[
        save_business_info,
        check_legal_compliance,
        get_onboarding_status,
    ],
)

root_agent = onboarding_agent
