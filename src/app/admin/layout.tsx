import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: 'noindex, nofollow',
};

// Auth is enforced by src/middleware.ts — it redirects all /admin/* routes
// (except /admin/login) to /admin/login when admin_token cookie is absent/invalid.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
