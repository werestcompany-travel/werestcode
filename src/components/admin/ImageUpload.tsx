/**
 * ImageUpload — Reusable Cloudinary image upload component
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE-TIME CLOUDINARY SETUP (free account)
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Sign up at https://cloudinary.com (free tier is generous)
 * 2. From your dashboard, copy:
 *      - Cloud Name  → NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *      - API Key     → CLOUDINARY_API_KEY
 *      - API Secret  → CLOUDINARY_API_SECRET
 * 3. Add them to your .env.local (and Vercel env vars for production):
 *      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *      CLOUDINARY_API_KEY=your_api_key
 *      CLOUDINARY_API_SECRET=your_api_secret
 * 4. Create an upload preset:
 *      Cloudinary Dashboard → Settings → Upload → Upload presets
 *      → Add upload preset → Name: "werest_unsigned" → Signing mode: Unsigned
 *      → Folder: werest → Save
 *
 * The component uses unsigned upload (client-side) by default.
 * For signed uploads (more secure), it falls back to POST /api/admin/upload.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;          // current image URL
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: string;   // e.g. '16/9', '1/1', '4/3'
  maxSizeMB?: number;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Feature Image',
  aspectRatio = '16/9',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large — max ${maxSizeMB}MB`);
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      setError('Cloudinary not configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'werest_unsigned');  // create this in Cloudinary dashboard
      formData.append('folder', 'werest');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.secure_url);
    } catch (err) {
      setError('Upload failed — check your Cloudinary credentials');
      console.error('[ImageUpload]', err);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}

      {/* Preview or upload zone */}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
          style={{ aspectRatio }}>
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              {uploading ? 'Uploading…' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-[#2534ff]/40 transition-all cursor-pointer p-8"
          style={{ aspectRatio }}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-[#2534ff] animate-spin" />
              <p className="text-sm font-medium text-gray-500">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#2534ff]/10 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-[#2534ff]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Drop image here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · Max {maxSizeMB}MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL input fallback */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste an image URL…"
          className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2534ff]/40 bg-white text-gray-600"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
