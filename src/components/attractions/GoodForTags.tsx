'use client';

export const GOOD_FOR_TAGS: Record<string, string[]> = {
  'temple':    ['🏛️ History', '🙏 Spiritual', '📸 Photography'],
  'cultural':  ['🎭 Culture', '🏛️ History',   '👨‍👩‍👧 Families'],
  'nature':    ['🌿 Nature',  '👨‍👩‍👧 Families', '🏃 Active'],
  'beach':     ['🏖️ Beach',   '📸 Photography','❤️ Couples'],
  'adventure': ['🏃 Adventure','👥 Groups',   '💪 Active'],
  'food':      ['🍜 Food',    '👨‍👩‍👧 Families', '❤️ Couples'],
  'theme park':['🎢 Thrills', '👨‍👩‍👧 Families', '👥 Groups'],
  'water park':['💦 Water',   '👨‍👩‍👧 Families', '🏃 Active'],
  'museum':    ['🏛️ History', '🎭 Culture',   '📸 Photography'],
  'historical':['🏛️ History', '📸 Photography','🙏 Spiritual'],
};

const TAG_COLOURS = [
  'bg-blue-50 text-blue-700',
  'bg-green-50 text-green-700',
  'bg-purple-50 text-purple-700',
  'bg-amber-50 text-amber-700',
  'bg-rose-50 text-rose-700',
  'bg-teal-50 text-teal-700',
];

function getTagsForCategory(category: string): string[] {
  const key = category.toLowerCase();
  // Try exact match first, then partial match
  if (GOOD_FOR_TAGS[key]) return GOOD_FOR_TAGS[key];
  const matched = Object.entries(GOOD_FOR_TAGS).find(([k]) => key.includes(k) || k.includes(key));
  return matched ? matched[1] : ['📸 Photography', '👨‍👩‍👧 Families'];
}

interface GoodForTagsProps {
  category: string;
  /** Max pills to show (default 3) */
  max?: number;
  /** Size variant */
  size?: 'sm' | 'md';
}

export default function GoodForTags({ category, max = 3, size = 'sm' }: GoodForTagsProps) {
  const tags = getTagsForCategory(category).slice(0, max);

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className={`font-semibold rounded-full ${TAG_COLOURS[i % TAG_COLOURS.length]} ${
            size === 'sm'
              ? 'text-[10px] px-2 py-0.5'
              : 'text-xs px-2.5 py-1'
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ─── Good For filter pill multi-select ─────────────────────────────────── */
export const ALL_GOOD_FOR_OPTIONS = [
  '🏛️ History',
  '🙏 Spiritual',
  '📸 Photography',
  '🎭 Culture',
  '🌿 Nature',
  '👨‍👩‍👧 Families',
  '🏃 Active',
  '🏖️ Beach',
  '❤️ Couples',
  '👥 Groups',
  '💪 Active',
  '🍜 Food',
  '🎢 Thrills',
  '💦 Water',
];

interface GoodForFilterProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

export function GoodForFilter({ selected, onChange }: GoodForFilterProps) {
  function toggle(tag: string) {
    onChange(
      selected.includes(tag)
        ? selected.filter(t => t !== tag)
        : [...selected, tag]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_GOOD_FOR_OPTIONS.map((tag, i) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
              active
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : `border-gray-200 ${TAG_COLOURS[i % TAG_COLOURS.length]} hover:border-gray-400`
            }`}
          >
            {tag}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
        >
          Clear
        </button>
      )}
    </div>
  );
}
