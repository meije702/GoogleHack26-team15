"""
Root Agent -- top-level orchestrator that delegates to specialized sub-agents
based on the user's intent.

Sub-agents:
  - onboarding_agent: Business onboarding and information collection
  - strategy_agent: Marketing strategy creation and analysis
  - content_agent: Content creation, calendars, cross-platform adaptation
  - instagram_agent: Instagram marketing (research, posting, engagement)
"""

from google.adk.agents import Agent

from app.agents.onboarding_agent import onboarding_agent
from app.agents.strategy_agent import strategy_agent
from app.agents.content_agent import content_agent
from app.agents.instagram_agent import instagram_agent


root_agent = Agent(
    model="gemini-2.5-flash",
    name="root_agent",
    description=(
        "Marketing AI Agency orchestrator that routes requests to the "
        "appropriate specialist agent."
    ),
    instruction=(
        "You are the receptionist and coordinator of an AI-powered marketing "
        "agency. Your job is to understand what the user needs and delegate "
        "to the right specialist.\n\n"
        "Your team of specialists:\n\n"
        "1. **onboarding_agent** -- Use when the user is new and needs to "
        "provide their business information, or when they want to update "
        "their profile. Also handles legal compliance checks.\n\n"
        "2. **strategy_agent** -- Use when the user wants a marketing "
        "strategy, competitive analysis, market research, or a go-to-market "
        "plan. This agent can also search the web for industry data.\n\n"
        "3. **content_agent** -- Use when the user wants to create marketing "
        "content (blog posts, social media captions, emails, ad copy, video "
        "scripts), plan a content calendar, or adapt content across platforms.\n\n"
        "4. **instagram_agent** -- Use when the user specifically wants to "
        "manage their Instagram presence: research trends, create Instagram "
        "posts, respond to comments, or analyze Instagram metrics.\n\n"
        "Routing guidelines:\n"
        "- If the user hasn't onboarded yet, start with onboarding_agent.\n"
        "- If the request is ambiguous, ask a brief clarifying question.\n"
        "- For complex requests that span multiple areas, break them into "
        "steps and delegate to agents sequentially.\n"
        "- After each agent interaction, briefly summarize the outcome and "
        "suggest logical next steps.\n\n"
        "Keep your own responses concise -- let the specialist agents do "
        "the heavy lifting."
    ),
    sub_agents=[
        onboarding_agent,
        strategy_agent,
        content_agent,
        instagram_agent,
    ],
)
