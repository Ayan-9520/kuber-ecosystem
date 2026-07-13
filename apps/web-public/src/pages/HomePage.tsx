import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, Globe, Sparkles } from 'lucide-react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

import './HomePage.css';

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="container hero__inner">
            <div className="hero__content">
              <span className="hero__eyebrow">
                <Sparkles size={16} /> Kuber Verified Professional™
              </span>
              <h1>
                Your Business.
                <br />
                Your Brand.
                <br />
                <span>Powered by Kuber Finserve.</span>
              </h1>
              <p>
                A premium digital business identity for every financial professional — not a DSA profile, but your
                own executive presence backed by Kuber&apos;s technology, products, and credibility.
              </p>
              <div className="hero__actions">
                <Link to="/professionals" className="btn btn-primary">
                  Find a Professional <ArrowRight size={18} />
                </Link>
                <a href="https://dsa.kuberone.com" className="btn btn-secondary">
                  Partner Dashboard
                </a>
              </div>
            </div>
            <div className="hero__card glass-card">
              <div className="hero__card-badge">
                <BadgeCheck size={18} /> Verified Professional
              </div>
              <div className="hero__card-profile">
                <div className="hero__avatar" />
                <div>
                  <strong>Narender Pal</strong>
                  <span>Founder | Kesar Enterprises</span>
                  <span className="hero__card-sub">Executive Partner | Kuber Finserve</span>
                </div>
              </div>
              <div className="hero__card-tags">
                <span>Home Loan</span>
                <span>Business Loan</span>
                <span>Insurance</span>
                <span>LAP</span>
              </div>
              <div className="hero__card-meta">
                <Building2 size={16} /> Delhi NCR
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">LinkedIn Premium + Google Business + Forbes Executive</h2>
            <p className="section-subtitle">
              Every partner gets a shareable, SEO-indexed profile designed for LinkedIn, WhatsApp, business cards, and
              Google Search.
            </p>
            <div className="grid-3 features">
              {[
                { title: 'Co-Branded Identity', desc: 'Your company brand + Powered by Kuber Finserve' },
                { title: 'Trust Badges', desc: 'KYC Verified, Academy Certified, Top Performer' },
                { title: 'AI Personal Branding', desc: 'Daily content for LinkedIn, Instagram, and more' },
                { title: 'Digital Business Card', desc: 'Premium card with QR code — front & back' },
                { title: 'Public Directory', desc: 'Customers find you by city, expertise, and rating' },
                { title: 'Verified Metrics', desc: 'Only display actual verified business statistics' },
              ].map((f) => (
                <article key={f.title} className="glass-card feature-card">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section cta-section">
          <div className="container glass-card cta-card">
            <Globe size={32} />
            <div>
              <h2>Ready to build your digital business identity?</h2>
              <p>Share your profile everywhere — LinkedIn, Facebook, Instagram, WhatsApp, X, email signature, and QR code.</p>
            </div>
            <Link to="/professionals" className="btn btn-primary">
              Explore Directory
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
