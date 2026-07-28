import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  Play,
  QrCode,
  Share2,
  Star,
} from 'lucide-react';

import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { DigitalBusinessCard } from '@/components/profile/DigitalBusinessCard';
import { ShareBar } from '@/components/profile/ShareBar';
import { professionalsApi, type PartnerProfile } from '@/lib/api';

import './PartnerProfilePage.css';

function formatCurrency(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function ProfileHero({ profile }: { profile: PartnerProfile }) {
  const verified = profile.badges[0];
  const rating = profile.statistics?.customerRating;
  const customers = profile.statistics?.customersServed;

  const photo = profile.photoUrl ? (
    <img src={profile.photoUrl} alt={profile.displayName} className="profile-hero__photo" />
  ) : (
    <div className="profile-hero__photo profile-hero__photo--placeholder" aria-hidden>
      <span>{profile.displayName.charAt(0)}</span>
    </div>
  );

  return (
    <section className="profile-hero">
      <div
        className="profile-hero__cover"
        style={profile.coverImageUrl ? { backgroundImage: `url(${profile.coverImageUrl})` } : undefined}
      />
      <div className="profile-hero__glow" aria-hidden />
      <div className="profile-hero__body">
        <div className="profile-hero__layout">
          <div className="profile-hero__copy">
            {verified ? (
              <p className="profile-hero__eyebrow">
                <BadgeCheck size={14} /> {verified.label}
              </p>
            ) : (
              <p className="profile-hero__eyebrow">
                <BadgeCheck size={14} /> Kuber Verified
              </p>
            )}

            <div className="profile-hero__identity">
              <div className="profile-hero__visual profile-hero__visual--mobile">
                <div className="profile-hero__photo-wrap">
                  {photo}
                </div>
              </div>
              <div className="profile-hero__titles">
                <h1>{profile.displayName}</h1>
                <p className="profile-hero__designation">{profile.designation}</p>
                {profile.companyName ? (
                  <p className="profile-hero__company">
                    <Building2 size={15} /> {profile.companyName}
                  </p>
                ) : null}
              </div>
            </div>

            {profile.tagline ? <p className="profile-hero__tagline">{profile.tagline}</p> : null}
            <div className="profile-hero__meta">
              {profile.experienceYears ? <span>{profile.experienceYears}+ yrs</span> : null}
              {profile.location.label ? <span>{profile.location.label}</span> : null}
              {profile.languages.length ? <span>{profile.languages.slice(0, 3).join(' · ')}</span> : null}
              {profile.businessSince ? <span>Since {profile.businessSince}</span> : null}
            </div>
            <ProfileActions profile={profile} />
          </div>

          <aside className="profile-hero__visual profile-hero__visual--desktop">
            <div className="profile-hero__portrait">
              <div className="profile-hero__photo-wrap">
                {photo}
                {profile.companyLogoUrl ? (
                  <img src={profile.companyLogoUrl} alt={profile.companyName ?? ''} className="profile-hero__logo" />
                ) : null}
              </div>
              <div className="profile-hero__portrait-meta">
                <strong>{profile.displayName}</strong>
                <span>{profile.companyName || profile.designation}</span>
                <div className="profile-hero__portrait-stats">
                  {profile.experienceYears ? <em>{profile.experienceYears}+ yrs</em> : null}
                  {rating ? <em>{rating.toFixed(1)} ★</em> : null}
                  {customers ? <em>{customers.toLocaleString()}+ clients</em> : null}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ProfileActions({ profile }: { profile: PartnerProfile }) {
  const [showCard, setShowCard] = useState(false);

  return (
    <>
      <div className="profile-actions">
        {profile.contact.consultationUrl || profile.contact.calendarUrl ? (
          <a href={profile.contact.consultationUrl ?? profile.contact.calendarUrl!} className="btn btn-primary" target="_blank" rel="noreferrer">
            <Calendar size={16} /> Book Consultation
          </a>
        ) : (
          <a href="#consultation" className="btn btn-primary">
            <Calendar size={16} /> Book Consultation
          </a>
        )}
        {profile.contact.phone ? (
          <a href={`tel:${profile.contact.phone}`} className="btn btn-secondary profile-actions__call">
            <Phone size={16} /> <span>Call</span>
          </a>
        ) : null}
        {profile.contact.whatsapp ? (
          <a
            href={`https://wa.me/91${profile.contact.whatsapp}`}
            className="btn btn-secondary profile-actions__wa"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} /> <span>WhatsApp</span>
          </a>
        ) : null}
        {profile.contact.applyLoanUrl ? (
          <a href={profile.contact.applyLoanUrl} className="btn btn-secondary" target="_blank" rel="noreferrer">
            Apply Loan
          </a>
        ) : null}
        {profile.contact.applyInsuranceUrl ? (
          <a href={profile.contact.applyInsuranceUrl} className="btn btn-secondary" target="_blank" rel="noreferrer">
            Apply Insurance
          </a>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={() => setShowCard(true)}>
          <QrCode size={16} /> Digital Card
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          <Download size={16} /> Download
        </button>
      </div>
      {showCard ? <DigitalBusinessCard profile={profile} onClose={() => setShowCard(false)} /> : null}
    </>
  );
}

export function PartnerProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [showShare, setShowShare] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', slug],
    queryFn: () => professionalsApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { data: shareUrls } = useQuery({
    queryKey: ['share', slug],
    queryFn: () => professionalsApi.getShareUrls(slug!),
    enabled: !!slug && showShare,
  });

  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <div className="container" style={{ padding: '4rem 0' }}>
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <SiteHeader />
        <div className="container profile-not-found glass-card">
          <h1>Profile not found</h1>
          <p>This professional profile may not be published yet.</p>
        </div>
        <SiteFooter />
      </>
    );
  }

  const avgRating =
    profile.reviews.length > 0
      ? profile.reviews.reduce((s, r) => s + r.rating, 0) / profile.reviews.length
      : profile.statistics?.customerRating;

  return (
    <>
      <Helmet>
        <title>{profile.seo.title}</title>
        <meta name="description" content={profile.seo.description} />
        {profile.seo.keywords.map((kw) => (
          <meta key={kw} name="keywords" content={kw} />
        ))}
        <meta property="og:title" content={profile.seo.title} />
        <meta property="og:description" content={profile.seo.description} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={profile.profileUrl} />
        {profile.photoUrl ? <meta property="og:image" content={profile.photoUrl} /> : null}
      </Helmet>
      <SiteHeader />
      <main className="profile-page">
        <ProfileHero profile={profile} />

        <div className="container profile-powered">
          <span>Associated with {profile.associatedWith}</span>
          <span className="profile-powered__plus">·</span>
          <span className="profile-powered__kuber">Powered by {profile.poweredBy}</span>
        </div>

        <button type="button" className="profile-share-fab btn btn-primary" onClick={() => setShowShare(true)}>
          <Share2 size={18} /> Share
        </button>
        {showShare && shareUrls ? <ShareBar urls={shareUrls} onClose={() => setShowShare(false)} /> : null}

        {/* Section 2: About */}
        <section className="section" id="about">
          <div className="container">
            <h2 className="section-title">About Me</h2>
            <div className="glass-card profile-section-card">
              {profile.biography ? <p className="profile-bio">{profile.biography}</p> : <p className="profile-bio muted">Biography coming soon.</p>}
              <div className="grid-2 profile-about-grid">
                {profile.mission ? (
                  <div>
                    <h3>Mission</h3>
                    <p>{profile.mission}</p>
                  </div>
                ) : null}
                {profile.vision ? (
                  <div>
                    <h3>Vision</h3>
                    <p>{profile.vision}</p>
                  </div>
                ) : null}
              </div>
              {profile.workingAreas.length ? (
                <div className="profile-tags">
                  <strong>Working Areas:</strong>
                  {profile.workingAreas.map((a) => (
                    <span key={a}>{a}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Section 3: Company */}
        <section className="section" id="company">
          <div className="container">
            <h2 className="section-title">Company Profile</h2>
            <div className="glass-card profile-section-card company-card">
              <div className="company-card__header">
                {profile.company.logoUrl ? <img src={profile.company.logoUrl} alt="" className="company-card__logo" /> : null}
                <div>
                  <h3>{profile.company.name}</h3>
                  {profile.company.category ? <p>{profile.company.category}</p> : null}
                </div>
              </div>
              <div className="grid-2">
                {profile.company.founderName ? <p><strong>Founder:</strong> {profile.company.founderName}</p> : null}
                {profile.company.establishedYear ? <p><strong>Established:</strong> {profile.company.establishedYear}</p> : null}
                {profile.company.gstNumber ? <p><strong>GST:</strong> {profile.company.gstNumber}</p> : null}
                {profile.company.website ? (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={profile.company.website} target="_blank" rel="noreferrer">{profile.company.website}</a>
                  </p>
                ) : null}
              </div>
              {profile.company.officeAddress ? <p><strong>Office:</strong> {profile.company.officeAddress}</p> : null}
              {profile.company.citiesServed.length ? (
                <div className="profile-tags">
                  <strong>Cities Served:</strong>
                  {profile.company.citiesServed.map((c) => <span key={c}>{c}</span>)}
                </div>
              ) : null}
              {profile.team.length ? (
                <div className="team-grid">
                  <h4>Team</h4>
                  <div className="grid-4">
                    {profile.team.map((m) => (
                      <div key={m.id} className="team-member">
                        {m.photoUrl ? <img src={m.photoUrl} alt={m.name} /> : <div className="team-member__avatar">{m.name.charAt(0)}</div>}
                        <strong>{m.name}</strong>
                        {m.role ? <span>{m.role}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Section 4: Expertise */}
        {profile.expertises.length ? (
          <section className="section" id="expertise">
            <div className="container">
              <h2 className="section-title">Professional Expertise</h2>
              <div className="grid-3">
                {profile.expertises.map((e) => (
                  <div key={e.type} className="glass-card expertise-card">
                    <CreditCard size={24} />
                    <h3>{e.label}</h3>
                    {e.isPrimary ? <span className="badge">Primary</span> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Section 5: Statistics */}
        {profile.statistics ? (
          <section className="section stats-section" id="statistics">
            <div className="container">
              <h2 className="section-title">Business Statistics</h2>
              <p className="section-subtitle">Verified metrics only</p>
              <div className="grid-4">
                {profile.statistics.businessFacilitated ? (
                  <div className="glass-card stat-card">
                    <strong>{formatCurrency(profile.statistics.businessFacilitated)}</strong>
                    <span>Business Facilitated</span>
                  </div>
                ) : null}
                {profile.statistics.customersServed ? (
                  <div className="glass-card stat-card">
                    <strong>{profile.statistics.customersServed.toLocaleString()}</strong>
                    <span>Customers Served</span>
                  </div>
                ) : null}
                {profile.statistics.experienceYears ? (
                  <div className="glass-card stat-card">
                    <strong>{profile.statistics.experienceYears}+</strong>
                    <span>Years Experience</span>
                  </div>
                ) : null}
                {profile.statistics.customerRating ? (
                  <div className="glass-card stat-card">
                    <strong>{profile.statistics.customerRating.toFixed(1)} <Star size={16} /></strong>
                    <span>Customer Rating</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* Section 6: Achievements */}
        {profile.achievements.length ? (
          <section className="section" id="achievements">
            <div className="container">
              <h2 className="section-title">Achievements</h2>
              <div className="grid-3">
                {profile.achievements.map((a) => (
                  <div key={a.id} className="glass-card achievement-card">
                    <Award size={28} />
                    <h3>{a.title ?? a.type.replace(/_/g, ' ')}</h3>
                    {a.year ? <span>{a.year}</span> : null}
                    {a.description ? <p>{a.description}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Section 7: Certificates */}
        {profile.certificates.length ? (
          <section className="section" id="certificates">
            <div className="container">
              <h2 className="section-title">Certificates</h2>
              <div className="grid-3">
                {profile.certificates.map((c) => (
                  <div key={c.id} className="glass-card cert-card">
                    <FileText size={24} />
                    <h3>{c.title}</h3>
                    {c.issuer ? <p>{c.issuer}</p> : null}
                    {c.downloadUrl ? (
                      <a href={c.downloadUrl} className="btn btn-ghost" target="_blank" rel="noreferrer">
                        <Download size={14} /> Download
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Section 8: Reviews */}
        {profile.reviews.length ? (
          <section className="section" id="reviews">
            <div className="container">
              <h2 className="section-title">Customer Reviews</h2>
              {avgRating ? (
                <p className="reviews-rating">
                  <Star size={20} /> {avgRating.toFixed(1)} average from {profile.reviews.length} verified reviews
                </p>
              ) : null}
              <div className="grid-2">
                {profile.reviews.map((r) => (
                  <div key={r.id} className="glass-card review-card">
                    <div className="review-card__header">
                      {r.photoUrl ? <img src={r.photoUrl} alt="" /> : <div className="review-card__avatar">{r.reviewerName.charAt(0)}</div>}
                      <div>
                        <strong>{r.reviewerName}</strong>
                        <div className="review-stars">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.comment ? <p>{r.comment}</p> : null}
                    {r.videoUrl ? (
                      <a href={r.videoUrl} className="btn btn-ghost" target="_blank" rel="noreferrer">
                        <Play size={14} /> Video Testimonial
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Section 9: Media */}
        {profile.media.length ? (
          <section className="section" id="media">
            <div className="container">
              <h2 className="section-title">Media</h2>
              <div className="grid-3">
                {profile.media.map((m) => (
                  <a key={m.id} href={m.url} className="glass-card media-card" target="_blank" rel="noreferrer">
                    {m.thumbnailUrl ? <img src={m.thumbnailUrl} alt="" /> : <div className="media-card__placeholder"><Play size={32} /></div>}
                    <h3>{m.title}</h3>
                    <span className="badge">{m.type.replace(/_/g, ' ')}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Section 10: Gallery */}
        {profile.gallery.length ? (
          <section className="section" id="gallery">
            <div className="container">
              <h2 className="section-title">Business Gallery</h2>
              <div className="gallery-grid">
                {profile.gallery.map((g) => (
                  <figure key={g.id} className="gallery-item glass-card">
                    <img src={g.imageUrl} alt={g.title ?? g.category} />
                    {g.caption ? <figcaption>{g.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Section 11: Consultation */}
        <section className="section consultation-section" id="consultation">
          <div className="container">
            <h2 className="section-title">Book Consultation</h2>
            <div className="glass-card consultation-card">
              <div className="grid-2">
                <div>
                  <p>Connect directly for personalized financial guidance.</p>
                  <div className="consultation-links">
                    {profile.contact.whatsapp ? (
                      <a href={`https://wa.me/91${profile.contact.whatsapp}`} className="btn btn-primary" target="_blank" rel="noreferrer">
                        <MessageCircle size={16} /> WhatsApp
                      </a>
                    ) : null}
                    {profile.contact.phone ? (
                      <a href={`tel:${profile.contact.phone}`} className="btn btn-secondary">
                        <Phone size={16} /> {profile.contact.phone}
                      </a>
                    ) : null}
                    {profile.contact.email ? (
                      <a href={`mailto:${profile.contact.email}`} className="btn btn-secondary">
                        <Mail size={16} /> Email
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="consultation-cta">
                  {profile.contact.calendarUrl ? (
                    <a href={profile.contact.calendarUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
                      <Calendar size={16} /> Schedule Appointment
                    </a>
                  ) : null}
                  {profile.contact.applyLoanUrl ? (
                    <a href={profile.contact.applyLoanUrl} className="btn btn-secondary" target="_blank" rel="noreferrer">
                      Apply Now — Loan
                    </a>
                  ) : null}
                </div>
              </div>
              <p className="powered-footer">
                <Globe size={14} /> Powered by {profile.poweredBy}
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
