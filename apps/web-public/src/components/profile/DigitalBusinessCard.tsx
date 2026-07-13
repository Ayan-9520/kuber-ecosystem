import { BadgeCheck, Mail, MessageCircle, Phone, QrCode, X } from 'lucide-react';

import type { PartnerProfile } from '@/lib/api';

import './DigitalBusinessCard.css';

interface DigitalBusinessCardProps {
  profile: PartnerProfile;
  onClose: () => void;
}

export function DigitalBusinessCard({ profile, onClose }: DigitalBusinessCardProps) {
  return (
    <div className="card-overlay" onClick={onClose} role="presentation">
      <div className="digital-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Digital business card">
        <button type="button" className="digital-card__close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="digital-card__front glass-card">
          <div className="digital-card__badge">
            <BadgeCheck size={14} /> Kuber Verified
          </div>
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.displayName} className="digital-card__photo" />
          ) : (
            <div className="digital-card__photo digital-card__photo--placeholder">{profile.displayName.charAt(0)}</div>
          )}
          <h3>{profile.displayName}</h3>
          <p>{profile.designation}</p>
          {profile.companyName ? <p className="digital-card__company">{profile.companyName}</p> : null}
          {profile.companyLogoUrl ? <img src={profile.companyLogoUrl} alt="" className="digital-card__logo" /> : null}
          <div className="digital-card__qr">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(profile.profileUrl)}`}
              alt="Profile QR Code"
              width={100}
              height={100}
            />
            <span>Scan to view profile</span>
          </div>
        </div>

        <div className="digital-card__back glass-card">
          <h4>Contact</h4>
          {profile.contact.phone ? (
            <a href={`tel:${profile.contact.phone}`}>
              <Phone size={16} /> {profile.contact.phone}
            </a>
          ) : null}
          {profile.contact.whatsapp ? (
            <a href={`https://wa.me/91${profile.contact.whatsapp}`} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> WhatsApp
            </a>
          ) : null}
          {profile.contact.email ? (
            <a href={`mailto:${profile.contact.email}`}>
              <Mail size={16} /> {profile.contact.email}
            </a>
          ) : null}
          {profile.contact.applyLoanUrl ? (
            <a href={profile.contact.applyLoanUrl} target="_blank" rel="noreferrer">
              <QrCode size={16} /> Scan to Apply
            </a>
          ) : null}
          <p className="digital-card__powered">Powered by {profile.poweredBy}</p>
        </div>
      </div>
    </div>
  );
}
