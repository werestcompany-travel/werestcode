import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { ItineraryRecord } from './types';
import { ACTIVITY_ICONS, calcNights } from './types';

const BRAND_BLUE   = '#2534ff';
const GRAY_50      = '#f9fafb';
const GRAY_100     = '#f3f4f6';
const GRAY_200     = '#e5e7eb';
const GRAY_400     = '#9ca3af';
const GRAY_600     = '#4b5563';
const GRAY_900     = '#111827';
const GREEN_500    = '#22c55e';
const RED_500      = '#ef4444';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
  },

  // ── Cover Header ──
  coverHeader: {
    backgroundColor: BRAND_BLUE,
    padding: 40,
    paddingBottom: 32,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  companyLogoText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  companyName: {
    color: '#ffffffcc',
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: 'Helvetica-Bold',
  },
  coverTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    lineHeight: 1.2,
  },
  coverSubtitle: {
    color: '#ffffffcc',
    fontSize: 13,
    marginBottom: 20,
  },
  coverMeta: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  coverMetaItem: {
    backgroundColor: '#ffffff18',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coverMetaText: {
    color: '#ffffffee',
    fontSize: 10,
  },

  // ── Body ──
  body: {
    paddingHorizontal: 40,
    paddingTop: 32,
  },

  // ── Section ──
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: BRAND_BLUE,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND_BLUE,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_900,
    letterSpacing: 0.5,
  },

  // ── Overview ──
  overviewText: {
    fontSize: 10.5,
    color: GRAY_600,
    lineHeight: 1.7,
  },

  // ── Highlights ──
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightItem: {
    backgroundColor: GRAY_50,
    borderWidth: 1,
    borderColor: GRAY_200,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '47%',
    marginBottom: 4,
  },
  highlightCheck: {
    color: GREEN_500,
    fontSize: 10,
    marginRight: 6,
    fontFamily: 'Helvetica-Bold',
  },
  highlightText: {
    fontSize: 9.5,
    color: GRAY_600,
    flex: 1,
    lineHeight: 1.5,
  },

  // ── Day Block ──
  dayBlock: {
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GRAY_200,
    overflow: 'hidden',
  },
  dayHeader: {
    backgroundColor: GRAY_50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
  },
  dayNumberBadge: {
    backgroundColor: BRAND_BLUE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayNumberText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  dayTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_900,
    flex: 1,
    marginLeft: 10,
  },
  dayDate: {
    fontSize: 9,
    color: GRAY_400,
  },
  dayBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayDescription: {
    fontSize: 9.5,
    color: GRAY_600,
    lineHeight: 1.6,
    marginBottom: 12,
  },

  // ── Activity ──
  activityRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  activityTimeBadge: {
    width: 44,
    alignItems: 'center',
    paddingTop: 1,
  },
  activityTime: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_BLUE,
    backgroundColor: '#eef0ff',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activityDivider: {
    width: 1,
    backgroundColor: GRAY_200,
    marginHorizontal: 8,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: GRAY_900,
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 9,
    color: GRAY_600,
    lineHeight: 1.5,
  },
  activityNotes: {
    fontSize: 8.5,
    color: BRAND_BLUE,
    fontFamily: 'Helvetica-Oblique',
    marginTop: 2,
  },

  // ── Day footer info ──
  dayFooter: {
    backgroundColor: GRAY_50,
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  dayFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayFooterLabel: {
    fontSize: 8.5,
    color: GRAY_400,
    fontFamily: 'Helvetica-Bold',
  },
  dayFooterValue: {
    fontSize: 8.5,
    color: GRAY_600,
  },

  // ── Pricing Table ──
  pricingTable: {
    borderWidth: 1,
    borderColor: GRAY_200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pricingHeader: {
    flexDirection: 'row',
    backgroundColor: GRAY_900,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pricingHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  pricingRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_100,
  },
  pricingRowAlt: {
    backgroundColor: GRAY_50,
  },
  pricingCell: {
    fontSize: 9.5,
    color: GRAY_600,
  },
  pricingCellBold: {
    fontFamily: 'Helvetica-Bold',
    color: GRAY_900,
  },
  pricingTotal: {
    backgroundColor: BRAND_BLUE,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pricingTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    flex: 1,
  },
  pricingTotalValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },

  // ── Inclusions / Exclusions ──
  twoColRow: {
    flexDirection: 'row',
    gap: 16,
  },
  twoColItem: {
    flex: 1,
  },
  incExcItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  incBullet: {
    fontSize: 10,
    color: GREEN_500,
    fontFamily: 'Helvetica-Bold',
    marginTop: 0,
  },
  excBullet: {
    fontSize: 10,
    color: RED_500,
    fontFamily: 'Helvetica-Bold',
  },
  incExcText: {
    fontSize: 9.5,
    color: GRAY_600,
    flex: 1,
    lineHeight: 1.5,
  },

  // ── Terms ──
  termsText: {
    fontSize: 9,
    color: GRAY_400,
    lineHeight: 1.7,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
  },
  footerText: {
    fontSize: 8,
    color: GRAY_400,
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: BRAND_BLUE,
  },
});

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `฿${amount.toLocaleString()}`;
}

