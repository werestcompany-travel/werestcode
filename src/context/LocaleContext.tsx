'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang     = 'EN' | 'TH' | 'ZH';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'THB';

/* ── Exchange rates relative to THB (1 THB = X currency) ── */
const RATES: Record<Currency, number> = {
  THB: 1,
  USD: 0.0274,
  EUR: 0.0254,
  GBP: 0.0217,
};
const SYMBOLS: Record<Currency, string>  = { THB: '฿', USD: '$', EUR: '€', GBP: '£' };
const DECIMALS: Record<Currency, number> = { THB: 0,   USD: 2,   EUR: 2,   GBP: 2   };

/* ── Translations ─────────────────────────────────────────── */
type Strings = Record<string, string>;
const T: Record<Lang, Strings> = {

  /* ════════════════════════════════════════ ENGLISH ═══════════════════════════════════════ */
  EN: {
    /* nav */
    'nav.home':        'Home',
    'nav.attractions': 'Attraction Tickets',
    'nav.blog':        'Blog',
    'nav.tracking':    'Track Booking',
    'nav.register':    'Register',
    'nav.login':       'Log in',
    'nav.logout':      'Sign out',
    'nav.account':     'My Account',
    'nav.wishlist':    'Wishlist',
    'nav.bookings':    'My Bookings',
    /* locale panel */
    'locale.language': 'Language',
    'locale.currency': 'Currency',
    /* search tabs */
    'tab.transfers':   'Private transfers',
    'tab.tours':       'Tours',
    'tab.tickets':     'Attraction tickets',
    /* private ride form */
    'form.oneWay':        'One way',
    'form.roundTrip':     'Round trip',
    'form.pickup':        'Pickup',
    'form.dropoff':       'Drop-off',
    'form.whereFrom':     'Where from?',
    'form.whereTo':       'Where to?',
    'form.departure':     'Departure',
    'form.return':        'Return',
    'form.passengers':    'Passengers',
    'form.luggage':       'Luggage',
    'form.paxLuggage':    'Passengers & luggage',
    'form.search':        'Search',
    'form.popular':       'Popular:',
    'form.selectDate':    'Select date',
    'form.done':          'Done',
    'form.departureDate': 'Departure date',
    'form.returnDate':    'Return date',
    'form.departureTime': 'Departure time',
    /* tours */
    'tours.dayTrip':      'Day trip',
    'tours.multiDay':     'Multi-day',
    'tours.destination':  'Destination',
    'tours.destHint':     'City, region or tour name…',
    'tours.activityType': 'Activity type',
    'tours.tourDate':     'Tour date',
    /* tickets */
    'tickets.tab':        'Attraction tickets',
    'tickets.attraction': 'Attraction',
    'tickets.hint':       'Grand Palace, Phi Phi Island…',
    'tickets.visitDate':  'Visit date',
    'tickets.tickets':    'Tickets',
    /* activity types */
    'act.all':    'All activities',
    'act.day':    'Day trips',
    'act.adv':    'Adventure & sports',
    'act.cult':   'Cultural & heritage',
    'act.food':   'Food & cooking',
    'act.water':  'Water activities',
    'act.nature': 'Nature & wildlife',
    'act.city':   'City tours',
    /* calendar */
    'cal.departureDate': 'Departure date',
    'cal.returnDate':    'Return date',
    'cal.visitDate':     'Visit date',
    'cal.tourDate':      'Tour date',

    /* ── Homepage ───────────────────────────────────────── */
    /* hero */
    'hero.tagline':     'Private Transfers & Tours · Thailand',
    'hero.title1':      'Transfers and Day Trips',
    'hero.title2':      'in Thailand',
    'hero.subtitle':    'Book fixed-price private transfers and curated day trips across Thailand. Professional drivers, instant confirmation — no payment required at booking.',
    'hero.badge1':      'Cancel for free 24 hours before departure',
    'hero.badge2':      'No payment required now',
    'hero.badge3':      'Flight delay monitoring included',
    'hero.rating':      'Excellent',
    'hero.ratingCount': '4.9 · 2,000+ traveller reviews',
    /* stats bar */
    'stats.routes':     'Routes across Thailand',
    'stats.travellers': 'Happy travellers',
    'stats.rating':     'Average rating',
    'stats.support':    'Customer support',
    /* why werest / benefits */
    'why.tagline': 'Why Werest Travel',
    'why.heading': 'Every journey, taken care of',
    'why.sub':     'We handle every detail so you can focus on what matters — enjoying your trip.',
    'ben.flight.title':  'Real-time Flight Tracking',
    'ben.flight.desc':   'We monitor your flight and adjust pickup time automatically — no extra charge.',
    'ben.driver.title':  'Verified Professional Drivers',
    'ben.driver.desc':   'All drivers are background-checked, licensed, and trained to Thai standards.',
    'ben.price.title':   'Fixed, Transparent Pricing',
    'ben.price.desc':    'The price you see is the price you pay. No surge, no hidden fees, ever.',
    'ben.confirm.title': 'Instant Confirmation',
    'ben.confirm.desc':  'Get your booking confirmation and driver details immediately after booking.',
    'ben.greet.title':   'Meet & Greet Service',
    'ben.greet.desc':    'Your driver meets you inside the terminal with a name sign — stress-free.',
    'ben.cancel.title':  'Free Cancellation',
    'ben.cancel.desc':   'Cancel or reschedule for free up to 24 hours before your pickup time.',
    /* how it works */
    'hiw.tagline':  'Simple Booking',
    'hiw.heading':  'Book in under 2 minutes',
    'step.1.title': 'Enter your route',
    'step.1.desc':  'Type your pickup and drop-off address, select date, time, and number of passengers.',
    'step.2.title': 'Choose your ride',
    'step.2.desc':  'Compare Sedan, SUV, and Minivan. Add extras like child seat or meet & greet.',
    'step.3.title': 'Instant confirmation',
    'step.3.desc':  'Submit your details and receive instant booking confirmation. No upfront payment — pay on the day.',
    /* popular routes section */
    'rt.tagline': 'Most Booked',
    'rt.heading': 'Popular routes',
    'rt.sub':     'Fixed prices — no surge, no surprises',
    'rt.from':    'Starting from',
    'rt.book':    'Book',
    /* destinations section */
    'dest.tagline':   'Book Your Transfer',
    'dest.heading':   'Popular destinations',
    'dest.seeAll':    'See all routes',
    'dest.oneWay':    'One way',
    'dest.transfer':  'Private Transfer',
    'dest.tab.bkk':   'From Bangkok',
    'dest.tab.hkt':   'From Phuket',
    'dest.tab.cnx':   'From Chiang Mai',
    'dest.tab.beach': 'Beach Routes',
    /* trust / safety section */
    'trust.tagline':   'Your Safety First',
    'trust.heading':   'Every detail handled, so you travel worry-free.',
    'trust.para':      'From the moment you land to your hotel door, we make sure everything goes smoothly. Our drivers, vehicles, and support team are always ready.',
    'trust.flight.t':  'Live flight monitoring',
    'trust.flight.d':  'Your driver tracks your flight and adjusts in real time.',
    'trust.driver.t':  'Background-checked drivers',
    'trust.driver.d':  'Every driver is vetted, licensed, and rated by past customers.',
    'trust.vehicle.t': 'Modern, clean vehicles',
    'trust.vehicle.d': 'Air-conditioned cars refreshed every trip — water included.',
    'trust.support.t': '24 / 7 customer support',
    'trust.support.d': 'Reach us by WhatsApp, phone, or email at any time.',
    'trust.verified':  'From 2,000+ verified reviews',
    /* reviews */
    'rev.tagline': 'What Travellers Say',
    'rev.heading': 'Loved by travellers worldwide',
    'rev.score':   '4.9 out of 5 — 2,000+ reviews',
    'rev.1': 'Absolutely flawless experience. The driver was waiting at the arrival hall with a name sign, helped with all our bags, and got us to the hotel on time. Will book again!',
    'rev.2': "Our flight was delayed by 90 minutes and the driver waited without any fuss. The car was clean and air-conditioned. Easily the best transfer service we've used in Thailand.",
    'rev.3': 'Smooth booking, exact pickup, friendly driver. The price was clearly displayed, no surprises. Perfect start to our Phuket holiday.',
    /* blog */
    'blog.tagline':       'Travel Guides',
    'blog.heading':       'Travel tips & guides',
    'blog.seeAll':        'See all',
    'blog.post.1.title':  'Top 5 Day Trips from Bangkok You Can Book Today',
    'blog.post.1.loc':    'Bangkok',
    'blog.post.2.title':  'How to Get from Suvarnabhumi Airport to Pattaya',
    'blog.post.2.loc':    'Pattaya',
    'blog.post.3.title':  'Chiang Mai to Chiang Rai: The Perfect Day Trip Route',
    'blog.post.3.loc':    'Chiang Mai',
    'blog.post.4.title':  'Phuket vs Krabi: Which Beach Destination Is for You?',
    'blog.post.4.loc':    'Phuket',
    'blog.post.5.title':  '10 Tips for a Stress-Free Arrival at Bangkok Airport',
    'blog.post.5.loc':    'All Thailand',
    /* cta banner */
    'cta.tagline': 'Ready to travel?',
    'cta.heading': 'Book your transfer today',
    'cta.para':    'Fixed prices, no hidden fees, instant confirmation. Search your route above or explore popular destinations.',
    'cta.btn':     'Search your route',
    /* faq */
    'faq.tagline': 'Got Questions?',
    'faq.heading': 'Frequently asked questions',
    'faq.q1': 'How will I find my driver at the airport?',
    'faq.a1': 'Your driver will be waiting in the arrivals hall holding a name sign with your name on it. You will receive full driver details (name, photo, phone, vehicle plate) 24 hours before pickup.',
    'faq.q2': 'What happens if my flight is delayed?',
    'faq.a2': 'We monitor all flights in real time. Your driver automatically adjusts to your actual arrival time at no extra cost. No need to call or message us.',
    'faq.q3': 'Can I cancel or change my booking?',
    'faq.a3': 'Yes — free cancellation and rescheduling up to 24 hours before your scheduled pickup. Changes within 24 hours are subject to availability.',
    'faq.q4': 'Is payment required at the time of booking?',
    'faq.a4': 'No payment is needed when you book. You pay the driver directly on the day of transfer in cash (Thai Baht) or via bank transfer.',
    'faq.q5': 'What vehicle types are available?',
    'faq.a5': 'We offer Sedan (up to 2 passengers & 2 bags), SUV (up to 4 passengers & 4 bags), and Minivan (up to 10 passengers & 7 bags). All vehicles are air-conditioned and include complimentary water.',
    'faq.q6': 'Do you cover routes outside Bangkok?',
    'faq.a6': 'Yes — we cover all major airports and cities across Thailand including Phuket, Chiang Mai, Koh Samui, Krabi, Pattaya, Hua Hin, and more.',
    /* seo section */
    'seo.h2': 'Top private transfers in Thailand',
    /* whatsapp */
    'wa.label': 'Chat on WhatsApp',
  },

  /* ════════════════════════════════════════ THAI ══════════════════════════════════════════ */
  TH: {
    /* nav */
    'nav.home':        'หน้าแรก',
    'nav.attractions': 'ตั๋วสถานที่ท่องเที่ยว',
    'nav.blog':        'บล็อก',
    'nav.tracking':    'ติดตามการจอง',
    'nav.register':    'ลงทะเบียน',
    'nav.login':       'เข้าสู่ระบบ',
    'nav.logout':      'ออกจากระบบ',
    'nav.account':     'บัญชีของฉัน',
    'nav.wishlist':    'รายการโปรด',
    'nav.bookings':    'การจองของฉัน',
    /* locale panel */
    'locale.language': 'ภาษา',
    'locale.currency': 'สกุลเงิน',
    /* search tabs */
    'tab.transfers':   'รถรับส่งส่วนตัว',
    'tab.tours':       'ทัวร์',
    'tab.tickets':     'ตั๋วสถานที่ท่องเที่ยว',
    /* private ride form */
    'form.oneWay':        'เที่ยวเดียว',
    'form.roundTrip':     'ไป-กลับ',
    'form.pickup':        'จุดรับ',
    'form.dropoff':       'จุดส่ง',
    'form.whereFrom':     'รับจากที่ไหน?',
    'form.whereTo':       'ส่งที่ไหน?',
    'form.departure':     'วันออกเดินทาง',
    'form.return':        'วันกลับ',
    'form.passengers':    'ผู้โดยสาร',
    'form.luggage':       'กระเป๋าเดินทาง',
    'form.paxLuggage':    'ผู้โดยสารและกระเป๋า',
    'form.search':        'ค้นหา',
    'form.popular':       'เส้นทางยอดนิยม:',
    'form.selectDate':    'เลือกวันที่',
    'form.done':          'เสร็จสิ้น',
    'form.departureDate': 'วันออกเดินทาง',
    'form.returnDate':    'วันกลับ',
    'form.departureTime': 'เวลาออกเดินทาง',
    /* tours */
    'tours.dayTrip':      'ท่องเที่ยวรายวัน',
    'tours.multiDay':     'หลายวัน',
    'tours.destination':  'ปลายทาง',
    'tours.destHint':     'เมือง, ภูมิภาค หรือชื่อทัวร์...',
    'tours.activityType': 'ประเภทกิจกรรม',
    'tours.tourDate':     'วันทัวร์',
    /* tickets */
    'tickets.tab':        'ตั๋วสถานที่ท่องเที่ยว',
    'tickets.attraction': 'สถานที่ท่องเที่ยว',
    'tickets.hint':       'วังแกรนด์พาเลซ, เกาะพีพี...',
    'tickets.visitDate':  'วันที่เยี่ยมชม',
    'tickets.tickets':    'ตั๋ว',
    /* activity types */
    'act.all':    'ทุกกิจกรรม',
    'act.day':    'ท่องเที่ยวรายวัน',
    'act.adv':    'ผจญภัยและกีฬา',
    'act.cult':   'วัฒนธรรมและมรดก',
    'act.food':   'อาหารและการทำอาหาร',
    'act.water':  'กิจกรรมทางน้ำ',
    'act.nature': 'ธรรมชาติและสัตว์ป่า',
    'act.city':   'ทัวร์เมือง',
    /* calendar */
    'cal.departureDate': 'วันออกเดินทาง',
    'cal.returnDate':    'วันกลับ',
    'cal.visitDate':     'วันที่เยี่ยมชม',
    'cal.tourDate':      'วันทัวร์',

    /* ── Homepage ───────────────────────────────────────── */
    /* hero */
    'hero.tagline':     'บริการรถรับส่งส่วนตัวและทัวร์ · ประเทศไทย',
    'hero.title1':      'บริการรถรับส่งและเที่ยวเดย์ทริป',
    'hero.title2':      'ในประเทศไทย',
    'hero.subtitle':    'จองรถรับส่งส่วนตัวราคาคงที่และเดย์ทริปที่คัดสรรทั่วไทย คนขับมืออาชีพ ยืนยันทันที — ไม่ต้องชำระเงินตอนจอง',
    'hero.badge1':      'ยกเลิกฟรีภายใน 24 ชั่วโมงก่อนออกเดินทาง',
    'hero.badge2':      'ไม่ต้องชำระเงินตอนจอง',
    'hero.badge3':      'ติดตามเที่ยวบินล่าช้าให้อัตโนมัติ',
    'hero.rating':      'ยอดเยี่ยม',
    'hero.ratingCount': '4.9 · รีวิวจากนักท่องเที่ยวกว่า 2,000 คน',
    /* stats bar */
    'stats.routes':     'เส้นทางทั่วไทย',
    'stats.travellers': 'นักท่องเที่ยวที่พอใจ',
    'stats.rating':     'คะแนนเฉลี่ย',
    'stats.support':    'บริการลูกค้า',
    /* why werest / benefits */
    'why.tagline': 'ทำไมต้องเลือก Werest Travel',
    'why.heading': 'ทุกการเดินทาง เราดูแลคุณ',
    'why.sub':     'เราจัดการทุกรายละเอียด ให้คุณมุ่งความสนใจกับสิ่งที่สำคัญ — ความสุขในการท่องเที่ยว',
    'ben.flight.title':  'ติดตามเที่ยวบินแบบเรียลไทม์',
    'ben.flight.desc':   'เราติดตามเที่ยวบินและปรับเวลารับโดยอัตโนมัติ — ไม่มีค่าใช้จ่ายเพิ่มเติม',
    'ben.driver.title':  'คนขับที่ผ่านการตรวจสอบ',
    'ben.driver.desc':   'คนขับทุกคนผ่านการตรวจประวัติ มีใบอนุญาต และได้รับการฝึกฝนตามมาตรฐานไทย',
    'ben.price.title':   'ราคาคงที่ โปร่งใส',
    'ben.price.desc':    'ราคาที่เห็นคือราคาที่จ่าย ไม่มีราคาพุ่ง ไม่มีค่าใช้จ่ายซ่อนเร้นเด็ดขาด',
    'ben.confirm.title': 'ยืนยันการจองทันที',
    'ben.confirm.desc':  'รับการยืนยันการจองและข้อมูลคนขับทันทีหลังจองเสร็จ',
    'ben.greet.title':   'บริการต้อนรับที่สนามบิน',
    'ben.greet.desc':    'คนขับรอรับคุณในผู้โดยสารขาเข้าพร้อมป้ายชื่อ — สะดวก ไม่ยุ่งยาก',
    'ben.cancel.title':  'ยกเลิกฟรี',
    'ben.cancel.desc':   'ยกเลิกหรือเปลี่ยนแปลงได้ฟรีก่อน 24 ชั่วโมงก่อนเวลารับ',
    /* how it works */
    'hiw.tagline':  'จองง่ายไม่กี่ขั้นตอน',
    'hiw.heading':  'จองภายใน 2 นาที',
    'step.1.title': 'เลือกเส้นทางของคุณ',
    'step.1.desc':  'พิมพ์ที่รับและที่ส่ง เลือกวันเวลา และจำนวนผู้โดยสาร',
    'step.2.title': 'เลือกรถของคุณ',
    'step.2.desc':  'เปรียบเทียบซีดาน SUV และมินิแวน เพิ่มบริการพิเศษได้ เช่น ที่นั่งเด็กหรือบริการต้อนรับ',
    'step.3.title': 'ยืนยันทันที',
    'step.3.desc':  'กรอกข้อมูลและรับการยืนยันทันที ไม่ต้องชำระเงินล่วงหน้า — จ่ายในวันเดินทาง',
    /* popular routes section */
    'rt.tagline': 'ยอดนิยม',
    'rt.heading': 'เส้นทางยอดนิยม',
    'rt.sub':     'ราคาคงที่ — ไม่มีราคาพุ่ง ไม่มีเซอร์ไพรส์',
    'rt.from':    'เริ่มต้นที่',
    'rt.book':    'จอง',
    /* destinations section */
    'dest.tagline':   'จองการเดินทางของคุณ',
    'dest.heading':   'ปลายทางยอดนิยม',
    'dest.seeAll':    'ดูทุกเส้นทาง',
    'dest.oneWay':    'เที่ยวเดียว',
    'dest.transfer':  'รถรับส่งส่วนตัว',
    'dest.tab.bkk':   'จากกรุงเทพฯ',
    'dest.tab.hkt':   'จากภูเก็ต',
    'dest.tab.cnx':   'จากเชียงใหม่',
    'dest.tab.beach': 'เส้นทางชายหาด',
    /* trust / safety section */
    'trust.tagline':   'ความปลอดภัยของคุณคือสำคัญ',
    'trust.heading':   'ดูแลทุกรายละเอียด ให้คุณเดินทางอย่างสบายใจ',
    'trust.para':      'ตั้งแต่ขณะที่คุณลงจากเครื่องจนถึงหน้าโรงแรม เราดูแลให้ทุกอย่างเป็นไปอย่างราบรื่น คนขับ รถ และทีมบริการพร้อมเสมอ',
    'trust.flight.t':  'ติดตามเที่ยวบินสด',
    'trust.flight.d':  'คนขับติดตามเที่ยวบินและปรับตารางแบบเรียลไทม์',
    'trust.driver.t':  'คนขับผ่านการตรวจสอบ',
    'trust.driver.d':  'คนขับทุกคนผ่านการตรวจสอบ มีใบอนุญาต และมีคะแนนรีวิวจากลูกค้า',
    'trust.vehicle.t': 'รถสะอาดทันสมัย',
    'trust.vehicle.d': 'รถแอร์เย็นดูแลทำความสะอาดทุกเที่ยว รวมน้ำดื่มฟรี',
    'trust.support.t': 'บริการลูกค้า 24/7',
    'trust.support.d': 'ติดต่อเราได้ทาง WhatsApp โทรศัพท์ หรืออีเมลตลอดเวลา',
    'trust.verified':  'จากรีวิวจริงกว่า 2,000 รีวิว',
    /* reviews */
    'rev.tagline': 'เสียงจากนักท่องเที่ยว',
    'rev.heading': 'รักโดยนักท่องเที่ยวทั่วโลก',
    'rev.score':   '4.9 จาก 5 — กว่า 2,000 รีวิว',
    'rev.1': 'ประสบการณ์ที่ยอดเยี่ยมมาก คนขับรอที่ทางออกขาเข้าพร้อมป้ายชื่อ ช่วยยกกระเป๋าทุกใบ และส่งถึงโรงแรมตรงเวลา จะใช้บริการอีกแน่นอน!',
    'rev.2': 'เที่ยวบินของเราดีเลย์ถึง 90 นาที คนขับรอโดยไม่มีปัญหาใดๆ รถสะอาดและแอร์เย็น เป็นบริการรถรับส่งที่ดีที่สุดที่เคยใช้ในประเทศไทย',
    'rev.3': 'จองง่าย มารับตรงเวลา คนขับใจดี ราคาชัดเจน ไม่มีเซอร์ไพรส์ เริ่มต้นวันหยุดที่ภูเก็ตได้อย่างสมบูรณ์แบบ',
    /* blog */
    'blog.tagline':      'คู่มือการท่องเที่ยว',
    'blog.heading':      'เคล็ดลับและคู่มือการท่องเที่ยว',
    'blog.seeAll':       'ดูทั้งหมด',
    'blog.post.1.title': '5 เดย์ทริปยอดนิยมจากกรุงเทพฯ ที่จองได้วันนี้เลย',
    'blog.post.1.loc':   'กรุงเทพฯ',
    'blog.post.2.title': 'วิธีเดินทางจากสนามบินสุวรรณภูมิสู่พัทยา',
    'blog.post.2.loc':   'พัทยา',
    'blog.post.3.title': 'เชียงใหม่ถึงเชียงราย: เส้นทางเดย์ทริปในอุดมคติ',
    'blog.post.3.loc':   'เชียงใหม่',
    'blog.post.4.title': 'ภูเก็ตหรือกระบี่: เลือกปลายทางชายหาดที่ใช่สำหรับคุณ',
    'blog.post.4.loc':   'ภูเก็ต',
    'blog.post.5.title': '10 เคล็ดลับเดินทางถึงสนามบินกรุงเทพอย่างสบายใจ',
    'blog.post.5.loc':   'ทั่วไทย',
    /* cta banner */
    'cta.tagline': 'พร้อมเดินทางแล้วใช่ไหม?',
    'cta.heading': 'จองรถรับส่งของคุณวันนี้',
    'cta.para':    'ราคาคงที่ ไม่มีค่าใช้จ่ายซ่อนเร้น ยืนยันทันที ค้นหาเส้นทางของคุณด้านบนหรือเลือกจากปลายทางยอดนิยม',
    'cta.btn':     'ค้นหาเส้นทางของคุณ',
    /* faq */
    'faq.tagline': 'มีคำถาม?',
    'faq.heading': 'คำถามที่พบบ่อย',
    'faq.q1': 'ฉันจะหาคนขับที่สนามบินได้อย่างไร?',
    'faq.a1': 'คนขับจะรอในห้องผู้โดยสารขาเข้าพร้อมป้ายชื่อของคุณ คุณจะได้รับข้อมูลคนขับ (ชื่อ รูปถ่าย เบอร์โทร ทะเบียนรถ) 24 ชั่วโมงก่อนรับ',
    'faq.q2': 'จะเกิดอะไรขึ้นถ้าเที่ยวบินดีเลย์?',
    'faq.a2': 'เราติดตามเที่ยวบินแบบเรียลไทม์ คนขับจะปรับตัวตามเวลาที่คุณมาถึงจริงโดยไม่มีค่าใช้จ่ายเพิ่มเติม ไม่ต้องโทรหรือส่งข้อความหาเราเลย',
    'faq.q3': 'ฉันสามารถยกเลิกหรือเปลี่ยนแปลงการจองได้ไหม?',
    'faq.a3': 'ได้ — ยกเลิกและเปลี่ยนแปลงได้ฟรีก่อน 24 ชั่วโมงก่อนเวลารับ การเปลี่ยนแปลงภายใน 24 ชั่วโมงขึ้นอยู่กับความพร้อม',
    'faq.q4': 'ต้องชำระเงินตอนจองไหม?',
    'faq.a4': 'ไม่ต้องชำระเงินตอนจอง คุณจ่ายให้คนขับโดยตรงในวันเดินทางด้วยเงินสด (บาท) หรือโอนเงิน',
    'faq.q5': 'มีรถประเภทใดบ้าง?',
    'faq.a5': 'เรามีซีดาน (สูงสุด 2 คน 2 กระเป๋า) SUV (สูงสุด 4 คน 4 กระเป๋า) และมินิแวน (สูงสุด 10 คน 7 กระเป๋า) รถทุกคันมีแอร์และน้ำดื่มฟรี',
    'faq.q6': 'ให้บริการนอกกรุงเทพฯ ด้วยไหม?',
    'faq.a6': 'ใช่ — เราครอบคลุมสนามบินและเมืองสำคัญทั่วไทย รวมถึงภูเก็ต เชียงใหม่ เกาะสมุย กระบี่ พัทยา หัวหิน และอีกมาก',
    /* seo section */
    'seo.h2': 'บริการรถรับส่งส่วนตัวยอดนิยมในประเทศไทย',
    /* whatsapp */
    'wa.label': 'แชทผ่าน WhatsApp',
  },

  /* ════════════════════════════════════════ CHINESE ═══════════════════════════════════════ */
  ZH: {
    /* nav */
    'nav.home':        '首页',
    'nav.attractions': '景点门票',
    'nav.blog':        '博客',
    'nav.tracking':    '追踪预订',
    'nav.register':    '注册',
    'nav.login':       '登录',
    'nav.logout':      '退出登录',
    'nav.account':     '我的账户',
    'nav.wishlist':    '收藏夹',
    'nav.bookings':    '我的预订',
    /* locale panel */
    'locale.language': '语言',
    'locale.currency': '货币',
    /* search tabs */
    'tab.transfers':   '私人接送',
    'tab.tours':       '旅游',
    'tab.tickets':     '景点门票',
    /* private ride form */
    'form.oneWay':        '单程',
    'form.roundTrip':     '往返',
    'form.pickup':        '接车地点',
    'form.dropoff':       '送达地点',
    'form.whereFrom':     '从哪里出发？',
    'form.whereTo':       '去哪里？',
    'form.departure':     '出发',
    'form.return':        '返回',
    'form.passengers':    '乘客',
    'form.luggage':       '行李',
    'form.paxLuggage':    '乘客与行李',
    'form.search':        '搜索',
    'form.popular':       '热门路线：',
    'form.selectDate':    '选择日期',
    'form.done':          '完成',
    'form.departureDate': '出发日期',
    'form.returnDate':    '返回日期',
    'form.departureTime': '出发时间',
    /* tours */
    'tours.dayTrip':      '一日游',
    'tours.multiDay':     '多日游',
    'tours.destination':  '目的地',
    'tours.destHint':     '城市、地区或旅游名称…',
    'tours.activityType': '活动类型',
    'tours.tourDate':     '旅游日期',
    /* tickets */
    'tickets.tab':        '景点门票',
    'tickets.attraction': '景点',
    'tickets.hint':       '大皇宫、披披岛…',
    'tickets.visitDate':  '游览日期',
    'tickets.tickets':    '门票',
    /* activity types */
    'act.all':    '所有活动',
    'act.day':    '一日游',
    'act.adv':    '探险与运动',
    'act.cult':   '文化与遗产',
    'act.food':   '美食与烹饪',
    'act.water':  '水上活动',
    'act.nature': '自然与野生动物',
    'act.city':   '城市游览',
    /* calendar */
    'cal.departureDate': '出发日期',
    'cal.returnDate':    '返回日期',
    'cal.visitDate':     '游览日期',
    'cal.tourDate':      '旅游日期',

    /* ── Homepage ───────────────────────────────────────── */
    /* hero */
    'hero.tagline':     '泰国私人接送与旅游服务',
    'hero.title1':      '泰国私人接送',
    'hero.title2':      '与一日游服务',
    'hero.subtitle':    '预订固定价格的私人接送和精选一日游，覆盖全泰国。专业司机，即时确认 — 预订时无需付款。',
    'hero.badge1':      '出发前24小时免费取消',
    'hero.badge2':      '预订时无需付款',
    'hero.badge3':      '航班延误自动监控',
    'hero.rating':      '优秀',
    'hero.ratingCount': '4.9 · 超过2,000条旅行者评价',
    /* stats bar */
    'stats.routes':     '泰国路线',
    'stats.travellers': '满意旅行者',
    'stats.rating':     '平均评分',
    'stats.support':    '客户支持',
    /* why werest / benefits */
    'why.tagline': '为什么选择Werest Travel',
    'why.heading': '每一段旅程，我们悉心照料',
    'why.sub':     '我们处理每一个细节，让您专注于最重要的事 — 享受旅途。',
    'ben.flight.title':  '实时航班追踪',
    'ben.flight.desc':   '我们监控您的航班并自动调整接机时间 — 无需额外费用。',
    'ben.driver.title':  '经过验证的专业司机',
    'ben.driver.desc':   '所有司机均经过背景调查，持有执照，并按泰国标准培训。',
    'ben.price.title':   '固定透明定价',
    'ben.price.desc':    '您看到的价格就是您支付的价格。无波动定价，无任何隐藏费用。',
    'ben.confirm.title': '即时确认',
    'ben.confirm.desc':  '预订后立即收到确认通知和司机详情。',
    'ben.greet.title':   '迎接服务',
    'ben.greet.desc':    '您的司机将在航站楼内手持姓名牌等候 — 轻松无忧。',
    'ben.cancel.title':  '免费取消',
    'ben.cancel.desc':   '在接机时间前24小时内可免费取消或改期。',
    /* how it works */
    'hiw.tagline':  '简单预订',
    'hiw.heading':  '2分钟内完成预订',
    'step.1.title': '输入您的路线',
    'step.1.desc':  '输入接送地址，选择日期、时间和乘客人数。',
    'step.2.title': '选择您的车辆',
    'step.2.desc':  '比较轿车、SUV和面包车，可添加儿童座椅或迎接服务等额外选项。',
    'step.3.title': '即时确认',
    'step.3.desc':  '填写您的信息并立即获得确认。无需预付款 — 当天直接付司机。',
    /* popular routes section */
    'rt.tagline': '最受欢迎',
    'rt.heading': '热门路线',
    'rt.sub':     '固定价格 — 无波动，无意外',
    'rt.from':    '起价',
    'rt.book':    '预订',
    /* destinations section */
    'dest.tagline':   '预订您的接送',
    'dest.heading':   '热门目的地',
    'dest.seeAll':    '查看所有路线',
    'dest.oneWay':    '单程',
    'dest.transfer':  '私人接送',
    'dest.tab.bkk':   '从曼谷出发',
    'dest.tab.hkt':   '从普吉出发',
    'dest.tab.cnx':   '从清迈出发',
    'dest.tab.beach': '海滩路线',
    /* trust / safety section */
    'trust.tagline':   '您的安全第一',
    'trust.heading':   '每个细节都已处理好，让您无忧出行。',
    'trust.para':      '从您下飞机的那一刻到酒店门口，我们确保一切顺畅。我们的司机、车辆和支持团队随时准备就绪。',
    'trust.flight.t':  '实时航班监控',
    'trust.flight.d':  '您的司机追踪航班并实时调整行程。',
    'trust.driver.t':  '经过背景调查的司机',
    'trust.driver.d':  '每位司机都经过审核、持证上岗并获得过往客户评级。',
    'trust.vehicle.t': '现代整洁车辆',
    'trust.vehicle.d': '每次行程均配备空调，清洁更新 — 含免费饮用水。',
    'trust.support.t': '全天候客户支持',
    'trust.support.d': '随时通过WhatsApp、电话或邮件联系我们。',
    'trust.verified':  '来自2,000+条真实评价',
    /* reviews */
    'rev.tagline': '旅行者的评价',
    'rev.heading': '深受全球旅行者喜爱',
    'rev.score':   '5分满分4.9分 — 2,000+条评价',
    'rev.1': '体验完美无瑕。司机在到达大厅举着姓名牌等候，帮忙搬所有行李，准时送到酒店。下次一定再订！',
    'rev.2': '我们的航班延误了90分钟，司机毫无怨言地等待。车辆干净有空调。这是我们在泰国用过最好的接送服务。',
    'rev.3': '预订顺畅，准时接机，司机友善。价格清晰，没有意外。普吉岛假期的完美开始。',
    /* blog */
    'blog.tagline':      '旅游指南',
    'blog.heading':      '旅行贴士与指南',
    'blog.seeAll':       '查看全部',
    'blog.post.1.title': '从曼谷出发的5个最佳一日游目的地',
    'blog.post.1.loc':   '曼谷',
    'blog.post.2.title': '如何从素万那普机场前往芭提雅',
    'blog.post.2.loc':   '芭提雅',
    'blog.post.3.title': '清迈到清莱：完美一日游路线攻略',
    'blog.post.3.loc':   '清迈',
    'blog.post.4.title': '普吉岛还是甲米：哪个海滩目的地更适合您？',
    'blog.post.4.loc':   '普吉岛',
    'blog.post.5.title': '轻松抵达曼谷机场的10个实用贴士',
    'blog.post.5.loc':   '全泰国',
    /* cta banner */
    'cta.tagline': '准备好出发了吗？',
    'cta.heading': '今天预订您的接送',
    'cta.para':    '固定价格，无隐藏费用，即时确认。在上方搜索您的路线或浏览热门目的地。',
    'cta.btn':     '搜索您的路线',
    /* faq */
    'faq.tagline': '有疑问？',
    'faq.heading': '常见问题',
    'faq.q1': '我如何在机场找到我的司机？',
    'faq.a1': '您的司机将在到达大厅等候，手持写有您姓名的牌子。您将在接机前24小时收到完整司机信息（姓名、照片、电话、车牌号）。',
    'faq.q2': '如果我的航班延误怎么办？',
    'faq.a2': '我们实时监控所有航班。您的司机会自动调整到您的实际到达时间，无需额外费用。无需致电或发消息给我们。',
    'faq.q3': '我可以取消或更改预订吗？',
    'faq.a3': '是的 — 在预定接机时间前24小时可免费取消和改期。24小时内的更改视具体情况而定。',
    'faq.q4': '预订时需要付款吗？',
    'faq.a4': '预订时无需付款。您在接送当天直接向司机付款，可用现金（泰铢）或银行转账。',
    'faq.q5': '有哪些车型可选？',
    'faq.a5': '我们提供轿车（最多2人，2件行李）、SUV（最多4人，4件行李）和面包车（最多10人，7件行李）。所有车辆均配备空调和免费饮用水。',
    'faq.q6': '你们服务曼谷以外的地区吗？',
    'faq.a6': '是的 — 我们覆盖泰国所有主要机场和城市，包括普吉岛、清迈、苏梅岛、甲米、芭提雅、华欣等。',
    /* seo section */
    'seo.h2': '泰国顶级私人接送服务',
    /* whatsapp */
    'wa.label': '通过WhatsApp联系',
  },
};

