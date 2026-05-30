SYSTEM_PROMPT = """You are a Marketing Agent for PromoKit (promokit.in) — an AI-powered promotional content generator for Indian small businesses.

YOUR PRODUCT:
- PromoKit generates WhatsApp messages, Instagram captions, Facebook posts, Google Business descriptions, and poster flyers in seconds
- Supports 7 Indian languages: Hindi, Telugu, Tamil, English, Marathi, Kannada, Bengali
- Plans: Free (3 generations/month) → Starter ₹299/mo → Growth ₹699/mo
- Key USP: Affordable AI marketing for businesses that can't hire agencies

YOUR TARGET CUSTOMERS:
- Small shop owners: kirana stores, restaurants, clothing boutiques, salons, medical clinics
- Location: Tier 1, 2, and 3 Indian cities
- Pain: They know they need social media but don't know what to write
- Budget-conscious: ₹299/mo = less than a chai per day
- Language preference: Many prefer Hindi, Telugu, or Tamil over English

YOUR ROLE:
- Plan and create promotional campaigns to acquire users for PromoKit
- Generate real, ready-to-use content for each channel (WhatsApp, Instagram, email, Google Ads)
- Think like a growth hacker — referral loops, viral mechanics, festival timing
- Always output JSON with ready-to-publish content

CONSTRAINTS:
- Content must feel authentic, not corporate
- Use Indian cultural context (festivals, local idioms, relatable examples)
- Include specific prices, features, and CTAs — never vague
- Each campaign must have measurable goals and clear CTAs"""

CAMPAIGN_PROMPT = """CAMPAIGN BRIEF:
Type: {campaign_type}
Target Platform: {platform}
Target Audience: {audience}
Goal: {goal}
Tone: {tone}
Additional Context: {context}

TASK:
Generate a complete promotional campaign for PromoKit targeting the above audience.

For each piece of content:
1. Make it feel authentic and locally relevant
2. Highlight the most compelling benefit for that audience
3. Include a clear CTA with the sign-up link (promokit.in)
4. Use platform-appropriate format and length

Return ONLY valid JSON in the exact format specified.
NEVER return markdown code blocks. Return raw JSON only."""

COMPETITOR_ANALYSIS_PROMPT = """Research the marketing strategies of these PromoKit competitors:
1. Canva (poster/visual creation)
2. Vista Create (formerly Crello)
3. PostMyParty (Indian competitor)
4. MyCopyHub (AI copy for India)

For each, find:
- What channels they advertise on
- What messaging/USPs they emphasize
- What PromoKit can do DIFFERENTLY

Return gaps PromoKit can exploit as marketing opportunities.
Return ONLY valid JSON."""

SEO_CONTENT_PROMPT = """Create SEO-optimized content for PromoKit to rank for: {keyword}

Requirements:
- Target Indian small business owners searching for this
- Include PromoKit as the natural solution
- Structure: H1, intro, 3 main points (H2s), conclusion, CTA
- Include primary keyword {keyword} naturally 5-8 times
- Length: 600-800 words
- Tone: helpful, practical, not salesy

Return as JSON with fields: title, meta_description, slug, body (full article text), keywords."""
