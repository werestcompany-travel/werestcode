'use client';

import { useState } from 'react';

const DEFAULT_ITEMS = [
  { id: 'whatsapp',    label: "Save your driver's WhatsApp number",         checked: true },
  { id: 'dresscode',   label: 'Check temple dress code (if applicable)',     checked: true },
  { id: 'cash',        label: 'Bring cash for tips (฿50–100 is appreciated)', checked: true },
  { id: 'maps',        label: 'Download offline maps (Google Maps area)',    checked: true },
  { id: 'early',       label: 'Arrive at pickup point 5 minutes early',     checked: true },
  { id: 'sunscreen',   label: 'Pack sunscreen and insect repellent',         checked: false },
  { id: 'concierge',   label: 'Notify your hotel concierge',                checked: false },
];

export default function PrepareChecklist() {
  const [items, setItems] = useState(DEFAULT_ITEMS);

  function toggle(id: string) {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  }

  const completedCount = items.filter(i => i.checked).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">Prepare for Your Trip</h2>
        <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
          {completedCount}/{items.length}
        </span>
      </div>
      <div className="space-y-2.5">
        {items.map(item => (
          <label
            key={item.id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                item.checked
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 bg-white group-hover:border-brand-400'
              }`}
              onClick={() => toggle(item.id)}
            >
              {item.checked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.id)}
              className="sr-only"
            />
            <span className={`text-sm transition-colors ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
