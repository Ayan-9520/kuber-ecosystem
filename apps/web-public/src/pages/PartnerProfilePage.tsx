import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Car,
  CreditCard,
  Download,
  FileText,
  Globe,
  Home,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  QrCode,
  Share2,
  Shield,
  Star,
  UserRound,
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

function expertiseIcon(type: string) {
  const key = type.toUpperCase();
  if (key.includes('HOME')) return Home;
  if (key.includes('BUSINESS') || key.includes('SME')) return Briefcase;
  if (key.includes('PERSONAL')) return UserRound;
  if (key.includes('AUTO') || key.includes('CAR') || key.includes('VEHICLE')) return Car;
  if (key.includes('INSURANCE')) return Shield;
  if (key.includes('PROPERTY') || key.includes('LAP')) return Building2;
  return CreditCard;
}

function hasCompanyContent(profile: PartnerProfile) {
  const c = profile.company;
  return Boolean(
    c.name ||
      c.logoUrl ||
      c.category ||
      c.founderName ||
      c.establishedYear ||
      c.officeAddress ||
      c.gstNumber ||
      c.website ||
      c.citiesServed.length ||
      profile.team.length,
  );
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? 'KV').toUpperCase();
}

function ProfileActions({ profile }: { profile: PartnerProfile }) {
  const [showCard, setShowCard] = useState(false);

  return (
    <>
      <div className="profile-actions">
        {profile.contact.consultationUrl || profile.contact.calendarUrl ? (
          <a
            href={profile.contact.consultationUrl ?? profile.contact.calendarUrl!}
            className="profile-actions__primary"
            target="_blank"
            rel="noreferrer"
          >
            <Calendar size={16} /> Book Consultation
          </a>
        ) : (
          <a href="#consultation" className="profile-actions__primary">
            <Calendar size={16} /> Book Consultation
          </a>
        )}
        {profile.contact.phone ? (
          <a href={`tel:${profile.contact.phone}`} className="profile-actions__secondary">
            <Phone size={16} /> Call
          </a>
        ) : null}
        {profile.contact.whatsapp ? (
          <a
            href={`https://wa.me/91${profile.contact.whatsapp}`}
            className="profile-actions__secondary"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        ) : null}
        <button type="button" className="profile-actions__secondary" onClick={() => setShowCard(true)}>
          <QrCode size={16} /> Digital Card
        </button>
      </div>
      {showCard ? <DigitalBusinessCard profile={profile} onClose={() => setShowCard(false)} /> : null}
    </>
  );
}

