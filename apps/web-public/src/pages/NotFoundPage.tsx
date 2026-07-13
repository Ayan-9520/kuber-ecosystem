import { Link } from 'react-router-dom';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

export function NotFoundPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h1>Page not found</h1>
        <p style={{ color: 'var(--text-muted)' }}>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Go Home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
