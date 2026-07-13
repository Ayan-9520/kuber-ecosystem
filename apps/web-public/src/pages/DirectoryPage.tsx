import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search, Star } from 'lucide-react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { professionalsApi } from '@/lib/api';

import './DirectoryPage.css';

const EXPERTISE_OPTIONS = [
  { value: '', label: 'All Specializations' },
  { value: 'HOME_LOAN', label: 'Home Loan' },
  { value: 'BUSINESS_LOAN', label: 'Business Loan' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'LOAN_AGAINST_PROPERTY', label: 'LAP' },
  { value: 'CREDIT_CARDS', label: 'Credit Cards' },
];

export function DirectoryPage() {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [search, setSearch] = useState('');
  const [expertise, setExpertise] = useState('');
  const [language, setLanguage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['professionals', city, state, search, expertise, language],
    queryFn: () =>
      professionalsApi.list({
        city: city || undefined,
        state: state || undefined,
        search: search || undefined,
        expertise: expertise || undefined,
        language: language || undefined,
        limit: 24,
      }),
  });

  return (
    <>
      <SiteHeader />
      <main className="directory-page">
        <section className="directory-hero">
          <div className="container">
            <h1>Find a Kuber Verified Professional™</h1>
            <p>Trusted financial business professionals across India — backed by Kuber Finserve.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="glass-card directory-filters">
              <div className="directory-filters__search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search by name, company, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              <input type="text" placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />
              <select value={expertise} onChange={(e) => setExpertise(e.target.value)}>
                {EXPERTISE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="grid-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 220 }} />
                ))}
              </div>
            ) : data?.items.length ? (
              <div className="grid-3">
                {data.items.map((pro) => (
                  <Link key={pro.slug} to={`/partner/${pro.slug}`} className="glass-card pro-card">
                    <div className="pro-card__header">
                      {pro.photoUrl ? (
                        <img src={pro.photoUrl} alt={pro.displayName} className="pro-card__photo" />
                      ) : (
                        <div className="pro-card__photo pro-card__photo--placeholder">
                          {pro.displayName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3>{pro.displayName}</h3>
                        <p>{pro.designation}</p>
                        {pro.companyName ? <p className="pro-card__company">{pro.companyName}</p> : null}
                      </div>
                    </div>
                    <div className="pro-card__meta">
                      {pro.city ? (
                        <span>
                          <MapPin size={14} /> {[pro.city, pro.state].filter(Boolean).join(', ')}
                        </span>
                      ) : null}
                      {pro.customerRating ? (
                        <span>
                          <Star size={14} /> {pro.customerRating.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <div className="pro-card__tags">
                      {pro.expertises.slice(0, 3).map((e) => (
                        <span key={e.type}>{e.label}</span>
                      ))}
                    </div>
                    <div className="pro-card__badges">
                      {pro.badges.slice(0, 2).map((b) => (
                        <span key={b.type} className="badge">
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass-card directory-empty">
                <p>No professionals found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