/* ── Context ──────────────────────────────────────────────── */
interface LocaleCtx {
  lang:        Lang;
  currency:    Currency;
  setLang:     (l: Lang)     => void;
  setCurrency: (c: Currency) => void;
  t:           (key: string) => string;
  formatPrice: (thb: number) => string;
}

const LocaleContext = createContext<LocaleCtx>({
  lang: 'EN', currency: 'USD',
  setLang: () => {}, setCurrency: () => {},
  t: k => k, formatPrice: n => `฿${n}`,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang,     setLangState]     = useState<Lang>('EN');
  const [currency, setCurrencyState] = useState<Currency>('USD');

  useEffect(() => {
    const l = (localStorage.getItem('werest_lang')     as Lang)     ?? 'EN';
    const c = (localStorage.getItem('werest_currency') as Currency) ?? 'USD';
    setLangState(l);
    setCurrencyState(c);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('werest_lang', l);
  };
  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('werest_currency', c);
  };

  const t = (key: string): string =>
    T[lang]?.[key] ?? T['EN']?.[key] ?? key;

  const formatPrice = (thb: number): string => {
    const converted = thb * RATES[currency];
    const dec       = DECIMALS[currency];
    return `${SYMBOLS[currency]}${converted.toLocaleString('en-US', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    })}`;
  };

  return (
    <LocaleContext.Provider value={{ lang, currency, setLang, setCurrency, t, formatPrice }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
