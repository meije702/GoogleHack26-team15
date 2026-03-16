"""
Strategy Agent -- analyzes business information and creates data-driven
marketing strategies with Google Search grounding.
"""

from google.adk.agents import Agent
from google.adk.tools import google_search

# ---------------------------------------------------------------------------
# In-memory store for business info (isolated to this service).
# For production, replace with a shared persistent store such as Firestore.
# ---------------------------------------------------------------------------
business_info_store: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Tool functions
# ---------------------------------------------------------------------------

def list_onboarded_businesses() -> dict:
    """List all businesses that have completed onboarding.

    Returns:
        Available business keys and names.
    """
    if not business_info_store:
        return {"status": "empty", "message": "No businesses onboarded yet. Ask the user about their business directly."}
    return {
        "businesses": {
            key: info["business_name"]
            for key, info in business_info_store.items()
        }
    }


def analyze_business(business_key: str) -> dict:
    """Analyze the business information collected during onboarding.

    Args:
        business_key: The business key (lowercase name with underscores) from onboarding.

    Returns:
        Business analysis with SWOT-style insights and budget assessment.
    """
    info = business_info_store.get(business_key)
    if not info:
        available = list(business_info_store.keys())
        return {
            "error": f"Business '{business_key}' not found.",
            "available_businesses": available,
            "hint": "Use list_onboarded_businesses to see valid keys, or ask the user for their business name.",
        }

    return {
        "business": info,
        "analysis": {
            "strengths": [
                f"Established presence in {info['location']}",
                f"Clear product offering: {info['products']}",
                f"Defined target audience: {info['target_audience']}",
            ],
            "weaknesses": [
                "Digital presence may need optimization",
                "Brand awareness outside core market may be limited",
            ],
            "opportunities": [
                "Digital marketing expansion across multiple channels",
                "Social media presence growth through consistent content",
                "Content marketing for thought leadership positioning",
                "Local SEO optimization to capture nearby demand",
                "Paid advertising for targeted lead generation",
            ],
            "threats": [
                "Increasing competition in digital ad space",
                "Changing social media algorithms affecting organic reach",
                "Market saturation in popular channels",
            ],
            "budget_assessment": {
                "monthly_budget": info["monthly_budget"],
                "recommended_allocation": {
                    "paid_advertising": "35-40%",
                    "content_creation": "25-30%",
                    "social_media_management": "15-20%",
                    "analytics_and_tools": "5-10%",
                    "reserve_for_experiments": "5-10%",
                },
            },
            "goal_alignment": info["marketing_goals"],
        },
    }


