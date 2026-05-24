'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ChevronLeft, ChevronRight, Wand2, Check, MapPin, Users,
  Globe, User, Mail, Loader2, Sparkles, Save, ArrowLeft,
  RefreshCw,
} from 'lucide-react';

type HotelCategory = 'budget' | 'standard' | 'superior' | 'deluxe' | 'luxury';
type ItineraryLanguage = 'en' | 'th' | 'zh';

interface WizardForm {
  // Step 1
  destination: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  travelers: number;
  hotelCategory: HotelCategory;
  language: ItineraryLanguage;
  clientName: string;
  clientEmail: string;
  // Step 2
  activityPreferences: string[];
  budget: string;
  specialRequests: string;
}

const POPULAR_DESTS = ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui', 'Koh Phangan'];

const HOTEL_OPTIONS: { value: HotelCategory; label: string; stars: number; price: string }[] = [
  { value: 'budget',   label: 'Budget / Hostel', stars: 2, price: '~฿800/night'   },
  { value: 'standard', label: '3-Star Hotel',    stars: 3, price: '~฿2,000/night' },
  { value: 'superior', label: '4-Star Hotel',    stars: 4, price: '~฿4,000/night' },
  { value: 'deluxe',   label: '5-Star Hotel',    stars: 5, price: '~฿8,000/night' },
  { value: 'luxury',   label: 'Luxury / Villa',  stars: 5, price: '~฿15,000/night' },
];

const LANGUAGE_OPTIONS: { value: ItineraryLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English',  flag: '🇬🇧' },
  { value: 'th', label: 'ภาษาไทย', flag: '🇹🇭' },
  { value: 'zh', label: '中文',    flag: '🇨🇳' },
];

const ACTIVITY_PREFS = [
  { value: 'cultural',    label: 'Cultural Heritage', emoji: '🏛️' },
  { value: 'temples',     label: 'Temple Tours',       emoji: '⛩️' },
  { value: 'beach',       label: 'Beach & Water',      emoji: '🏖️' },
  { value: 'nature',      label: 'Nature & Wildlife',  emoji: '🌿' },
  { value: 'food',        label: 'Food & Cooking',     emoji: '🍜' },
  { value: 'shopping',    label: 'Shopping',           emoji: '🛍️' },
  { value: 'nightlife',   label: 'Nightlife',          emoji: '🌃' },
  { value: 'adventure',   label: 'Adventure Sports',   emoji: '🤿' },
  { value: 'spa',         label: 'Relaxation & Spa',   emoji: '💆' },
  { value: 'family',      label: 'Family Activities',  emoji: '👨‍👩‍👧' },
  { value: 'photography', label: 'Photography',        emoji: '📸' },
  { value: 'budget',      label: 'Budget-Friendly',    emoji: '💰' },
];

const BUDGETS = ['Economical', 'Standard', 'Premium', 'Luxury'];

const AI_LOADING_MESSAGES = [
  'Connecting to AI engine…',
  'Analyzing destination data…',
  'Querying Werest tours & attractions…',
  'Building day-by-day schedule…',
  'Calculating pricing breakdown…',
  'Crafting inclusions & terms…',
  'Polishing your itinerary…',
];

const STEP_LABELS = ['Trip Details', 'Preferences', 'AI Generate', 'Save'];

