"""
Root Agent -- top-level orchestrator that delegates to specialized sub-agents
deployed as separate Cloud Run services via ADK's A2A protocol.

Each sub-agent is referenced by its Cloud Run service URL, injected at
deploy time through environment variables:

  ONBOARDING_AGENT_URL  -- URL of the onboarding Cloud Run service
  STRATEGY_AGENT_URL    -- URL of the strategy Cloud Run service
  CONTENT_AGENT_URL     -- URL of the content Cloud Run service
  INSTAGRAM_AGENT_URL   -- URL of the instagram Cloud Run service
"""

import os
from google.adk.agents import Agent
from google.adk.agents.remote_agent import RemoteA2aAgent

onboarding_remote = RemoteA2aAgent(
    agent_card_url=os.environ["ONBOARDING_AGENT_URL"] + "/.well-known/agent.json",
)

strategy_remote = RemoteA2aAgent(
    agent_card_url=os.environ["STRATEGY_AGENT_URL"] + "/.well-known/agent.json",
)

content_remote = RemoteA2aAgent(
    agent_card_url=os.environ["CONTENT_AGENT_URL"] + "/.well-known/agent.json",
)

instagram_remote = RemoteA2aAgent(
    agent_card_url=os.environ["INSTAGRAM_AGENT_URL"] + "/.well-known/agent.json",
)

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
        onboarding_remote,
        strategy_remote,
        content_remote,
        instagram_remote,
    ],
)