def create_strategy(
    business_key: str,
    strategy_type: str,
    timeframe: str,
    channels: str,
) -> dict:
    """Create a detailed marketing strategy based on business analysis.

    Args:
        business_key: The business key from onboarding.
        strategy_type: Type of strategy -- one of brand_awareness, lead_generation, sales, or retention.
        timeframe: Strategy timeframe such as 30_days, 90_days, or 6_months.
        channels: Comma-separated marketing channels to focus on (e.g. instagram, google_ads, email, linkedin).

    Returns:
        Complete phased marketing strategy with KPIs.
    """
    info = business_info_store.get(business_key, {})
    channel_list = [c.strip() for c in channels.split(",")]

    strategy = {
        "business": info.get("business_name", business_key),
        "strategy_type": strategy_type,
        "timeframe": timeframe,
        "channels": channel_list,
        "phases": [
            {
                "phase": "Foundation (Week 1-2)",
                "actions": [
                    "Audit existing digital presence and analytics setup",
                    "Define brand voice, visual guidelines, and messaging pillars",
                    "Set up tracking pixels, UTM parameters, and conversion goals",
                    "Create content calendar for the first month",
                    "Conduct competitor analysis on target channels",
                ],
            },
            {
                "phase": "Launch (Week 3-4)",
                "actions": [
                    f"Launch initial campaigns on {', '.join(channel_list[:2])}",
                    "Publish foundational content pieces (blog, social, email)",
                    "Begin community engagement and audience building",
                    "Set up paid advertising with initial test budgets",
                    "Activate email welcome sequence for new subscribers",
                ],
            },
            {
                "phase": "Optimize (Week 5-8)",
                "actions": [
                    "Analyze campaign performance against baseline KPIs",
                    "A/B test messaging, creatives, and landing pages",
                    "Scale budget toward top-performing campaigns",
                    "Refine audience targeting based on conversion data",
                    "Implement retargeting for warm leads",
                ],
            },
            {
                "phase": "Scale (Week 9-12)",
                "actions": [
                    "Expand to additional channels based on learnings",
                    "Develop advanced content strategy (video, UGC, collaborations)",
                    "Launch referral or loyalty program if applicable",
                    "Build comprehensive reporting dashboard",
                    "Plan and document next-quarter strategy adjustments",
                ],
            },
        ],
        "kpis": [
            {"metric": "Website traffic", "target": "+50% from baseline", "tracking": "Google Analytics"},
            {"metric": "Social media followers", "target": "+30% growth", "tracking": "Platform analytics"},
            {"metric": "Lead conversion rate", "target": "3-5%", "tracking": "CRM / form submissions"},
            {"metric": "Cost per acquisition (CPA)", "target": "Below industry average", "tracking": "Ad platforms"},
            {"metric": "Return on ad spend (ROAS)", "target": "3:1 minimum", "tracking": "Ad platforms + revenue"},
            {"metric": "Email open rate", "target": ">25%", "tracking": "Email platform"},
            {"metric": "Engagement rate", "target": ">3%", "tracking": "Social platforms"},
        ],
    }

    return strategy


# ---------------------------------------------------------------------------
# Strategy agent with Google Search grounding
# ---------------------------------------------------------------------------

# The google_search built-in tool is used as the sole tool for a dedicated
# sub-agent because ADK requires that google_search not be mixed with custom
# FunctionTools on the same agent.

_search_sub_agent = Agent(
    model="gemini-2.5-flash",
    name="strategy_researcher",
    description="Searches the web for industry trends, competitor data, and marketing benchmarks.",
    instruction=(
        "You are a marketing research analyst. When asked to research a topic, "
        "use Google Search to find the latest industry trends, competitor "
        "strategies, market data, and marketing benchmarks. Summarize your "
        "findings concisely with key data points."
    ),
    tools=[google_search],
)

strategy_agent = Agent(
    model="gemini-2.5-flash",
    name="strategy_agent",
    description=(
        "Marketing strategy agent that analyzes business information and "
        "creates comprehensive, data-driven marketing strategies."
    ),
    instruction=(
        "You are a senior marketing strategist at a top-tier marketing agency.\n"
        "Your role is to analyze business information and create data-driven "
        "marketing strategies.\n\n"
        "Workflow:\n"
        "1. Use list_onboarded_businesses to see available businesses.\n"
        "2. Use analyze_business to review the collected business information.\n"
        "   - If no business info is found, gather details directly from the user.\n"
        "3. Delegate to strategy_researcher when you need current industry data, "
        "competitor insights, or market trends.\n"
        "4. Use create_strategy to generate a comprehensive phased marketing plan.\n"
        "5. Present the strategy clearly with actionable next steps.\n\n"
        "When creating strategies:\n"
        "- Be specific and actionable, never generic.\n"
        "- Tailor recommendations to the business's budget, goals, and audience.\n"
        "- Prioritize channels based on where the target audience is most active.\n"
        "- Include measurable KPIs for every recommendation.\n"
        "- Consider the competitive landscape.\n\n"
        "Format your responses with clear sections and bullet points for readability."
    ),
    tools=[
        list_onboarded_businesses,
        analyze_business,
        create_strategy,
    ],
    sub_agents=[_search_sub_agent],
)

root_agent = strategy_agent