export default function NewItineraryPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>({
    destination: '', destinations: [], startDate: '', endDate: '',
    travelers: 2, hotelCategory: 'standard', language: 'en',
    clientName: '', clientEmail: '',
    activityPreferences: [], budget: 'Standard', specialRequests: '',
  });
  const [generated, setGenerated] = useState<Record<string, unknown> | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg]  = useState(0);
  const [saving, setSaving]          = useState(false);
  const [editTitle, setEditTitle]    = useState('');
  const [adminNotes, setAdminNotes]  = useState('');

  const update = (key: keyof WizardForm, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const togglePref = (val: string) => {
    setForm(prev => ({
      ...prev,
      activityPreferences: prev.activityPreferences.includes(val)
        ? prev.activityPreferences.filter(p => p !== val)
        : [...prev.activityPreferences, val],
    }));
  };

  const toggleDest = (dest: string) => {
    if (dest === form.destination) return;
    setForm(prev => ({
      ...prev,
      destinations: prev.destinations.includes(dest)
        ? prev.destinations.filter(d => d !== dest)
        : [...prev.destinations, dest],
    }));
  };

  // Step 1 validation
  const step1Valid = form.destination.trim() !== '' && form.startDate !== '' && form.endDate !== '';

  // Calculate nights
  const nights = form.startDate && form.endDate
    ? Math.max(0, Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000))
    : 0;
  const days = nights > 0 ? nights + 1 : nights === 0 && form.startDate ? 1 : 0;

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerated(null);

    // Cycle loading messages
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % AI_LOADING_MESSAGES.length;
      setLoadingMsg(msgIdx);
    }, 2000);

    try {
      const res = await fetch('/api/admin/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination:          form.destination,
          destinations:         form.destinations,
          startDate:            form.startDate,
          endDate:              form.endDate,
          travelers:            form.travelers,
          hotelCategory:        form.hotelCategory,
          language:             form.language,
          activityPreferences:  form.activityPreferences,
          budget:               form.budget,
          specialRequests:      form.specialRequests,
          clientName:           form.clientName || undefined,
          clientEmail:          form.clientEmail || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setGenerated(json.data);
        setEditTitle((json.data.title as string) ?? '');
        setStep(4);
        toast.success('Itinerary generated!');
      } else {
        toast.error((json.error as string) ?? 'Generation failed');
        setStep(3); // stay on step 3 so they can retry
      }
    } catch {
      toast.error('Generation failed. Please try again.');
      setStep(3);
    } finally {
      clearInterval(interval);
      setGenerating(false);
    }
  };

  const handleSave = async (status: 'draft' | 'finalized') => {
    if (!generated) return;
    setSaving(true);
    try {
      const pricingLines = generated.pricingLines as { total: number }[] | undefined;
      const res = await fetch('/api/admin/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:          editTitle || (generated.title as string),
          subtitle:       generated.subtitle,
          overview:       generated.overview,
          highlights:     generated.highlights,
          dayBlocks:      generated.dayBlocks,
          inclusions:     generated.inclusions,
          exclusions:     generated.exclusions,
          terms:          generated.terms,
          importantNotes: generated.importantNotes,
          pricingLines,
          totalPrice:     pricingLines?.reduce((s, l) => s + l.total, 0) ?? null,
          destination:    form.destination,
          destinations:   form.destinations,
          startDate:      form.startDate || null,
          endDate:        form.endDate   || null,
          travelers:      form.travelers,
          hotelCategory:  form.hotelCategory,
          language:       form.language,
          clientName:     form.clientName  || null,
          clientEmail:    form.clientEmail || null,
          adminNotes:     adminNotes       || null,
          status,
          currency: 'THB',
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Itinerary ${status === 'finalized' ? 'finalized' : 'saved as draft'}!`);
        router.push(`/admin/itinerary/${(json.data as { id: string }).id}`);
      } else {
        toast.error((json.error as string) ?? 'Save failed');
      }
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <AdminShell title="New Itinerary" subtitle="AI-powered itinerary creation wizard">
      {/* Back button */}
      <Link href="/admin/itinerary" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Itineraries
      </Link>

      {/* ── Progress Steps ── */}
      <div className="flex items-center gap-0 mb-8">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done    = step > n;
          const current = step === n;
          return (
            <div key={n} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                done    ? 'text-green-700 bg-green-50' :
                current ? 'text-brand-700 bg-brand-50' :
                          'text-gray-400'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  done    ? 'bg-green-500 text-white' :
                  current ? 'bg-brand-600 text-white' :
                            'bg-gray-200 text-gray-500'
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : n}
                </div>
                {label}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`w-8 h-0.5 ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step Content ── */}
      <div className="max-w-2xl">

        {/* ── Step 1: Trip Details ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">Trip Details</h2>
            <p className="text-sm text-gray-500 mb-6">Tell us about the destination and travel parameters.</p>

            {/* Destination */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Primary Destination <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.destination}
                  onChange={e => update('destination', e.target.value)}
                  placeholder="e.g. Bangkok, Phuket, Chiang Mai"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              {/* Quick-select popular destinations */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {POPULAR_DESTS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => update('destination', d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      form.destination === d
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional destinations */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Additional Destinations <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_DESTS.filter(d => d !== form.destination).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDest(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      form.destinations.includes(d)
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {form.destinations.includes(d) ? '✓ ' : '+'}{d}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => update('startDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || new Date().toISOString().split('T')[0]}
                  onChange={e => update('endDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            {nights > 0 && (
              <p className="text-sm text-brand-600 font-semibold mb-5 -mt-2">
                📅 {days} day{days > 1 ? 's' : ''}, {nights} night{nights > 1 ? 's' : ''}
              </p>
            )}

            {/* Travelers + Language */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Travelers</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => update('travelers', Math.max(1, form.travelers - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-900 w-8 text-center">{form.travelers}</span>
                  <button
                    type="button"
                    onClick={() => update('travelers', Math.min(50, form.travelers + 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Language</label>
                <select
                  value={form.language}
                  onChange={e => update('language', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {LANGUAGE_OPTIONS.map(l => (
                    <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hotel Category */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Category</label>
              <div className="grid grid-cols-5 gap-2">
                {HOTEL_OPTIONS.map(h => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => update('hotelCategory', h.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      form.hotelCategory === h.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">{h.label}</div>
                    <div className="text-[9px] text-gray-400">{h.price}</div>
                    <div className="text-xs mt-1">{'★'.repeat(h.stars)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Info */}
            <div className="border-t border-gray-100 pt-5 mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Client Information <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={e => update('clientName', e.target.value)}
                    placeholder="Client name"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={e => update('clientEmail', e.target.value)}
                    placeholder="Client email"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Preferences ── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-lg font-extrabold text-gray-900 mb-1">Travel Preferences</h2>
            <p className="text-sm text-gray-500 mb-6">Select activities and set the budget to personalize the AI generation.</p>

            {/* Activity Preferences */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Activity Preferences <span className="text-gray-400 font-normal">(select all that apply)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ACTIVITY_PREFS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => togglePref(p.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      form.activityPreferences.includes(p.value)
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{p.emoji}</span>
                    <span className={`text-xs font-semibold ${form.activityPreferences.includes(p.value) ? 'text-brand-700' : 'text-gray-600'}`}>
                      {p.label}
                    </span>
                    {form.activityPreferences.includes(p.value) && (
                      <Check className="w-3.5 h-3.5 text-brand-600 ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Range</label>
              <div className="flex gap-2">
                {BUDGETS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => update('budget', b)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      form.budget === b
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Requests */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Special Requests / Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.specialRequests}
                onChange={e => update('specialRequests', e.target.value)}
                placeholder="Any specific requirements, accessibility needs, dietary restrictions, must-see places…"
                rows={3}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => { setStep(3); setTimeout(handleGenerate, 100); }}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                Generate with AI
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: AI Generating ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            {generating ? (
              <>
                <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
                  <Wand2 className="w-10 h-10 text-brand-600" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Generating Your Itinerary</h2>
                <p className="text-sm text-gray-500 mb-8">GPT-4o is crafting a personalized {days}-day itinerary for {form.destination}…</p>

                {/* Animated loading steps */}
                <div className="space-y-2 text-left max-w-sm mx-auto mb-8">
                  {AI_LOADING_MESSAGES.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 transition-all duration-500 ${
                        i < loadingMsg ? 'opacity-40' :
                        i === loadingMsg ? 'opacity-100' : 'opacity-20'
                      }`}
                    >
                      {i < loadingMsg ? (
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                      ) : i === loadingMsg ? (
                        <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
                      )}
                      <span className={`text-sm ${i === loadingMsg ? 'font-semibold text-brand-700' : 'text-gray-500'}`}>
                        {msg}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400">This usually takes 15-45 seconds…</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Generation Failed</h2>
                <p className="text-sm text-gray-500 mb-6">Something went wrong. Please check your OpenAI API key and try again.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-900">
                    ← Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 4: Save ── */}
        {step === 4 && generated && (
          <div className="space-y-4">
            {/* Preview card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold">Itinerary Generated Successfully!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Destination</p>
                  <p className="font-semibold">{form.destination}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Duration</p>
                  <p className="font-semibold">{days} days, {nights} nights</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Days Planned</p>
                  <p className="font-semibold">{(generated.dayBlocks as unknown[])?.length ?? 0} day blocks</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-0.5">Pricing Lines</p>
                  <p className="font-semibold">{(generated.pricingLines as unknown[])?.length ?? 0} items</p>
                </div>
              </div>
            </div>

            {/* Editable title */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-extrabold text-gray-900 mb-1">Review & Save</h2>
              <p className="text-sm text-gray-500 mb-5">You can edit the full itinerary after saving.</p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Itinerary Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                />
              </div>

              {(generated.overview as string) && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 mb-1">OVERVIEW PREVIEW</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{generated.overview as string}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Internal Notes <span className="text-gray-400 font-normal">(not shown in PDF)</span>
                </label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Any internal notes about this itinerary…"
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setGenerated(null); setStep(2); }}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save as Draft
                  </button>
                  <button
                    onClick={() => handleSave('finalized')}
                    disabled={saving}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save & Finalize
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
