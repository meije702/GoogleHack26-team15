"""
Content Agent -- generates marketing content, manages content calendars,
and adapts content across platforms.
"""

from datetime import datetime, timedelta
from google.adk.agents import Agent


# ---------------------------------------------------------------------------
# Tool functions
# ---------------------------------------------------------------------------

def create_content(
    topic: str,
    content_type: str,
    platform: str,
    tone: str,
    target_audience: str,
) -> dict:
    """Generate marketing content metadata and platform-specific guidelines.

    The agent should use this tool's output as context to write the actual
    creative copy in its response.

    Args:
        topic: The subject or theme of the content piece.
        content_type: Type of content -- one of blog_post, social_media, email, ad_copy, or video_script.
        platform: Target platform -- one of instagram, twitter, linkedin, blog, email, or youtube.
        tone: Desired voice -- one of professional, casual, humorous, inspirational, or educational.
        target_audience: Description of who the content is for.

    Returns:
        Content creation context including platform guidelines and constraints.
    """
    platform_guidelines = {
        "instagram": {
            "max_length": 2200,
            "hashtags": "20-30 relevant hashtags mixing popular and niche",
            "media": "High-quality image or carousel required",
            "format": "Visual-first with engaging caption",
            "tips": [
                "Start with a hook -- question, bold statement, or surprising stat",
                "Use line breaks for readability",
                "Include a clear call-to-action",
                "Place hashtags in a comment or after line breaks",
            ],
        },
        "twitter": {
            "max_length": 280,
            "hashtags": "2-3 highly relevant hashtags",
            "media": "Optional but increases engagement 150%",
            "format": "Concise, punchy, conversational",
            "tips": [
                "Lead with the most important point",
                "Use threads for longer content",
                "Ask questions to drive replies",
                "Tag relevant accounts when appropriate",
            ],
        },
        "linkedin": {
            "max_length": 3000,
            "hashtags": "3-5 industry-specific hashtags",
            "media": "Optional; documents and carousels perform well",
            "format": "Professional thought leadership",
            "tips": [
                "Open with a personal story or data point",
                "Use short paragraphs (1-2 sentences each)",
                "Include industry-specific insights",
                "End with a question to encourage discussion",
            ],
        },
        "blog": {
            "max_length": 10000,
            "hashtags": "N/A -- use SEO keywords instead",
            "media": "Feature image plus in-body visuals recommended",
            "format": "Long-form, SEO-optimized with headers",
            "tips": [
                "Include H2 and H3 subheadings every 200-300 words",
                "Write a meta description under 160 characters",
                "Target 1-2 primary keywords and 3-5 secondary keywords",
                "Add internal and external links",
            ],
        },
        "email": {
            "max_length": 5000,
            "hashtags": "N/A",
            "media": "Minimal -- keep email lightweight for deliverability",
            "format": "Personal, scannable, action-oriented",
            "tips": [
                "Subject line under 50 characters",
                "Preview text that complements the subject line",
                "One primary CTA above the fold",
                "Personalize with recipient's name or company",
            ],
        },
        "youtube": {
            "max_length": 5000,
            "hashtags": "3-5 in description",
            "media": "Video required; custom thumbnail essential",
            "format": "Script with hook, body, and CTA",
            "tips": [
                "Hook viewers in the first 5 seconds",
                "Include timestamps in the description",
                "End with a clear CTA (subscribe, comment, etc.)",
                "Write a keyword-rich title under 60 characters",
            ],
        },
    }

    guidelines = platform_guidelines.get(platform, {
        "tips": ["Follow platform best practices for maximum engagement."]
    })

    return {
        "status": "ready",
        "content_type": content_type,
        "platform": platform,
        "topic": topic,
        "tone": tone,
        "target_audience": target_audience,
        "guidelines": guidelines,
        "instruction": (
            f"Write compelling {content_type} content about '{topic}' for "
            f"{platform} in a {tone} tone targeting {target_audience}. "
            f"Follow the platform guidelines provided."
        ),
    }


