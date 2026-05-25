'use client';

import { useState, Fragment } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, Calendar, Clock, Users, FileText } from 'lucide-react';

interface ModifyTransferBookingProps {
  type: 'transfer';
  bookingId: string;
  customerEmail: string;
  currentPickupDate: string;   // ISO date string
  currentPickupTime: string;   // "HH:MM"
  currentPassengers: number;
  currentLuggage: number;
  currentSpecialNotes?: string;
}

interface ModifyTourBookingProps {
  type: 'tour';
  bookingId: string;
  customerEmail: string;
  currentBookingDate: string;  // ISO date string
  currentAdultQty: number;
  currentChildQty: number;
  currentNotes?: string;
}

type ModifyBookingModalProps = ModifyTransferBookingProps | ModifyTourBookingProps;

type ModalState = 'idle' | 'submitting' | 'success' | 'error';

function toDateInputValue(isoDate: string) {
  return isoDate.slice(0, 10);
}

export default function ModifyBookingModal(props: ModifyBookingModalProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ModalState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Transfer fields
  const [pickupDate, setPickupDate] = useState(
    props.type === 'transfer' ? toDateInputValue(props.currentPickupDate) : '',
  );
  const [pickupTime, setPickupTime] = useState(
    props.type === 'transfer' ? props.currentPickupTime : '',
  );
  const [passengers, setPassengers] = useState(
    props.type === 'transfer' ? props.currentPassengers : 0,
  );
  const [luggage, setLuggage] = useState(
    props.type === 'transfer' ? props.currentLuggage : 0,
  );
  const [specialNotes, setSpecialNotes] = useState(
    props.type === 'transfer' ? (props.currentSpecialNotes ?? '') : '',
  );

  // Tour fields
  const [bookingDate, setBookingDate] = useState(
    props.type === 'tour' ? toDateInputValue(props.currentBookingDate) : '',
  );
  const [adultQty, setAdultQty] = useState(
    props.type === 'tour' ? props.currentAdultQty : 0,
  );
  const [childQty, setChildQty] = useState(
    props.type === 'tour' ? props.currentChildQty : 0,
  );
  const [notes, setNotes] = useState(
    props.type === 'tour' ? (props.currentNotes ?? '') : '',
  );

  const today = new Date().toISOString().slice(0, 10);

  function hasChanges(): boolean {
    if (props.type === 'transfer') {
      return (
        pickupDate !== toDateInputValue(props.currentPickupDate) ||
        pickupTime !== props.currentPickupTime ||
        passengers !== props.currentPassengers ||
        luggage !== props.currentLuggage ||
        specialNotes !== (props.currentSpecialNotes ?? '')
      );
    } else {
      return (
        bookingDate !== toDateInputValue(props.currentBookingDate) ||
        adultQty !== props.currentAdultQty ||
        childQty !== props.currentChildQty ||
        notes !== (props.currentNotes ?? '')
      );
    }
  }

  async function handleSubmit() {
    if (!hasChanges()) return;
    setState('submitting');
    setErrorMsg('');

    try {
      let url: string;
      let body: Record<string, unknown>;

      if (props.type === 'transfer') {
        url = `/api/bookings/${props.bookingId}/modify`;
        body = {
          pickupDate,
          pickupTime,
          passengers,
          luggage,
          specialNotes,
          customerEmail: props.customerEmail,
        };
      } else {
        url = `/api/tour-bookings/${props.bookingId}/modify`;
        body = {
          bookingDate,
          adultQty,
          childQty,
          notes,
          customerEmail: props.customerEmail,
        };
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Failed to modify booking');
        setState('error');
        return;
      }

      setState('success');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
    }
  }

  function handleClose() {
    setOpen(false);
    if (state === 'success') {
      // Optionally refresh — user will see result
      window.location.reload();
    }
    setState('idle');
    setErrorMsg('');
  }

  return (
    <Fragment>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-[#2534ff] hover:underline transition-colors"
      >
        Modify Booking
      </button>

      {/* Modal backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Modify Booking</h2>
              <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {state === 'success' ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-bold text-gray-900 text-lg mb-1">Booking updated!</p>
                  <p className="text-sm text-gray-500">Your booking has been modified successfully.</p>
                </div>
              ) : (
                <>
                  {/* Error banner */}
                  {state === 'error' && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{errorMsg}</p>
                    </div>
                  )}

                  {/* 24h notice */}
                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Modifications are only allowed more than 24 hours before pickup.</p>
                  </div>

                  {props.type === 'transfer' ? (
                    <>
                      {/* Date */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Pickup Date
                        </label>
                        <input
                          type="date"
                          value={pickupDate}
                          min={today}
                          onChange={e => setPickupDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff]"
                        />
                      </div>

                      {/* Time */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                          <Clock className="w-3.5 h-3.5" /> Pickup Time
                        </label>
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={e => setPickupTime(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff]"
                        />
                      </div>

                      {/* Passengers + Luggage */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                            <Users className="w-3.5 h-3.5" /> Passengers
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={passengers}
                            onChange={e => setPassengers(Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Luggage</label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={luggage}
                            onChange={e => setLuggage(Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff]"
                          />
                        </div>
                      </div>

                      {/* Special Notes */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                          <FileText className="w-3.5 h-3.5" /> Special Notes
                        </label>
                        <textarea
                          rows={3}
                          value={specialNotes}
                          onChange={e => setSpecialNotes(e.target.value)}
                          placeholder="Any special requirements..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Tour Date */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                          <Calendar className="w-3.5 h-3.5" /> Tour Date
                        </label>
                        <input
                          type="date"
                          value={bookingDate}
                          min={today}
                          onChange={e => setBookingDate(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff]"
                        />
                      </div>

                      {/* Adult + Child qty */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                            <Users className="w-3.5 h-3.5" /> Adults
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={adultQty}
                            onChange={e => setAdultQty(Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Children</label>
                          <input
                            type="number"
                            min={0}
                            max={50}
                            value={childQty}
                            onChange={e => setChildQty(Number(e.target.value))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff]"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                          <FileText className="w-3.5 h-3.5" /> Notes
                        </label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Any special requirements..."
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2534ff]/20 focus:border-[#2534ff] resize-none"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-3">
              {state === 'success' ? (
                <button
                  onClick={handleClose}
                  className="flex-1 bg-[#2534ff] text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              ) : (
                <>
                  <button
                    onClick={handleClose}
                    className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!hasChanges() || state === 'submitting'}
                    className="flex-1 bg-[#2534ff] text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {state === 'submitting' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {state === 'submitting' ? 'Saving…' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}
