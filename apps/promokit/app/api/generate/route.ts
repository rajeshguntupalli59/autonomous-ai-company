import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { businessName, businessType, description, location, whatsapp, language, tone, festivals } = data;

    if (!businessName || !businessType || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = `You are PromoKit AI, a marketing assistant for Indian small businesses.
Generate promotional content that feels authentic, local, and compelling.
Always use the specified language naturally. Include emojis appropriately.
For Hindi/regional languages, use the actual script (Devanagari for Hindi, Telugu script for Telugu, Tamil script for Tamil, etc).
Make content feel human, warm, and trustworthy — not like generic corporate marketing.
Always output ONLY valid JSON — no markdown, no explanation, just the JSON object.`;

    const userPrompt = `Generate promotional content for this business:
Business Name: ${businessName}
Type: ${businessType}
What they sell: ${description}
Location: ${location || 'India'}
WhatsApp: ${whatsapp || 'Contact us'}
Language: ${language}
Tone: ${tone}
Include festival greetings: ${festivals ? 'Yes' : 'No'}

Generate and return valid JSON with this exact structure (no markdown, just JSON):
{
  "whatsapp": ["message1 (2-4 lines, conversational, ends with CTA)", "message2 (offer-focused)", "message3 (festive/seasonal if applicable)"],
  "instagram": ["caption1 with relevant hashtags", "caption2 with relevant hashtags", "caption3 with relevant hashtags"],
  "facebook": ["post1 (slightly longer, community-focused)", "post2 (offer or story-focused)"],
  "google": "google business description (150-200 words, includes keywords, professional)",
  "flyerTagline": "short punchy tagline for flyer (max 8 words)",
  "flyerHighlight": "main offer or highlight for flyer (1 sentence)"
}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // @ts-expect-error cache_control is valid per Anthropic SDK but not yet typed
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const generated = JSON.parse(jsonMatch[0]);

    return Response.json({ success: true, data: generated, business: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[PromoKit API Error]', message);
    return Response.json({ error: message }, { status: 500 });
  }
}
