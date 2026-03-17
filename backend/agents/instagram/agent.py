"""
Instagram Agent -- multi-agent system with research, posting, and engagement
sub-agents for end-to-end Instagram marketing management.
"""

from google.adk.agents import Agent
from google.adk.tools import google_search

from .instagram_mock import instagram_service


# ---------------------------------------------------------------------------
# Tool functions
# ---------------------------------------------------------------------------

def research_trends(topic: str, industry: str) -> dict:
    """Research current Instagram trends for a given topic and industry.

    Args:
        topic: The topic to research trends for.
        industry: The industry or niche to focus on.

    Returns:
        Trending hashtags, content formats, best posting times, and competitor insights.
    """
    return {
        "topic": topic,
        "industry": industry,
        "trending_hashtags": [
            f"#{topic.replace(' ', '')}",
            f"#{industry.replace(' ', '')}",
            "#MarketingTips",
            "#DigitalMarketing",
            "#ContentCreator",
            "#BusinessGrowth",
            "#SocialMediaMarketing",
            "#BrandStrategy",
            "#Entrepreneurship",
            "#GrowYourBusiness",
            "#SmallBusinessTips",
            "#MarketingAgency",
        ],
        "trending_formats": [
            {"format": "Carousel Posts", "engagement_rate": "3.1%", "recommendation": "Best for educational content and listicles"},
            {"format": "Reels (15-30s)", "engagement_rate": "4.5%", "recommendation": "Best for reach, discovery, and algorithm boost"},
            {"format": "Stories with Polls", "engagement_rate": "2.8%", "recommendation": "Best for audience interaction and feedback"},
            {"format": "Infographics", "engagement_rate": "2.5%", "recommendation": "Best for shareable, saveable content"},
            {"format": "Behind-the-Scenes Reels", "engagement_rate": "3.8%", "recommendation": "Best for authenticity and brand connection"},
            {"format": "User-Generated Content", "engagement_rate": "4.2%", "recommendation": "Highest trust factor and community building"},
        ],
        "best_posting_times": {
            "monday": "11:00 AM, 1:00 PM",
            "tuesday": "9:00 AM, 1:00 PM, 5:00 PM",
            "wednesday": "11:00 AM, 3:00 PM",
            "thursday": "9:00 AM, 12:00 PM, 7:00 PM",
            "friday": "10:00 AM, 2:00 PM",
            "saturday": "9:00 AM, 11:00 AM",
            "sunday": "10:00 AM, 5:00 PM",
        },
        "competitor_insights": [
            "Top competitors post 4-5 times per week consistently",
            "Carousel posts get 2x more saves than single images",
            "Reels under 30 seconds have the highest completion rate",
            "User-generated content has the highest trust factor across demographics",
            "Posts with faces get 38% more engagement than those without",
            "Captions between 138-150 characters get the best engagement for single images",
        ],
    }


def get_engagement_metrics() -> dict:
    """Get aggregate engagement metrics for all Instagram posts.

    Returns:
        Comprehensive engagement analytics including per-post breakdown.
    """
    return instagram_service.get_engagement_metrics()


def get_profile_summary() -> dict:
    """Get the Instagram profile summary including follower count and bio.

    Returns:
        Profile summary with key account metrics.
    """
    return instagram_service.get_profile_summary()


def create_instagram_post(caption: str, hashtags: str, image_description: str) -> dict:
    """Create and publish a new Instagram post.

    Args:
        caption: The post caption text (max 2200 characters).
        hashtags: Space-separated hashtags to include (e.g. "#marketing #growth #tips").
        image_description: Description of the image to use for the post.

    Returns:
        Details of the newly created post.
    """
    hashtag_list = [h.strip() for h in hashtags.split() if h.startswith("#")]
    post = instagram_service.create_post(
        image_url=f"https://picsum.photos/seed/{abs(hash(image_description)) % 10000}/1080/1080",
        caption=caption,
        hashtags=hashtag_list,
    )
    return post


def respond_to_comment(post_id: str, comment_id: str, reply: str) -> dict:
    """Respond to a comment on an Instagram post.

    Args:
        post_id: The ID of the post containing the comment.
        comment_id: The ID of the specific comment to reply to.
        reply: The reply text to post.

    Returns:
        Reply confirmation with details.
    """
    return instagram_service.reply_to_comment(post_id, comment_id, reply)


def get_all_posts() -> dict:
    """Get all Instagram posts with their details and comments.

    Returns:
        Complete list of all posts.
    """
    return {"posts": instagram_service.get_posts()}


# ---------------------------------------------------------------------------
# Sub-agents
# ---------------------------------------------------------------------------

