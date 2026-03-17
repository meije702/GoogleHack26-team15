"""
Mock Instagram service with rich sample data for the Marketing AI Agency demo.

Provides a fully-featured in-memory Instagram simulation with realistic posts,
comments, engagement metrics, and CRUD operations.
"""

import uuid
from datetime import datetime, timedelta
from dataclasses import dataclass, field


@dataclass
class Comment:
    id: str
    username: str
    text: str
    timestamp: str
    likes: int = 0
    replies: list[dict] = field(default_factory=list)


@dataclass
class Post:
    id: str
    image_url: str
    caption: str
    hashtags: list[str]
    likes: int
    comments: list[Comment]
    timestamp: str
    saves: int = 0
    shares: int = 0
    reach: int = 0
    impressions: int = 0


class InstagramMockService:
    """In-memory Instagram mock that stores posts, comments, and metrics."""

    def __init__(self):
        self.posts: list[Post] = []
        self.followers: int = 12_450
        self.following: int = 843
        self._seed_data()

    def _seed_data(self):
        now = datetime.now()
        sample_posts = [
            Post(
                id="post_001",
                image_url="https://picsum.photos/seed/marketing1/1080/1080",
                caption=(
                    "Unlock your brand's potential with AI-powered marketing "
                    "strategies. The future of digital marketing is here, and "
                    "it's smarter than ever. Ready to transform your business?\n\n"
                    "We helped 50+ brands increase their ROAS by 3x in the last "
                    "quarter alone. Drop a comment if you want to learn how."
                ),
                hashtags=[
                    "#AIMarketing", "#DigitalMarketing", "#BrandStrategy",
                    "#MarketingTips", "#BusinessGrowth", "#ContentMarketing",
                    "#SocialMediaMarketing", "#MarketingAgency", "#GrowthHacking",
                    "#StartupMarketing",
                ],
                likes=247,
                saves=42,
                shares=18,
                reach=3200,
                impressions=4800,
                comments=[
                    Comment(
                        id="c1", username="startup_sarah",
                        text="This is exactly what we need! How do we get started?",
                        timestamp=(now - timedelta(hours=2)).isoformat(), likes=5,
                    ),
                    Comment(
                        id="c2", username="digital_dave",
                        text="AI marketing is the future. Great insights!",
                        timestamp=(now - timedelta(hours=4)).isoformat(), likes=3,
                    ),
                    Comment(
                        id="c3", username="brand_builder",
                        text="Love the approach. Can this work for small businesses too?",
                        timestamp=(now - timedelta(hours=6)).isoformat(), likes=7,
                    ),
                ],
                timestamp=(now - timedelta(days=1)).isoformat(),
            ),
            Post(
                id="post_002",
                image_url="https://picsum.photos/seed/marketing2/1080/1080",
                caption=(
                    "5 Content Marketing Secrets That Top Brands Don't Want You "
                    "to Know.\n\n"
                    "1. Consistency beats virality\n"
                    "2. Repurpose everything\n"
                    "3. Data drives decisions\n"
                    "4. Community > followers\n"
                    "5. Authenticity wins\n\n"
                    "Save this for later and share with a fellow marketer!"
                ),
                hashtags=[
                    "#ContentMarketing", "#MarketingSecrets", "#BrandBuilding",
                    "#SocialMediaTips", "#GrowthHacking", "#EntrepreneurLife",
                    "#MarketingStrategy", "#ContentCreation", "#DigitalStrategy",
                ],
                likes=512,
                saves=89,
                shares=34,
                reach=6400,
                impressions=9200,
                comments=[
                    Comment(
                        id="c4", username="marketing_maria",
                        text="Number 4 is so underrated! Community is everything.",
                        timestamp=(now - timedelta(hours=1)).isoformat(), likes=12,
                    ),
                    Comment(
                        id="c5", username="ceo_chris",
                        text="Saved! These are gold. Thanks for sharing.",
                        timestamp=(now - timedelta(hours=3)).isoformat(), likes=8,
                    ),
                    Comment(
                        id="c6", username="growth_guru",
                        text="Consistency beats virality every single time. Preach!",
                        timestamp=(now - timedelta(hours=5)).isoformat(), likes=15,
                    ),
                    Comment(
                        id="c7", username="newbie_nick",
                        text="How do I start repurposing content effectively?",
                        timestamp=(now - timedelta(hours=7)).isoformat(), likes=4,
                    ),
                ],
                timestamp=(now - timedelta(days=3)).isoformat(),
            ),
            Post(
                id="post_003",
                image_url="https://picsum.photos/seed/marketing3/1080/1350",
                caption=(
                    "Behind the scenes of our AI-powered content creation "
                    "workflow. One prompt, five platforms, zero extra effort.\n\n"
                    "This is what happens when you let AI handle the heavy "
                    "lifting so you can focus on strategy.\n\n"
                    "Swipe to see our full process from brief to published post."
                ),
                hashtags=[
                    "#BehindTheScenes", "#AIContent", "#MarketingAutomation",
                    "#WorkflowOptimization", "#ProductivityHacks",
                    "#ContentWorkflow", "#AITools", "#MarketingOps",
                ],
                likes=183,
                saves=31,
                shares=12,
                reach=2100,
                impressions=3500,
                comments=[
                    Comment(
                        id="c8", username="tech_tina",
                        text="What tools are you using for this? Looks amazing!",
                        timestamp=(now - timedelta(hours=8)).isoformat(), likes=6,
                    ),
                    Comment(
                        id="c9", username="agency_andy",
                        text="This would save our team so many hours. DM me the details!",
                        timestamp=(now - timedelta(hours=10)).isoformat(), likes=3,
                    ),
                ],
                timestamp=(now - timedelta(days=5)).isoformat(),
            ),
            Post(
                id="post_004",
                image_url="https://picsum.photos/seed/marketing4/1080/1080",
                caption=(
                    "Your competitors are already using AI for marketing. "
                    "Are you?\n\n"
                    "The gap between AI-powered businesses and traditional ones "
                    "is growing every day. Don't get left behind.\n\n"
                    "Here are 3 quick wins you can implement TODAY:\n"
                    "- Automate your social media scheduling\n"
                    "- Use AI for ad copy A/B testing\n"
                    "- Set up automated email sequences\n\n"
                    "Which one are you trying first? Let us know below."
                ),
                hashtags=[
                    "#AIBusiness", "#CompetitiveAdvantage", "#MarketingStrategy",
                    "#Innovation", "#FutureOfMarketing", "#DigitalTransformation",
                    "#MarketingAI", "#AutomationTips", "#SmallBusinessTips",
                ],
                likes=394,
                saves=67,
                shares=28,
                reach=5100,
                impressions=7800,
                comments=[
                    Comment(
                        id="c10", username="entrepreneur_emma",
                        text="Already started our AI journey. Best decision ever.",
                        timestamp=(now - timedelta(hours=3)).isoformat(), likes=9,
                    ),
                    Comment(
                        id="c11", username="skeptic_steve",
                        text="AI can't replace human creativity though.",
                        timestamp=(now - timedelta(hours=5)).isoformat(), likes=11,
                    ),
                    Comment(
                        id="c12", username="data_diana",
                        text="It's not about replacing creativity, it's about amplifying it.",
                        timestamp=(now - timedelta(hours=6)).isoformat(), likes=20,
                    ),
                ],
                timestamp=(now - timedelta(days=7)).isoformat(),
            ),
            Post(
                id="post_005",
                image_url="https://picsum.photos/seed/marketing5/1080/1350",
                caption=(
                    "CASE STUDY: How we helped @localcoffeeco grow from 500 to "
                    "15,000 followers in 90 days.\n\n"
                    "The strategy:\n"
                    "- Week 1-2: Brand audit and competitor analysis\n"
                    "- Week 3-4: Content pillar development\n"
                    "- Week 5-8: Consistent posting + Reels strategy\n"
                    "- Week 9-12: UGC campaign + micro-influencer collabs\n\n"
                    "Result: 2,900% follower growth, 420% increase in store "
                    "visits from Instagram.\n\n"
                    "Want results like this? Link in bio for a free consultation."
                ),
                hashtags=[
                    "#CaseStudy", "#SocialMediaGrowth", "#InstagramGrowth",
                    "#MarketingResults", "#ClientSuccess", "#ROI",
                    "#SocialMediaStrategy", "#InfluencerMarketing",
                    "#SmallBusinessMarketing", "#ContentStrategy",
                ],
                likes=723,
                saves=156,
                shares=67,
                reach=9800,
                impressions=14200,
                comments=[
                    Comment(
                        id="c13", username="coffeelover_jen",
                        text="I follow @localcoffeeco because of your content! So good.",
                        timestamp=(now - timedelta(hours=1)).isoformat(), likes=18,
                    ),
                    Comment(
                        id="c14", username="small_biz_owner",
                        text="This is inspiring! Do you work with retail businesses?",
                        timestamp=(now - timedelta(hours=4)).isoformat(), likes=6,
                    ),
                    Comment(
                        id="c15", username="marketer_mike",
                        text="The Reels strategy is where the magic happened, right?",
                        timestamp=(now - timedelta(hours=6)).isoformat(), likes=9,
                    ),
                    Comment(
                        id="c16", username="social_sophie",
                        text="Can you share more about the UGC campaign approach?",
                        timestamp=(now - timedelta(hours=9)).isoformat(), likes=4,
                    ),
                ],
                timestamp=(now - timedelta(days=10)).isoformat(),
            ),
            Post(
                id="post_006",
                image_url="https://picsum.photos/seed/marketing6/1080/1080",
                caption=(
                    "Stop scrolling. Read this.\n\n"
                    "The biggest mistake we see brands make on Instagram:\n"
                    "Posting without a strategy.\n\n"
                    "Every post should serve ONE of these purposes:\n"
                    "- EDUCATE your audience\n"
                    "- ENTERTAIN to build connection\n"
                    "- INSPIRE action or loyalty\n"
                    "- PROMOTE your product/service\n\n"
                    "We call it the E.E.I.P. framework and it changed the game "
                    "for our clients.\n\n"
                    "Double-tap if you're saving this for your next content "
                    "planning session."
                ),
                hashtags=[
                    "#InstagramTips", "#ContentFramework", "#SocialMediaTips",
                    "#MarketingFramework", "#InstagramStrategy",
                    "#ContentPlanning", "#BrandContent", "#SocialMediaManager",
                    "#MarketingEducation", "#ContentTips",
                ],
                likes=891,
                saves=234,
                shares=89,
                reach=12500,
                impressions=18400,
                comments=[
                    Comment(
                        id="c17", username="creator_casey",
                        text="E.E.I.P. framework is genius! Saving this right now.",
                        timestamp=(now - timedelta(hours=2)).isoformat(), likes=22,
                    ),
                    Comment(
                        id="c18", username="agency_alex",
                        text="We use something similar. Great to see others talking about it.",
                        timestamp=(now - timedelta(hours=5)).isoformat(), likes=8,
                    ),
                    Comment(
                        id="c19", username="newbrand_nina",
                        text="This is exactly the structure I've been looking for. Thank you!",
                        timestamp=(now - timedelta(hours=8)).isoformat(), likes=14,
                    ),
                    Comment(
                        id="c20", username="data_driven_dan",
                        text="What's the ideal ratio between these four types?",
                        timestamp=(now - timedelta(hours=11)).isoformat(), likes=7,
                    ),
                    Comment(
                        id="c21", username="freelance_fiona",
                        text="Shared this with my entire team. Gold content as always.",
                        timestamp=(now - timedelta(hours=14)).isoformat(), likes=10,
                    ),
                ],
                timestamp=(now - timedelta(days=14)).isoformat(),
            ),
            Post(
                id="post_007",
                image_url="https://picsum.photos/seed/marketing7/1080/1080",
                caption=(
                    "REEL vs CAROUSEL vs STATIC: Which one wins in 2026?\n\n"
                    "We analyzed 10,000 posts across 200 accounts. Here's what "
                    "the data says:\n\n"
                    "Reels: Best for REACH (avg 3.2x more than static)\n"
                    "Carousels: Best for SAVES (avg 2.8x more than Reels)\n"
                    "Static: Best for COMMENTS (when paired with strong CTAs)\n\n"
                    "The takeaway? Use ALL THREE strategically.\n\n"
                    "Which format do you use most? Tell us below."
                ),
                hashtags=[
                    "#InstagramReels", "#CarouselPosts", "#InstagramData",
                    "#SocialMediaAnalytics", "#ContentFormat", "#InstagramInsights",
                    "#ReelsStrategy", "#DataDrivenMarketing", "#SocialMediaData",
                    "#InstagramAlgorithm",
                ],
                likes=1045,
                saves=312,
                shares=124,
                reach=16200,
                impressions=23800,
                comments=[
                    Comment(
                        id="c22", username="analytics_amy",
                        text="Finally someone backing up claims with actual data. Love this.",
                        timestamp=(now - timedelta(hours=3)).isoformat(), likes=31,
                    ),
                    Comment(
                        id="c23", username="creator_carl",
                        text="Carousels all day! The save rate is just incredible.",
                        timestamp=(now - timedelta(hours=7)).isoformat(), likes=14,
                    ),
                    Comment(
                        id="c24", username="video_vicky",
                        text="Reels changed everything for our brand's discoverability.",
                        timestamp=(now - timedelta(hours=12)).isoformat(), likes=9,
                    ),
                ],
                timestamp=(now - timedelta(days=18)).isoformat(),
            ),
            Post(
                id="post_008",
                image_url="https://picsum.photos/seed/marketing8/1080/1350",
                caption=(
                    "Meet the team behind the magic.\n\n"
                    "We're a group of marketers, data scientists, and AI engineers "
                    "who believe that every business deserves world-class marketing.\n\n"
                    "Our mission: Make enterprise-level marketing strategy "
                    "accessible to businesses of all sizes through the power of AI.\n\n"
                    "Whether you're a solopreneur or a scaling startup, we've got "
                    "the tools and the team to help you grow.\n\n"
                    "Welcome to the future of marketing. Welcome to our agency."
                ),
                hashtags=[
                    "#MeetTheTeam", "#AgencyLife", "#MarketingTeam",
                    "#AIAgency", "#StartupLife", "#TeamWork",
                    "#MarketingAgency", "#WeAreHiring", "#AgencyCulture",
                    "#TechTeam",
                ],
                likes=328,
                saves=19,
                shares=42,
                reach=4300,
                impressions=6100,
                comments=[
                    Comment(
                        id="c25", username="job_seeker_jake",
                        text="Are you hiring? Would love to join the team!",
                        timestamp=(now - timedelta(hours=5)).isoformat(), likes=3,
                    ),
                    Comment(
                        id="c26", username="founder_faye",
                        text="Love the mission! This is exactly what small businesses need.",
                        timestamp=(now - timedelta(hours=9)).isoformat(), likes=11,
                    ),
                ],
                timestamp=(now - timedelta(days=21)).isoformat(),
            ),
        ]
        self.posts = sample_posts

    def get_posts(self) -> list[dict]:
        """Return all posts as serializable dictionaries."""
        return [
            {
                "id": p.id,
                "image_url": p.image_url,
                "caption": p.caption,
                "hashtags": p.hashtags,
                "likes": p.likes,
                "saves": p.saves,
                "shares": p.shares,
                "reach": p.reach,
                "impressions": p.impressions,
                "comments": [
                    {
                        "id": c.id,
                        "username": c.username,
                        "text": c.text,
                        "timestamp": c.timestamp,
                        "likes": c.likes,
                        "replies": c.replies,
                    }
                    for c in p.comments
                ],
                "timestamp": p.timestamp,
                "comment_count": len(p.comments),
            }
            for p in self.posts
        ]

    def get_post(self, post_id: str) -> dict | None:
        """Return a single post by ID."""
        for p in self.posts:
            if p.id == post_id:
                return {
                    "id": p.id,
                    "image_url": p.image_url,
                    "caption": p.caption,
                    "hashtags": p.hashtags,
                    "likes": p.likes,
                    "saves": p.saves,
                    "shares": p.shares,
                    "reach": p.reach,
                    "impressions": p.impressions,
                    "comments": [
                        {
                            "id": c.id,
                            "username": c.username,
                            "text": c.text,
                            "timestamp": c.timestamp,
                            "likes": c.likes,
                            "replies": c.replies,
                        }
                        for c in p.comments
                    ],
                    "timestamp": p.timestamp,
                    "comment_count": len(p.comments),
                }
        return None

    def create_post(self, image_url: str, caption: str, hashtags: list[str]) -> dict:
        """Create a new post and add it to the feed."""
        post_id = f"post_{uuid.uuid4().hex[:6]}"
        post = Post(
            id=post_id,
            image_url=image_url,
            caption=caption,
            hashtags=hashtags,
            likes=0,
            comments=[],
            timestamp=datetime.now().isoformat(),
            saves=0,
            shares=0,
            reach=0,
            impressions=0,
        )
        self.posts.insert(0, post)
        return {
            "id": post.id,
            "image_url": post.image_url,
            "caption": post.caption,
            "hashtags": post.hashtags,
            "status": "published",
            "timestamp": post.timestamp,
        }

    def reply_to_comment(self, post_id: str, comment_id: str, reply: str) -> dict:
        """Reply to a specific comment on a post."""
        for post in self.posts:
            if post.id == post_id:
                for comment in post.comments:
                    if comment.id == comment_id:
                        reply_obj = {
                            "id": f"reply_{uuid.uuid4().hex[:6]}",
                            "username": "marketing_ai_agency",
                            "text": reply,
                            "timestamp": datetime.now().isoformat(),
                            "likes": 0,
                        }
                        comment.replies.append(reply_obj)
                        return {
                            "status": "replied",
                            "post_id": post_id,
                            "comment_id": comment_id,
                            "reply": reply_obj,
                        }
        return {"status": "error", "message": f"Post '{post_id}' or comment '{comment_id}' not found."}

    def get_engagement_metrics(self) -> dict:
        """Calculate and return aggregate engagement metrics."""
        if not self.posts:
            return {
                "total_posts": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_saves": 0,
                "total_shares": 0,
                "total_reach": 0,
                "total_impressions": 0,
                "avg_likes_per_post": 0,
                "avg_comments_per_post": 0,
                "engagement_rate": "0.00%",
                "top_performing_post": None,
                "followers": self.followers,
            }

        total_likes = sum(p.likes for p in self.posts)
        total_comments = sum(len(p.comments) for p in self.posts)
        total_saves = sum(p.saves for p in self.posts)
        total_shares = sum(p.shares for p in self.posts)
        total_reach = sum(p.reach for p in self.posts)
        total_impressions = sum(p.impressions for p in self.posts)
        post_count = len(self.posts)

        engagement_total = total_likes + total_comments + total_saves + total_shares
        engagement_rate = (engagement_total / max(total_impressions, 1)) * 100

        per_post_metrics = [
            {
                "id": p.id,
                "likes": p.likes,
                "saves": p.saves,
                "shares": p.shares,
                "comments": len(p.comments),
                "reach": p.reach,
                "impressions": p.impressions,
                "caption_preview": p.caption[:80],
                "engagement_score": p.likes + len(p.comments) + p.saves + p.shares,
            }
            for p in self.posts
        ]
        top_post = max(per_post_metrics, key=lambda x: x["engagement_score"])

        return {
            "total_posts": post_count,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_saves": total_saves,
            "total_shares": total_shares,
            "total_reach": total_reach,
            "total_impressions": total_impressions,
            "avg_likes_per_post": round(total_likes / post_count, 1),
            "avg_comments_per_post": round(total_comments / post_count, 1),
            "avg_saves_per_post": round(total_saves / post_count, 1),
            "avg_shares_per_post": round(total_shares / post_count, 1),
            "engagement_rate": f"{engagement_rate:.2f}%",
            "top_performing_post": top_post,
            "followers": self.followers,
            "per_post_metrics": per_post_metrics,
        }

    def get_profile_summary(self) -> dict:
        """Return a summary of the Instagram profile."""
        metrics = self.get_engagement_metrics()
        return {
            "username": "marketing_ai_agency",
            "followers": self.followers,
            "following": self.following,
            "total_posts": metrics["total_posts"],
            "engagement_rate": metrics["engagement_rate"],
            "bio": (
                "AI-Powered Marketing Agency | Helping brands grow with "
                "data-driven strategies | DM for free consultation"
            ),
            "website": "https://marketing-ai-agency.demo",
        }


instagram_service = InstagramMockService()