function ItineraryPDF({ itinerary }: { itinerary: ItineraryRecord }) {
  const nights = calcNights(itinerary.startDate, itinerary.endDate);
  const totalPrice = itinerary.totalPrice ?? itinerary.pricingLines.reduce((s, l) => s + l.total, 0);

  const dateRange = itinerary.startDate && itinerary.endDate
    ? `${formatDate(itinerary.startDate)} – ${formatDate(itinerary.endDate)}`
    : '';

  return React.createElement(
    Document,
    { title: itinerary.title, author: 'Werest Travel' },
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },

      // ── Cover Header ──
      React.createElement(
        View,
        { style: styles.coverHeader },
        React.createElement(
          View,
          { style: styles.companyBadge },
          React.createElement(
            View,
            { style: styles.companyLogo },
            React.createElement(Text, { style: styles.companyLogoText }, 'W')
          ),
          React.createElement(Text, { style: styles.companyName }, 'WEREST TRAVEL')
        ),
        React.createElement(Text, { style: styles.coverTitle }, itinerary.title),
        itinerary.subtitle
          ? React.createElement(Text, { style: styles.coverSubtitle }, itinerary.subtitle)
          : null,
        React.createElement(
          View,
          { style: styles.coverMeta },
          dateRange ? React.createElement(
            View, { style: styles.coverMetaItem },
            React.createElement(Text, { style: styles.coverMetaText }, `📅 ${dateRange}`)
          ) : null,
          nights > 0 ? React.createElement(
            View, { style: styles.coverMetaItem },
            React.createElement(Text, { style: styles.coverMetaText }, `🌙 ${nights} Night${nights > 1 ? 's' : ''}`)
          ) : null,
          React.createElement(
            View, { style: styles.coverMetaItem },
            React.createElement(Text, { style: styles.coverMetaText }, `👥 ${itinerary.travelers} Traveler${itinerary.travelers > 1 ? 's' : ''}`)
          ),
          itinerary.clientName ? React.createElement(
            View, { style: styles.coverMetaItem },
            React.createElement(Text, { style: styles.coverMetaText }, `👤 ${itinerary.clientName}`)
          ) : null,
        )
      ),

      // ── Body ──
      React.createElement(
        View,
        { style: styles.body },

        // Overview
        itinerary.overview ? React.createElement(
          View, { style: styles.section },
          React.createElement(
            View, { style: styles.sectionHeader },
            React.createElement(View, { style: styles.sectionDot }),
            React.createElement(Text, { style: styles.sectionTitle }, 'OVERVIEW')
          ),
          React.createElement(Text, { style: styles.overviewText }, itinerary.overview)
        ) : null,

        // Highlights
        itinerary.highlights.length > 0 ? React.createElement(
          View, { style: styles.section },
          React.createElement(
            View, { style: styles.sectionHeader },
            React.createElement(View, { style: styles.sectionDot }),
            React.createElement(Text, { style: styles.sectionTitle }, 'TRIP HIGHLIGHTS')
          ),
          React.createElement(
            View, { style: styles.highlightGrid },
            ...itinerary.highlights.map((h, i) =>
              React.createElement(
                View, { key: i, style: styles.highlightItem },
                React.createElement(Text, { style: styles.highlightCheck }, '✓'),
                React.createElement(Text, { style: styles.highlightText }, h)
              )
            )
          )
        ) : null,

        // Day Blocks
        itinerary.dayBlocks.length > 0 ? React.createElement(
          View, { style: styles.section },
          React.createElement(
            View, { style: styles.sectionHeader },
            React.createElement(View, { style: styles.sectionDot }),
            React.createElement(Text, { style: styles.sectionTitle }, 'DAY-BY-DAY ITINERARY')
          ),
          ...itinerary.dayBlocks.map((day) =>
            React.createElement(
              View, { key: day.day, style: styles.dayBlock },

              // Day header
              React.createElement(
                View, { style: styles.dayHeader },
                React.createElement(
                  View, { style: styles.dayNumberBadge },
                  React.createElement(Text, { style: styles.dayNumberText }, `DAY ${day.day}`)
                ),
                React.createElement(Text, { style: styles.dayTitle }, day.title),
                day.date ? React.createElement(Text, { style: styles.dayDate }, formatDate(day.date)) : null
              ),

              // Day body
              React.createElement(
                View, { style: styles.dayBody },
                day.description ? React.createElement(Text, { style: styles.dayDescription }, day.description) : null,

                // Activities
                ...day.activities.map((act, ai) =>
                  React.createElement(
                    View, { key: ai, style: styles.activityRow },
                    React.createElement(
                      View, { style: styles.activityTimeBadge },
                      act.time ? React.createElement(Text, { style: styles.activityTime }, act.time) : null
                    ),
                    React.createElement(View, { style: styles.activityDivider }),
                    React.createElement(
                      View, { style: styles.activityContent },
                      React.createElement(
                        Text,
                        { style: styles.activityTitle },
                        `${act.emoji ?? ACTIVITY_ICONS[act.type] ?? ''} ${act.title}`
                      ),
                      act.description ? React.createElement(Text, { style: styles.activityDesc }, act.description) : null,
                      act.notes ? React.createElement(Text, { style: styles.activityNotes }, `💡 ${act.notes}`) : null
                    )
                  )
                )
              ),

              // Day footer
              (day.accommodation || day.meals.length > 0 || day.transferInfo) ? React.createElement(
                View, { style: styles.dayFooter },
                day.accommodation ? React.createElement(
                  View, { style: styles.dayFooterItem },
                  React.createElement(Text, { style: styles.dayFooterLabel }, '🏨'),
                  React.createElement(Text, { style: styles.dayFooterValue }, day.accommodation)
                ) : null,
                day.meals.length > 0 ? React.createElement(
                  View, { style: styles.dayFooterItem },
                  React.createElement(Text, { style: styles.dayFooterLabel }, '🍽️ Meals:'),
                  React.createElement(Text, { style: styles.dayFooterValue }, day.meals.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', '))
                ) : null,
                day.transferInfo ? React.createElement(
                  View, { style: styles.dayFooterItem },
                  React.createElement(Text, { style: styles.dayFooterLabel }, '🚗'),
                  React.createElement(Text, { style: styles.dayFooterValue }, day.transferInfo)
                ) : null
              ) : null
            )
          )
        ) : null,

        // Pricing Table
        itinerary.pricingLines.length > 0 ? React.createElement(
          View, { style: styles.section },
          React.createElement(
            View, { style: styles.sectionHeader },
            React.createElement(View, { style: styles.sectionDot }),
            React.createElement(Text, { style: styles.sectionTitle }, 'PRICING BREAKDOWN')
          ),
          React.createElement(
            View, { style: styles.pricingTable },
            React.createElement(
              View, { style: styles.pricingHeader },
              React.createElement(Text, { style: [styles.pricingHeaderCell, { flex: 3 }] }, 'Service'),
              React.createElement(Text, { style: [styles.pricingHeaderCell, { flex: 1, textAlign: 'center' }] }, 'Qty'),
              React.createElement(Text, { style: [styles.pricingHeaderCell, { flex: 1.5, textAlign: 'right' }] }, 'Unit Price'),
              React.createElement(Text, { style: [styles.pricingHeaderCell, { flex: 1.5, textAlign: 'right' }] }, 'Total')
            ),
            ...itinerary.pricingLines.map((line, i) =>
              React.createElement(
                View, { key: i, style: [styles.pricingRow, i % 2 === 1 ? styles.pricingRowAlt : {}] },
                React.createElement(
                  View, { style: { flex: 3 } },
                  React.createElement(Text, { style: [styles.pricingCell, styles.pricingCellBold] }, line.label),
                  line.description ? React.createElement(Text, { style: [styles.pricingCell, { fontSize: 8, color: GRAY_400, marginTop: 1 }] }, line.description) : null
                ),
                React.createElement(Text, { style: [styles.pricingCell, { flex: 1, textAlign: 'center' }] }, String(line.quantity)),
                React.createElement(Text, { style: [styles.pricingCell, { flex: 1.5, textAlign: 'right' }] }, formatCurrency(line.unitPrice)),
                React.createElement(Text, { style: [styles.pricingCell, styles.pricingCellBold, { flex: 1.5, textAlign: 'right' }] }, formatCurrency(line.total))
              )
            ),
            React.createElement(
              View, { style: styles.pricingTotal },
              React.createElement(Text, { style: styles.pricingTotalLabel }, 'TOTAL PACKAGE PRICE'),
              React.createElement(Text, { style: styles.pricingTotalValue }, formatCurrency(totalPrice))
            )
          )
        ) : null,

        // Inclusions / Exclusions
        (itinerary.inclusions.length > 0 || itinerary.exclusions.length > 0) ? React.createElement(
          View, { style: styles.section },
          React.createElement(
            View, { style: styles.sectionHeader },
            React.createElement(View, { style: styles.sectionDot }),
            React.createElement(Text, { style: styles.sectionTitle }, "WHAT'S INCLUDED & EXCLUDED")
          ),
          React.createElement(
            View, { style: styles.twoColRow },
            React.createElement(
              View, { style: styles.twoColItem },
              React.createElement(Text, { style: [styles.sectionTitle, { fontSize: 10, color: GREEN_500, marginBottom: 8 }] }, '✓ INCLUDED'),
              ...itinerary.inclusions.map((inc, i) =>
                React.createElement(
                  View, { key: i, style: styles.incExcItem },
                  React.createElement(Text, { style: styles.incBullet }, '✓'),
                  React.createElement(Text, { style: styles.incExcText }, inc)
                )
              )
            ),
            React.createElement(
              View, { style: styles.twoColItem },
              React.createElement(Text, { style: [styles.sectionTitle, { fontSize: 10, color: RED_500, marginBottom: 8 }] }, '✕ NOT INCLUDED'),
              ...itinerary.exclusions.map((exc, i) =>
                React.createElement(
                  View, { key: i, style: styles.incExcItem },
                  React.createElement(Text, { style: styles.excBullet }, '✕'),
                  React.createElement(Text, { style: styles.incExcText }, exc)
                )
              )
            )
          )
        ) : null,

        // Terms
        itinerary.terms ? React.createElement(
          View, { style: styles.section },
          React.createElement(
            View, { style: styles.sectionHeader },
            React.createElement(View, { style: styles.sectionDot }),
            React.createElement(Text, { style: styles.sectionTitle }, 'TERMS & CONDITIONS')
          ),
          React.createElement(Text, { style: styles.termsText }, itinerary.terms)
        ) : null,

        // Important Notes
        itinerary.importantNotes ? React.createElement(
          View, { style: styles.section },
          React.createElement(
            View, { style: styles.sectionHeader },
            React.createElement(View, { style: styles.sectionDot }),
            React.createElement(Text, { style: styles.sectionTitle }, 'IMPORTANT NOTES')
          ),
          React.createElement(Text, { style: styles.overviewText }, itinerary.importantNotes)
        ) : null
      ),

      // ── Footer ──
      React.createElement(
        View, { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, `Generated by Werest Travel • ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`),
        React.createElement(Text, { style: styles.footerBrand }, 'www.werest.com'),
        React.createElement(
          Text,
          {
            style: styles.footerText,
            render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Page ${pageNumber} of ${totalPages}`,
          }
        )
      )
    )
  );
}

export async function renderItineraryPDF(itinerary: ItineraryRecord): Promise<Buffer> {
  const element = React.createElement(ItineraryPDF, { itinerary });
  const buffer = await renderToBuffer(element as never);
  return buffer;
}
