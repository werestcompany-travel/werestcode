import AdminShell from '@/components/admin/AdminShell';
import WhatsAppTemplateClient from './WhatsAppTemplateClient';

export default function WhatsAppTemplatesPage() {
  return (
    <AdminShell title="WhatsApp Templates">
      <WhatsAppTemplateClient />
    </AdminShell>
  );
}
