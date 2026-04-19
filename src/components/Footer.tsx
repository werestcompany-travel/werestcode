import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-xl text-white">
                Werest<span className="text-brand-400 font-light"> Travel</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your premium travel partner in Thailand. Reliable private transfers across the country.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">Private Transfers</span></li>
              <li className="flex items-center gap-1.5"><span className="text-gray-500">Tours</span> <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Soon</span></li>
              <li className="flex items-center gap-1.5"><span className="text-gray-500">Attraction Tickets</span> <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Soon</span></li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Travel Blog</Link></li>
              <li><Link href="/attractions" className="hover:text-white transition-colors">Attractions</Link></li>
              <li><Link href="/tracking" className="hover:text-white transition-colors">Track Booking</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '+66 XX XXX XXXX'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>hello@werest.travel</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Bangkok, Thailand</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Werest Travel. All rights reserved.</p>
          <p>Designed for Thailand &#127481;&#127469;</p>
        </div>
      </div>
    </footer>
  );
}
