import { Car, Compass, MapPin, Calendar, Shield, Star, type LucideIcon } from 'lucide-react';

export interface SuggestionCategory {
  category: string;
  colorClass: string;   // Tailwind text color for the tag
  bgClass:    string;   // Tailwind bg color for the tag
  Icon:       LucideIcon;
  questions:  string[];
}

export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    category:   'Transfers',
    colorClass: 'text-blue-700',
    bgClass:    'bg-blue-50',
    Icon:       Car,
    questions: [
      "What's the best transfer from Bangkok airport to Pattaya?",
      "Can 4 adults with luggage fit in an SUV?",
      "How long is the drive from Suvarnabhumi to Hua Hin?",
      "What vehicle do you recommend for 8 passengers?",
      "Is a private transfer worth it from Phuket airport?",
      "How much is a Luxury Alphard transfer in Bangkok?",
    ],
  },
  {
    category:   'Tours',
    colorClass: 'text-green-700',
    bgClass:    'bg-green-50',
    Icon:       Compass,
    questions: [
      "What are the best things to do in Phuket for 3 days?",
      "Recommend a day trip from Bangkok for families",
      "Best island hopping route from Krabi?",
      "Is the Grand Palace worth visiting?",
      "Best ethical elephant sanctuary in Chiang Mai?",
      "What should I do on a day trip to Ayutthaya?",
    ],
  },
  {
    category:   'Destinations',
    colorClass: 'text-orange-700',
    bgClass:    'bg-orange-50',
    Icon:       MapPin,
    questions: [
      "Is Koh Chang good during rainy season?",
      "Best area to stay in Bangkok for first-timers?",
      "Phi Phi Island vs Koh Lanta — which is better?",
      "Is Phuket or Krabi better for beaches?",
      "How do I get to Koh Samui from Bangkok?",
      "Is Pattaya worth visiting for a day trip?",
    ],
  },
  {
    category:   'Planning',
    colorClass: 'text-purple-700',
    bgClass:    'bg-purple-50',
    Icon:       Calendar,
    questions: [
      "Help me plan a 5-day Bangkok + Pattaya itinerary",
      "Budget estimate for 2 weeks in Thailand",
      "Best time of year to visit Chiang Mai?",
      "What's the best 7-day Thailand itinerary?",
      "How many days do I need in Bangkok?",
      "Is 3 days enough for Phuket?",
    ],
  },
  {
    category:   'Safety',
    colorClass: 'text-red-700',
    bgClass:    'bg-red-50',
    Icon:       Shield,
    questions: [
      "What tourist scams should I avoid in Bangkok?",
      "Is Thailand safe for solo female travelers?",
      "What should I pack for a Thailand trip?",
      "Do I need travel insurance for Thailand?",
      "Is tap water safe to drink in Thailand?",
      "What's the tipping culture in Thailand?",
    ],
  },
  {
    category:   'Luxury',
    colorClass: 'text-yellow-700',
    bgClass:    'bg-yellow-50',
    Icon:       Star,
    questions: [
      "Best luxury day trip options from Bangkok?",
      "Recommend a private dinner cruise in Bangkok",
      "VIP transfer options from Phuket airport?",
      "What's a premium experience in Chiang Mai?",
      "Private island tour options near Phuket?",
      "Best rooftop bars in Bangkok?",
    ],
  },
];

// Returns 6 shuffled suggestions (1 from each category) to show on welcome screen
export function getWelcomeSuggestions(): Array<{ category: string; colorClass: string; bgClass: string; Icon: LucideIcon; question: string }> {
  return SUGGESTION_CATEGORIES.map(cat => ({
    category:   cat.category,
    colorClass: cat.colorClass,
    bgClass:    cat.bgClass,
    Icon:       cat.Icon,
    question:   cat.questions[0],
  }));
}

// Returns a fresh random set of suggestions (for Refresh button)
export function getRefreshedSuggestions(
  seed: number,
): Array<{ category: string; colorClass: string; bgClass: string; Icon: LucideIcon; question: string }> {
  return SUGGESTION_CATEGORIES.map(cat => ({
    category:   cat.category,
    colorClass: cat.colorClass,
    bgClass:    cat.bgClass,
    Icon:       cat.Icon,
    question:   cat.questions[seed % cat.questions.length],
  }));
}
