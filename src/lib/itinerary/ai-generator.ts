import OpenAI from 'openai';
import { prisma } from '@/lib/db';
import type {
  ItineraryFormData,
  ItineraryDayBlock,
  PricingLine,
  HotelCategory,
} from './types';
import { HOTEL_CATEGORIES, calcNights } from './types';

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

interface GeneratedContent {
  title: string;
  subtitle: string;
  overview: string;
  highlights: string[];
  dayBlocks: ItineraryDayBlock[];
  inclusions: string[];
  exclusions: string[];
  terms: string;
  importantNotes: string;
  pricingLines: PricingLine[];
}

export async function generateItinerary(form: ItineraryFormData): Promise<GeneratedContent> {
  const nights = calcNights(form.startDate, form.endDate);
  const days = Math.max(1, nights + 1 > 1 ? nights + 1 : nights || 1);
  const hotelCat = HOTEL_CATEGORIES[form.hotelCategory as HotelCategory] ?? HOTEL_CATEGORIES.standard;
  const hotelTotal = hotelCat.pricePerNight * nights * (form.travelers <= 1 ? 1 : Math.ceil(form.travelers / 2));

  // Query relevant tours from DB
  const allDests = [form.destination, ...form.destinations].map(d => d.toLowerCase());
  const tours = await prisma.tour.findMany({
    where: {
      isActive: true,
      OR: [
        { primaryLocation: { in: allDests, mode: 'insensitive' } },
        { location: { in: allDests, mode: 'insensitive' } },
      ],
    },
    select: { title: true, slug: true, priceFrom: true, duration: true, highlights: true, description: true, category: true },
    take: 15,
  }).catch(() => []);

  // Query relevant attractions from DB
  const attractions = await prisma.attractionListing.findMany({
    where: {
      isActive: true,
      location: { in: allDests, mode: 'insensitive' },
    },
    select: { name: true, slug: true, price: true, category: true, overview: true },
    take: 15,
  }).catch(() => []);

  const toursContext = tours.length > 0
    ? tours.map(t => `- ${t.title} (${t.category}, ${t.duration ?? 'half-day'}, from ${t.priceFrom ?? 'TBC'} THB/person)`).join('\n')
    : 'No specific tours in database — use general Thailand activities';

  const attractionsContext = attractions.length > 0
    ? attractions.map(a => `- ${a.name} (${a.category}, ~${a.price ?? 'TBC'} THB/person)`).join('\n')
    : 'No specific attractions in database — use well-known Thailand attractions';

  const startFormatted = form.startDate ? new Date(form.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';
  const endFormatted   = form.endDate   ? new Date(form.endDate).toLocaleDateString('en-GB',   { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';
  const allDestsStr    = [form.destination, ...form.destinations.filter(Boolean)].join(', ');

  const systemPrompt = `You are an expert Thailand travel consultant for Werest Travel, a premium private transfer and tour company. You create detailed, client-ready travel itineraries that are professional, practical, and exciting. Always recommend Werest's actual tours and services. Write in ${form.language === 'th' ? 'Thai (ภาษาไทย)' : form.language === 'zh' ? 'Simplified Chinese (简体中文)' : 'English'}.`;

  const userPrompt = `Create a complete ${days}-day travel itinerary for ${form.travelers} traveler${form.travelers > 1 ? 's' : ''} visiting ${allDestsStr}, Thailand.

TRIP DETAILS:
- Dates: ${startFormatted} to ${endFormatted} (${days} days, ${nights} nights)
- Hotel Category: ${hotelCat.label} (~${hotelCat.pricePerNight} THB/night)
- Language: ${form.language === 'th' ? 'Thai' : form.language === 'zh' ? 'Chinese' : 'English'}
- Budget Range: ${form.budget || 'Standard'}
- Activity Preferences: ${form.activityPreferences.length > 0 ? form.activityPreferences.join(', ') : 'General sightseeing'}
${form.specialRequests ? `- Special Requests: ${form.specialRequests}` : ''}

WEREST TOURS AVAILABLE (prioritize these):
${toursContext}

WEREST ATTRACTIONS AVAILABLE (include these):
${attractionsContext}

PRICING REFERENCE:
- Hotel: ${hotelCat.pricePerNight} THB/night × ${nights} nights × ${form.travelers <= 1 ? 1 : Math.ceil(form.travelers / 2)} room(s) = ${hotelTotal.toLocaleString()} THB
- Private Sedan Transfer (avg trip): ~2,500-4,000 THB
- Private SUV Transfer (avg trip): ~3,500-5,500 THB
- Tours per person: typically 1,500-3,500 THB
- Attraction tickets: typically 500-2,000 THB/person
- Meals: 300-800 THB/person/meal

IMPORTANT RULES:
1. Day 1 always includes arrival/check-in activities
2. Last day always includes check-out and departure activities
3. Balance activities - don't overschedule (max 3-4 main activities per day)
4. Include realistic transfer times between locations
5. Suggest meals at authentic Thai restaurants
6. Include at least one free/leisure activity per multi-day trip
7. Pricing lines must be specific and realistic for ${form.travelers} travelers
8. Generate unique activity IDs using format: "act-{dayNum}-{actNum}"

Return ONLY a valid JSON object with NO markdown formatting, NO code blocks, JUST the raw JSON:
{
  "title": "Catchy itinerary title (5-8 words)",
  "subtitle": "Descriptive subtitle (10-15 words)",
  "overview": "3-4 sentence trip overview that sells the experience",
  "highlights": ["Key highlight 1", "Key highlight 2", "Key highlight 3", "Key highlight 4", "Key highlight 5", "Key highlight 6"],
  "dayBlocks": [
    {
      "day": 1,
      "date": "${form.startDate || ''}",
      "title": "Day title",
      "description": "2-3 sentence summary of this day",
      "activities": [
        {
          "id": "act-1-1",
          "time": "14:00",
          "title": "Activity name",
          "description": "Detailed description (2-3 sentences)",
          "type": "transfer|tour|attraction|meal|free-time|check-in|check-out|flight",
          "duration": "2 hours",
          "notes": "Practical tip or note",
          "emoji": "🚗"
        }
      ],
      "accommodation": "Hotel type/name suggestion",
      "meals": ["breakfast", "lunch", "dinner"],
      "transferInfo": "How to get around this day"
    }
  ],
  "inclusions": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6", "Item 7", "Item 8"],
  "exclusions": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
  "terms": "Standard booking terms for Werest Travel package: 50% deposit required to confirm booking. Balance due 7 days before travel. Cancellation 14+ days: full refund. 7-13 days: 50% refund. Less than 7 days: no refund. Prices are per person unless stated. Hotel rates are based on double occupancy. Single supplement applies for solo travelers.",
  "importantNotes": "Practical tips about the destination",
  "pricingLines": [
    {
      "id": "line-1",
      "label": "Item name",
      "description": "Brief description",
      "quantity": ${form.travelers},
      "unitPrice": 2000,
      "total": ${form.travelers * 2000},
      "type": "hotel|transfer|tour|attraction|guide|meals|other"
    }
  ]
}`;

  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as GeneratedContent;

  // Ensure all required fields exist with fallbacks
  return {
    title:          parsed.title          ?? `${allDestsStr} Explorer Package`,
    subtitle:       parsed.subtitle       ?? `${days} Days in ${form.destination}`,
    overview:       parsed.overview       ?? '',
    highlights:     Array.isArray(parsed.highlights) ? parsed.highlights : [],
    dayBlocks:      Array.isArray(parsed.dayBlocks)   ? parsed.dayBlocks  : [],
    inclusions:     Array.isArray(parsed.inclusions)  ? parsed.inclusions : [],
    exclusions:     Array.isArray(parsed.exclusions)  ? parsed.exclusions : [],
    terms:          parsed.terms          ?? '',
    importantNotes: parsed.importantNotes ?? '',
    pricingLines:   Array.isArray(parsed.pricingLines) ? parsed.pricingLines : [],
  };
}