function ProfileHero({ profile }: { profile: PartnerProfile }) {
  const verified = profile.badges[0];
  const meta = [
    profile.experienceYears ? `${profile.experienceYears}+ yrs` : null,
    profile.location.label || null,
    profile.languages.length ? profile.languages.slice(0, 3).join(' · ') : null,
    profile.businessSince ? `Since ${profile.businessSince}` : null,
  ].filter(Boolean) as string[];

  return (
    <section className="profile-hero">
      <div
        className="profile-hero__cover"
        style={profile.coverImageUrl ? { backgroundImage: `url(${profile.coverImageUrl})` } : undefined}
      />
      <div className="profile-hero__shade" aria-hidden />

      <div className="profile-hero__body">
        <div className="profile-hero__panel">
          <div className="profile-hero__identity">
            <div className="profile-hero__avatar">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={profile.displayName} />
              ) : (
                <span>{initialsFromName(profile.displayName)}</span>
              )}
              <em className="profile-hero__verified" title="Kuber Verified">
                <BadgeCheck size={16} />
              </em>
            </div>

            <div className="profile-hero__copy">
              <p className="profile-hero__eyebrow">
                <Shield size={13} />
                {verified?.label ?? 'Kuber Verified Professional'}
              </p>
              <h1>{profile.displayName}</h1>
              <p className="profile-hero__role">{profile.designation}</p>
              {profile.companyName ? (
                <p className="profile-hero__company">
                  <Building2 size={15} /> {profile.companyName}
                </p>
              ) : null}
              {profile.tagline ? <p className="profile-hero__tagline">{profile.tagline}</p> : null}
              {meta.length ? (
                <div className="profile-hero__meta">
                  {meta.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ) : null}
              <ProfileActions profile={profile} />
            </div>
          </div>

          <aside className="profile-hero__credential">
            <p className="profile-hero__credential-label">
              <BadgeCheck size={14} /> Kuber Credential
            </p>
            <div className="profile-hero__credential-avatar">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="" />
              ) : (
                <span>{initialsFromName(profile.displayName)}</span>
              )}
            </div>
            <strong>{profile.displayName}</strong>
            <span>{profile.designation}</span>
            {profile.companyName ? <em>{profile.companyName}</em> : null}
            <div className="profile-hero__credential-stats">
              {profile.experienceYears ? (
                <div>
                  <b>{profile.experienceYears}+</b>
                  <small>Years</small>
                </div>
              ) : null}
              {profile.statistics?.customerRating ? (
                <div>
                  <b>{profile.statistics.customerRating.toFixed(1)}</b>
                  <small>Rating</small>
                </div>
              ) : null}
              <div>
                <b>{profile.businessSince || '—'}</b>
                <small>Since</small>
              </div>
            </div>
            <p className="profile-hero__credential-foot">Powered by {profile.poweredBy}</p>
          </aside>
        </div>
      </div>
    </section>
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
          <div className="skeleton" style={{ height: 420, borderRadius: 28 }} />
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

  const showCompany = hasCompanyContent(profile);

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

        <div className="container profile-trust">
          <span>Associated with {profile.associatedWith}</span>
          <span className="profile-trust__sep" aria-hidden>
            ·
          </span>
          <span className="profile-trust__brand">Powered by {profile.poweredBy}</span>
        </div>

        <button type="button" className="profile-share-fab" onClick={() => setShowShare(true)}>
          <Share2 size={18} />
          <span>Share</span>
        </button>
        {showShare && shareUrls ? <ShareBar urls={shareUrls} onClose={() => setShowShare(false)} /> : null}

        <section className="section" id="about">
          <div className="container">
            <p className="section-kicker">Story</p>
            <h2 className="section-title">About {profile.displayName.split(' ')[0]}</h2>
            <div className="premium-card about-card">
              {profile.biography ? (
                <p className="profile-bio">{profile.biography}</p>
              ) : (
                <p className="profile-bio muted">
                  Update your biography from the Partner app → Brand section to show your story here.
                </p>
              )}
              {(profile.mission || profile.vision) && (
                <div className="about-split">
                  {profile.mission ? (
                    <div className="about-split__item">
                      <h3>Mission</h3>
                      <p>{profile.mission}</p>
                    </div>
                  ) : null}
                  {profile.vision ? (
                    <div className="about-split__item">
                      <h3>Vision</h3>
                      <p>{profile.vision}</p>
                    </div>
                  ) : null}
                </div>
              )}
              {profile.workingAreas.length ? (
                <div className="profile-tags">
                  <strong>Working Areas</strong>
                  {profile.workingAreas.map((a) => (
                    <span key={a}>{a}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {showCompany ? (
          <section className="section" id="company">
            <div className="container">
              <p className="section-kicker">Business</p>
              <h2 className="section-title">Company Profile</h2>
              <div className="premium-card company-card">
                <div className="company-card__top">
                  <div className="company-card__mark">
                    {profile.company.logoUrl ? (
                      <img src={profile.company.logoUrl} alt="" />
                    ) : (
                      <span>{(profile.company.name || profile.displayName).charAt(0)}</span>
                    )}
                  </div>
                  <div className="company-card__intro">
                    <h3>{profile.company.name || profile.companyName || profile.displayName}</h3>
                    {profile.company.category ? <p>{profile.company.category}</p> : null}
                  </div>
                </div>

                <div className="company-facts">
                  {profile.company.founderName ? (
                    <div className="company-fact">
                      <UserRound size={16} />
                      <div>
                        <em>Founder</em>
                        <strong>{profile.company.founderName}</strong>
                      </div>
                    </div>
                  ) : null}
                  {profile.company.establishedYear ? (
                    <div className="company-fact">
                      <Calendar size={16} />
                      <div>
                        <em>Established</em>
                        <strong>{profile.company.establishedYear}</strong>
                      </div>
                    </div>
                  ) : null}
                  {profile.company.officeAddress ? (
                    <div className="company-fact company-fact--wide">
                      <MapPin size={16} />
                      <div>
                        <em>Office</em>
                        <strong>{profile.company.officeAddress}</strong>
                      </div>
                    </div>
                  ) : null}
                  {profile.company.gstNumber ? (
                    <div className="company-fact">
                      <FileText size={16} />
                      <div>
                        <em>GST</em>
                        <strong>{profile.company.gstNumber}</strong>
                      </div>
                    </div>
                  ) : null}
                  {profile.company.website ? (
                    <div className="company-fact company-fact--wide">
                      <Globe size={16} />
                      <div>
                        <em>Website</em>
                        <strong>
                          <a href={profile.company.website} target="_blank" rel="noreferrer">
                            {profile.company.website}
                          </a>
                        </strong>
                      </div>
                    </div>
                  ) : null}
                </div>

                {profile.company.citiesServed.length ? (
                  <div className="profile-tags">
                    <strong>Cities Served</strong>
                    {profile.company.citiesServed.map((c) => (
                      <span key={c}>{c}</span>
                    ))}
                  </div>
                ) : null}

                {profile.team.length ? (
                  <div className="team-grid">
                    <h4>Team</h4>
                    <div className="grid-4">
                      {profile.team.map((m) => (
                        <div key={m.id} className="team-member">
                          {m.photoUrl ? (
                            <img src={m.photoUrl} alt={m.name} />
                          ) : (
                            <div className="team-member__avatar">{m.name.charAt(0)}</div>
                          )}
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
        ) : null}

        {profile.expertises.length ? (
          <section className="section" id="expertise">
            <div className="container">
              <p className="section-kicker">Products</p>
              <h2 className="section-title">Professional Expertise</h2>
              <div className="expertise-grid">
                {profile.expertises.map((e) => {
                  const Icon = expertiseIcon(e.type);
                  return (
                    <div key={e.type} className={`expertise-card${e.isPrimary ? ' expertise-card--primary' : ''}`}>
                      <div className="expertise-card__icon">
                        <Icon size={22} />
                      </div>
                      <h3>{e.label}</h3>
                      {e.isPrimary ? (
                        <span className="expertise-card__badge">Primary focus</span>
                      ) : (
                        <span className="expertise-card__hint">Advisory available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {profile.statistics ? (
          <section className="section stats-section" id="statistics">
            <div className="container">
              <p className="section-kicker">Impact</p>
              <h2 className="section-title">Business Statistics</h2>
              <p className="section-subtitle">Verified metrics only</p>
              <div className="grid-4">
                {profile.statistics.businessFacilitated ? (
                  <div className="stat-card">
                    <strong>{formatCurrency(profile.statistics.businessFacilitated)}</strong>
                    <span>Business Facilitated</span>
                  </div>
                ) : null}
                {profile.statistics.customersServed ? (
                  <div className="stat-card">
                    <strong>{profile.statistics.customersServed.toLocaleString()}</strong>
                    <span>Customers Served</span>
                  </div>
                ) : null}
                {profile.statistics.experienceYears ? (
                  <div className="stat-card">
                    <strong>{profile.statistics.experienceYears}+</strong>
                    <span>Years Experience</span>
                  </div>
                ) : null}
                {profile.statistics.customerRating ? (
                  <div className="stat-card">
                    <strong>
                      {profile.statistics.customerRating.toFixed(1)} <Star size={16} />
                    </strong>
                    <span>Customer Rating</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {profile.achievements.length ? (
          <section className="section" id="achievements">
            <div className="container">
              <p className="section-kicker">Recognition</p>
              <h2 className="section-title">Achievements</h2>
              <div className="grid-3">
                {profile.achievements.map((a) => (
                  <div key={a.id} className="achievement-card">
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

        {profile.certificates.length ? (
          <section className="section" id="certificates">
            <div className="container">
              <p className="section-kicker">Credentials</p>
              <h2 className="section-title">Certificates</h2>
              <div className="grid-3">
                {profile.certificates.map((c) => (
                  <div key={c.id} className="cert-card">
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

        {profile.reviews.length ? (
          <section className="section" id="reviews">
            <div className="container">
              <p className="section-kicker">Social proof</p>
              <h2 className="section-title">Customer Reviews</h2>
              {avgRating ? (
                <p className="reviews-rating">
                  <Star size={20} /> {avgRating.toFixed(1)} average from {profile.reviews.length} verified
                  reviews
                </p>
              ) : null}
              <div className="grid-2">
                {profile.reviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-card__header">
                      {r.photoUrl ? (
                        <img src={r.photoUrl} alt="" />
                      ) : (
                        <div className="review-card__avatar">{r.reviewerName.charAt(0)}</div>
                      )}
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

        {profile.media.length ? (
          <section className="section" id="media">
            <div className="container">
              <p className="section-kicker">Press</p>
              <h2 className="section-title">Media</h2>
              <div className="grid-3">
                {profile.media.map((m) => (
                  <a key={m.id} href={m.url} className="media-card" target="_blank" rel="noreferrer">
                    {m.thumbnailUrl ? (
                      <img src={m.thumbnailUrl} alt="" />
                    ) : (
                      <div className="media-card__placeholder">
                        <Play size={32} />
                      </div>
                    )}
                    <h3>{m.title}</h3>
                    <span className="badge">{m.type.replace(/_/g, ' ')}</span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {profile.gallery.length ? (
          <section className="section" id="gallery">
            <div className="container">
              <p className="section-kicker">Moments</p>
              <h2 className="section-title">Business Gallery</h2>
              <div className="gallery-grid">
                {profile.gallery.map((g) => (
                  <figure key={g.id} className="gallery-item">
                    <img src={g.imageUrl} alt={g.title ?? g.category} />
                    {g.caption ? <figcaption>{g.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="section consultation-section" id="consultation">
          <div className="container">
            <div className="consultation-panel">
              <div className="consultation-panel__copy">
                <p className="consultation-panel__eyebrow">Private consultation</p>
                <h2 className="consultation-panel__title">
                  Book a conversation with {profile.displayName}
                </h2>
                <p className="consultation-panel__text">
                  Personalized guidance on loans, insurance, and financial planning — directly from a Kuber
                  Verified Professional.
                </p>
                {profile.location.label ? (
                  <p className="consultation-panel__location">Serving {profile.location.label}</p>
                ) : null}
              </div>

              <div className="consultation-panel__actions">
                {profile.contact.whatsapp ? (
                  <a
                    href={`https://wa.me/91${profile.contact.whatsapp}`}
                    className="consultation-tile consultation-tile--primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={20} />
                    <span>
                      <strong>WhatsApp</strong>
                      <em>Fastest response</em>
                    </span>
                  </a>
                ) : null}
                {profile.contact.phone ? (
                  <a href={`tel:${profile.contact.phone}`} className="consultation-tile">
                    <Phone size={20} />
                    <span>
                      <strong>Call now</strong>
                      <em>{profile.contact.phone}</em>
                    </span>
                  </a>
                ) : null}
                {profile.contact.email ? (
                  <a href={`mailto:${profile.contact.email}`} className="consultation-tile">
                    <Mail size={20} />
                    <span>
                      <strong>Email</strong>
                      <em>Send your requirement</em>
                    </span>
                  </a>
                ) : null}
                {profile.contact.calendarUrl ? (
                  <a
                    href={profile.contact.calendarUrl}
                    className="consultation-tile"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Calendar size={20} />
                    <span>
                      <strong>Schedule</strong>
                      <em>Pick a slot</em>
                    </span>
                  </a>
                ) : null}
                {profile.contact.applyLoanUrl ? (
                  <a
                    href={profile.contact.applyLoanUrl}
                    className="consultation-tile"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText size={20} />
                    <span>
                      <strong>Apply loan</strong>
                      <em>Start application</em>
                    </span>
                  </a>
                ) : null}
              </div>

              <p className="consultation-panel__powered">
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
