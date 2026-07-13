import { Link2, Mail, MessageCircle, Send, Share2, X } from 'lucide-react';

import type { ShareUrls } from '@/lib/api';

import './ShareBar.css';

interface ShareBarProps {
  urls: ShareUrls;
  onClose: () => void;
}

export function ShareBar({ urls, onClose }: ShareBarProps) {
  const items = [
    { label: 'LinkedIn', icon: Link2, href: urls.linkedin },
    { label: 'Facebook', icon: Share2, href: urls.facebook },
    { label: 'WhatsApp', icon: MessageCircle, href: urls.whatsapp },
    { label: 'X', icon: X, href: urls.x },
    { label: 'Telegram', icon: Send, href: urls.telegram },
    { label: 'Email', icon: Mail, href: urls.email },
  ];

  return (
    <div className="share-overlay" onClick={onClose} role="presentation">
      <div className="share-bar glass-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Share profile">
        <h3>Share Profile</h3>
        <p className="share-bar__url">{urls.profileUrl}</p>
        <div className="share-bar__grid">
          {items.map((item) => (
            <a key={item.label} href={item.href} className="share-bar__item" target="_blank" rel="noreferrer">
              <item.icon size={22} />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => void navigator.clipboard.writeText(urls.profileUrl)}>
          Copy Link
        </button>
        <button type="button" className="btn btn-ghost share-bar__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