def create_calendar(
    business_name: str,
    duration_weeks: int,
    platforms: str,
    posts_per_week: int,
) -> dict:
    """Create a content calendar with themed, scheduled posts.

    Args:
        business_name: Name of the business the calendar is for.
        duration_weeks: Number of weeks to plan (1-12).
        platforms: Comma-separated platforms (e.g. instagram, twitter, linkedin).
        posts_per_week: Number of posts per week per platform (1-7).

    Returns:
        Structured content calendar with dates, themes, and time slots.
    """
    platform_list = [p.strip() for p in platforms.split(",")]
    today = datetime.now()
    calendar: list[dict] = []

    themes = [
        "Product Spotlight",
        "Customer Success Story",
        "Behind the Scenes",
        "Industry Insights & Trends",
        "Tips & How-To",
        "Trending Topic / Newsjack",
        "User-Generated Content",
        "Promotional Offer / CTA",
        "Team / Culture Highlight",
        "Educational Infographic",
        "Poll / Question / Engagement",
        "Testimonial / Social Proof",
    ]

    optimal_times = {
        "instagram": ["9:00 AM", "12:00 PM", "5:00 PM", "7:00 PM"],
        "twitter": ["8:00 AM", "12:00 PM", "5:00 PM", "9:00 PM"],
        "linkedin": ["7:30 AM", "12:00 PM", "5:30 PM"],
        "blog": ["10:00 AM"],
        "email": ["10:00 AM", "2:00 PM"],
        "youtube": ["2:00 PM", "5:00 PM"],
    }

    theme_idx = 0
    for week in range(duration_weeks):
        week_start = today + timedelta(weeks=week)
        week_entries: list[dict] = []
        for platform in platform_list:
            times = optimal_times.get(platform, ["10:00 AM", "3:00 PM"])
            for post_num in range(posts_per_week):
                day_offset = post_num * (7 // max(posts_per_week, 1))
                post_date = week_start + timedelta(days=min(day_offset, 6))
                theme = themes[theme_idx % len(themes)]
                time_slot = times[post_num % len(times)]
                week_entries.append({
                    "date": post_date.strftime("%Y-%m-%d"),
                    "day": post_date.strftime("%A"),
                    "platform": platform,
                    "theme": theme,
                    "time": time_slot,
                    "status": "planned",
                    "content_type": _suggest_format(platform, theme),
                })
                theme_idx += 1

        calendar.append({
            "week": week + 1,
            "start_date": week_start.strftime("%Y-%m-%d"),
            "end_date": (week_start + timedelta(days=6)).strftime("%Y-%m-%d"),
            "posts": week_entries,
        })

    return {
        "business_name": business_name,
        "duration_weeks": duration_weeks,
        "platforms": platform_list,
        "posts_per_week_per_platform": posts_per_week,
        "total_posts": duration_weeks * len(platform_list) * posts_per_week,
        "calendar": calendar,
    }


def _suggest_format(platform: str, theme: str) -> str:
    """Suggest the best content format based on platform and theme."""
    if platform == "instagram":
        if "Infographic" in theme or "Tips" in theme or "Story" in theme:
            return "carousel"
        if "Behind" in theme or "Trending" in theme:
            return "reel"
        return "single_image"
    if platform == "twitter":
        if "Tips" in theme or "Insights" in theme:
            return "thread"
        return "tweet"
    if platform == "linkedin":
        if "Insights" in theme or "Story" in theme:
            return "article"
        return "post"
    if platform == "youtube":
        return "video"
    if platform == "blog":
        return "article"
    if platform == "email":
        return "newsletter"
    return "post"


def adapt_for_platform(
    original_content: str,
    source_platform: str,
    target_platform: str,
) -> dict:
    """Get guidelines for adapting content from one platform to another.

    Args:
        original_content: The original content text to adapt.
        source_platform: The platform the content was originally created for.
        target_platform: The platform to adapt the content for.

    Returns:
        Adaptation guidelines, constraints, and transformation instructions.
    """
    platform_specs = {
        "instagram": {"max_length": 2200, "hashtags": "20-30", "media": "required", "format": "visual-first"},
        "twitter": {"max_length": 280, "hashtags": "2-3", "media": "optional", "format": "concise"},
        "linkedin": {"max_length": 3000, "hashtags": "3-5", "media": "optional", "format": "professional"},
        "blog": {"max_length": 10000, "hashtags": "none", "media": "recommended", "format": "long-form SEO"},
        "email": {"max_length": 5000, "hashtags": "none", "media": "minimal", "format": "personal CTA-driven"},
        "youtube": {"max_length": 5000, "hashtags": "3-5", "media": "video required", "format": "script"},
    }

    source_spec = platform_specs.get(source_platform, {})
    target_spec = platform_specs.get(target_platform, {})

    preview = original_content[:300] + "..." if len(original_content) > 300 else original_content

    return {
        "original_preview": preview,
        "source_platform": source_platform,
        "target_platform": target_platform,
        "source_specs": source_spec,
        "target_specs": target_spec,
        "adaptation_instructions": [
            f"Adjust length from {source_spec.get('max_length', 'N/A')} to {target_spec.get('max_length', 'N/A')} characters max.",
            f"Change hashtag strategy: {source_spec.get('hashtags', 'N/A')} -> {target_spec.get('hashtags', 'N/A')}.",
            f"Adapt tone/format: {source_spec.get('format', 'N/A')} -> {target_spec.get('format', 'N/A')}.",
            f"Media requirements change: {source_spec.get('media', 'N/A')} -> {target_spec.get('media', 'N/A')}.",
        ],
    }


# ---------------------------------------------------------------------------
# Agent definition
# ---------------------------------------------------------------------------

content_agent = Agent(
    model="gemini-2.5-flash",
    name="content_agent",
    description=(
        "Content creation agent that generates marketing copy, manages content "
        "calendars, and adapts content across platforms."
    ),
    instruction=(
        "You are a creative content strategist and expert copywriter at a "
        "marketing agency.\n\n"
        "Capabilities:\n"
        "1. **Content Creation** -- Use create_content to get platform guidelines, "
        "then write the actual creative copy in your response.\n"
        "2. **Content Calendar** -- Use create_calendar to generate a structured "
        "editorial calendar with optimal posting times.\n"
        "3. **Cross-Platform Adaptation** -- Use adapt_for_platform to get "
        "transformation guidelines, then rewrite the content accordingly.\n\n"
        "Guidelines:\n"
        "- Always ask about the target audience and brand voice before creating content "
        "if not already known.\n"
        "- Write content that is engaging, authentic, and tailored to each platform.\n"
        "- Include clear calls-to-action in every piece.\n"
        "- When writing actual copy, be creative and specific -- never use generic "
        "placeholder text.\n"
        "- For social media: conversational, shareable, and scroll-stopping.\n"
        "- For blog posts: SEO-optimized, value-packed, and well-structured.\n"
        "- For emails: personalized, scannable, and action-oriented.\n\n"
        "When creating a content calendar:\n"
        "- Balance content types: educational (40%), engagement (30%), promotional (20%), "
        "brand personality (10%).\n"
        "- Suggest optimal posting times per platform.\n"
        "- Include seasonal and trending topics.\n"
        "- Plan themes that build narrative momentum over time."
    ),
    tools=[
        create_content,
        create_calendar,
        adapt_for_platform,
    ],
)