# google_search must be isolated on its own agent (ADK limitation: built-in
# tools cannot be mixed with custom function tools on the same agent).
_web_search_sub = Agent(
    model="gemini-2.5-flash",
    name="instagram_web_search",
    description="Searches the web for Instagram marketing trends, algorithm updates, and competitor strategies.",
    instruction=(
        "You are a web research assistant. Use Google Search to find the "
        "latest Instagram marketing trends, algorithm changes, competitor "
        "strategies, and industry benchmarks. Return concise, data-backed "
        "summaries."
    ),
    tools=[google_search],
)

research_sub_agent = Agent(
    model="gemini-2.5-flash",
    name="instagram_research",
    description="Researches Instagram trends, hashtags, and competitor strategies using trend analysis, profile data, and web search.",
    instruction=(
        "You are an Instagram research specialist. Your responsibilities:\n"
        "- Use research_trends for structured trend data on specific topics.\n"
        "- Use get_profile_summary to understand the current account state.\n"
        "- Delegate to instagram_web_search when you need live web data "
        "about trends, competitors, or algorithm updates.\n"
        "- Provide specific, data-backed recommendations.\n"
        "- Always include actionable next steps.\n\n"
        "When reporting findings, organize them by: Trends, Hashtag Strategy, "
        "Content Format Recommendations, and Competitor Insights."
    ),
    tools=[
        research_trends,
        get_profile_summary,
    ],
    sub_agents=[_web_search_sub],
)

posting_sub_agent = Agent(
    model="gemini-2.5-flash",
    name="instagram_posting",
    description="Creates and publishes Instagram posts with optimized captions and hashtags.",
    instruction=(
        "You are an Instagram content creator and publisher. Your responsibilities:\n"
        "- Create engaging Instagram posts using create_instagram_post.\n"
        "- Review existing posts with get_all_posts for context and consistency.\n"
        "- Write scroll-stopping captions that drive engagement.\n"
        "- Select optimal hashtags (mix of high-volume, medium, and niche).\n"
        "- Describe images that align with the brand aesthetic.\n\n"
        "Caption best practices:\n"
        "- Start with a hook: question, bold statement, or surprising stat.\n"
        "- Use line breaks and emojis for visual structure.\n"
        "- Include a clear call-to-action (save, share, comment, click link).\n"
        "- Write in a conversational, authentic voice.\n"
        "- Use 20-30 relevant hashtags grouped at the end."
    ),
    tools=[
        create_instagram_post,
        get_all_posts,
    ],
)

engagement_sub_agent = Agent(
    model="gemini-2.5-flash",
    name="instagram_engagement",
    description="Manages community engagement, responds to comments, and tracks performance metrics.",
    instruction=(
        "You are an Instagram community manager. Your responsibilities:\n"
        "- Monitor and respond to comments using respond_to_comment.\n"
        "- Track engagement metrics using get_engagement_metrics.\n"
        "- Review all posts and their comments using get_all_posts.\n"
        "- Provide insights on what content performs best and why.\n"
        "- Suggest engagement strategies to grow the community.\n\n"
        "Response guidelines:\n"
        "- Be friendly, authentic, and on-brand.\n"
        "- Respond to every comment -- even a simple thank-you builds community.\n"
        "- Ask follow-up questions to drive conversation depth.\n"
        "- Thank users for positive feedback genuinely.\n"
        "- Address concerns professionally and offer to help via DM if needed.\n"
        "- Never ignore negative comments -- acknowledge and redirect.\n\n"
        "When analyzing metrics, highlight:\n"
        "- Top-performing content and why it worked.\n"
        "- Engagement rate trends.\n"
        "- Recommendations for improving underperforming content."
    ),
    tools=[
        respond_to_comment,
        get_engagement_metrics,
        get_all_posts,
    ],
)


# ---------------------------------------------------------------------------
# Parent Instagram agent that orchestrates sub-agents
# ---------------------------------------------------------------------------

instagram_agent = Agent(
    model="gemini-2.5-flash",
    name="instagram_agent",
    description=(
        "Instagram marketing manager that coordinates research, content "
        "creation, and community engagement sub-agents."
    ),
    instruction=(
        "You are the lead Instagram marketing manager. You coordinate a team "
        "of three specialists:\n\n"
        "1. **instagram_research** -- For trend research, hashtag analysis, "
        "competitor intelligence, and web search.\n"
        "2. **instagram_posting** -- For creating, writing, and publishing "
        "Instagram posts.\n"
        "3. **instagram_engagement** -- For community management, comment "
        "responses, and performance analytics.\n\n"
        "Delegation rules:\n"
        "- Questions about trends, hashtags, or market research -> instagram_research\n"
        "- Requests to create, write, or publish posts -> instagram_posting\n"
        "- Questions about metrics, engagement, or comment management -> instagram_engagement\n"
        "- For comprehensive requests, coordinate across multiple sub-agents.\n\n"
        "Always provide a unified summary that ties together insights from "
        "all sub-agents, and end with clear, prioritized next steps."
    ),
    sub_agents=[research_sub_agent, posting_sub_agent, engagement_sub_agent],
)

root_agent = instagram_agent
