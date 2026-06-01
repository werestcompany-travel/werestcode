import {
  Document, Page, Text, View, StyleSheet, Font,
} from '@react-pdf/renderer';

/* ── Types ─────────────────────────────────────────────────────────────────── */
export interface InvoiceLineItem {
  description: string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

export interface InvoiceData {
  invoiceNumber:   string; // e.g. WTINV-WR-20240001
  bookingRef:      string;
  issueDate:       string; // ISO
  customerName:    string;
  customerEmail:   string;
  customerPhone:   string;
  lineItems:       InvoiceLineItem[];
  subtotal:        number;
  vatAmount:       number;  // 7%
  totalAmount:     number;
  currency:        string;  // THB
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const S = StyleSheet.create({
  page:           { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#1a1a2e' },
  header:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  logoArea:       { flex: 1 },
  company:        { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#2534ff' },
  tagline:        { fontSize: 8, color: '#666', marginTop: 2 },
  meta:           { fontSize: 8, color: '#666', marginTop: 1 },
  invoiceTitle:   { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#2534ff', textAlign: 'right' },
  invoiceNo:      { fontSize: 10, color: '#555', textAlign: 'right', marginTop: 4 },
  section:        { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  blockTitle:     { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#888', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1 },
  blockText:      { fontSize: 10, color: '#333', marginBottom: 2 },
  divider:        { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 16 },
  tableHeader:    { flexDirection: 'row', backgroundColor: '#2534ff', color: '#fff', padding: '6 8', borderRadius: 4, marginBottom: 4 },
  tableRow:       { flexDirection: 'row', padding: '5 8', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  col1:           { flex: 3 },
  col2:           { flex: 1, textAlign: 'center' },
  col3:           { flex: 1, textAlign: 'right' },
  col4:           { flex: 1, textAlign: 'right' },
  thText:         { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#fff' },
  totalsArea:     { alignItems: 'flex-end', marginTop: 12, marginBottom: 24 },
  totalRow:       { flexDirection: 'row', width: 240, justifyContent: 'space-between', marginBottom: 4 },
  totalLabel:     { fontSize: 10, color: '#555' },
  totalValue:     { fontSize: 10, color: '#333', fontFamily: 'Helvetica-Bold' },
  grandRow:       { flexDirection: 'row', width: 240, justifyContent: 'space-between', backgroundColor: '#2534ff', padding: '6 8', borderRadius: 4, marginTop: 4 },
  grandLabel:     { fontSize: 11, color: '#fff', fontFamily: 'Helvetica-Bold' },
  grandValue:     { fontSize: 11, color: '#fff', fontFamily: 'Helvetica-Bold' },
  bankSection:    { backgroundColor: '#f8f9ff', padding: 12, borderRadius: 6, marginBottom: 20 },
  bankTitle:      { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#2534ff', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  bankRow:        { flexDirection: 'row', marginBottom: 3 },
  bankKey:        { fontSize: 9, color: '#666', width: 100 },
  bankVal:        { fontSize: 9, color: '#333', fontFamily: 'Helvetica-Bold' },
  footer:         { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 8 },
  footerText:     { fontSize: 8, color: '#999', textAlign: 'center', marginBottom: 2 },
  vatNote:        { fontSize: 8, color: '#888', marginTop: 4 },
});

/* ── Helpers ─────────────────────────────────────────────────────────────────── */
function money(n: number, currency = 'THB') {
  return `${currency} ${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function InvoicePDF({ data }: { data: InvoiceData }) {
  return (
    <Document
      title={`Invoice ${data.invoiceNumber}`}
      author="Werest Travel Co., Ltd."
      subject={`VAT Invoice for booking ${data.bookingRef}`}
    >
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <View style={S.logoArea}>
            <Text style={S.company}>WEREST TRAVEL</Text>
            <Text style={S.tagline}>Private Transfers &amp; Tours in Thailand</Text>
            <Text style={S.meta}>Werest Travel Co., Ltd.</Text>
            <Text style={S.meta}>Bangkok, Thailand</Text>
            <Text style={S.meta}>TAT License: 00/00000  |  VAT Reg: 0000000000000</Text>
            <Text style={S.meta}>info@werest.com  |  www.werest.com</Text>
          </View>
          <View>
            <Text style={S.invoiceTitle}>TAX INVOICE</Text>
            <Text style={S.invoiceNo}>{data.invoiceNumber}</Text>
            <Text style={S.invoiceNo}>Date: {fmtDate(data.issueDate)}</Text>
            <Text style={S.invoiceNo}>Booking: {data.bookingRef}</Text>
          </View>
        </View>

        <View style={S.divider} />

        {/* Bill to */}
        <View style={S.section}>
          <View>
            <Text style={S.blockTitle}>Bill To</Text>
            <Text style={S.blockText}>{data.customerName}</Text>
            <Text style={S.blockText}>{data.customerEmail}</Text>
            <Text style={S.blockText}>{data.customerPhone}</Text>
          </View>
          <View>
            <Text style={S.blockTitle}>From</Text>
            <Text style={S.blockText}>Werest Travel Co., Ltd.</Text>
            <Text style={S.blockText}>Bangkok, Thailand 10110</Text>
            <Text style={S.blockText}>Tel: +66 62 187 1392</Text>
          </View>
        </View>

        {/* Table header */}
        <View style={S.tableHeader}>
          <Text style={[S.col1, S.thText]}>Description</Text>
          <Text style={[S.col2, S.thText]}>Qty</Text>
          <Text style={[S.col3, S.thText]}>Unit Price</Text>
          <Text style={[S.col4, S.thText]}>Total</Text>
        </View>

        {/* Line items */}
        {data.lineItems.map((item, i) => (
          <View key={i} style={S.tableRow}>
            <Text style={S.col1}>{item.description}</Text>
            <Text style={S.col2}>{item.quantity}</Text>
            <Text style={S.col3}>{money(item.unitPrice, data.currency)}</Text>
            <Text style={S.col4}>{money(item.total, data.currency)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={S.totalsArea}>
          <View style={S.totalRow}>
            <Text style={S.totalLabel}>Subtotal (excl. VAT)</Text>
            <Text style={S.totalValue}>{money(data.subtotal, data.currency)}</Text>
          </View>
          <View style={S.totalRow}>
            <Text style={S.totalLabel}>VAT 7%</Text>
            <Text style={S.totalValue}>{money(data.vatAmount, data.currency)}</Text>
          </View>
          <View style={S.grandRow}>
            <Text style={S.grandLabel}>Total Due</Text>
            <Text style={S.grandValue}>{money(data.totalAmount, data.currency)}</Text>
          </View>
        </View>

        {/* Bank details */}
        <View style={S.bankSection}>
          <Text style={S.bankTitle}>Bank Transfer Details</Text>
          <View style={S.bankRow}><Text style={S.bankKey}>Bank Name</Text><Text style={S.bankVal}>Bangkok Bank PCL</Text></View>
          <View style={S.bankRow}><Text style={S.bankKey}>Account Name</Text><Text style={S.bankVal}>Werest Travel Co., Ltd.</Text></View>
          <View style={S.bankRow}><Text style={S.bankKey}>Account No.</Text><Text style={S.bankVal}>Contact us for details</Text></View>
          <View style={S.bankRow}><Text style={S.bankKey}>SWIFT Code</Text><Text style={S.bankVal}>BKKBTHBK</Text></View>
          <View style={S.bankRow}><Text style={S.bankKey}>Reference</Text><Text style={S.bankVal}>{data.bookingRef}</Text></View>
        </View>

        {/* VAT note */}
        <Text style={S.vatNote}>
          This is a VAT invoice issued under Thai Revenue Department requirements. VAT 7% is included in the total.
          Subtotal shown is the VAT-exclusive base (Total / 1.07). VAT = Total - Subtotal.
        </Text>

        {/* Footer */}
        <View style={S.footer}>
          <Text style={S.footerText}>Werest Travel Co., Ltd.  |  Bangkok, Thailand  |  www.werest.com  |  info@werest.com</Text>
          <Text style={S.footerText}>Company Registration No: 0000000000000  |  TAT License: 00/00000</Text>
          <Text style={S.footerText}>Thank you for choosing Werest Travel. For queries, please contact info@werest.com.</Text>
        </View>

      </Page>
    </Document>
  );
}
