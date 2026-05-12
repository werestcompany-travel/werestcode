import type { Metadata } from 'next';
import GiftVouchersClient from './GiftVouchersClient';

export const metadata: Metadata = {
  title: 'Gift Vouchers — Give the Gift of Travel | Werest Travel',
  description: 'Give the gift of adventure. Buy Werest Travel gift vouchers in denominations from ฿500 to ฿5,000. Redeemable on transfers, tours and attraction tickets across Thailand.',
};

export default function GiftVouchers() {
  return <GiftVouchersClient />;
}
