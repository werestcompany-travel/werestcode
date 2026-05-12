import type { Metadata } from 'next';
import CorporatePage from './CorporateClient';

export const metadata: Metadata = {
  title: 'Corporate Travel Accounts — Werest for Business',
  description: 'Dedicated corporate travel management for companies in Thailand. Monthly invoicing, volume discounts, priority booking and a dedicated account manager.',
};

export default function Corporate() {
  return <CorporatePage />;
}
