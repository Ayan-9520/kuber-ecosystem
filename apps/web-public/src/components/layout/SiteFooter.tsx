import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

import './SiteFooter.css';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__glow" aria-hidden />
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <div className="site-footer__logo-row">
            <ShieldCheck size={26} />
            <div>
              <strong>Kuber Verified Professional™</strong>
              <span>Powered by Kuber Finserve</span>
            </div>
          </div>
          <p>
            Independent financial professionals with verified credibility, modern tools, and
            pan-India product access — built for trust.
          </p>
        </div>

        <div className="site-footer__col">
          <h4>Explore</h4>
          <Link to="/professionals">Find a Professional</Link>
          <Link to="/">Verified Home</Link>
          <a href="https://kuberfinserve.com" target="_blank" rel="noreferrer">
            Kuber Finserve
          </a>
          <a href="https://partner.kuberone.online" target="_blank" rel="noreferrer">
            Partner Login
          </a>
        </div>

        <div className="site-footer__col">
          <h4>For Partners</h4>
          <a href="https://kuberfinserve.com/become-partner" target="_blank" rel="noreferrer">
            Become a Partner
          </a>
          <a href="https://partner.kuberone.online" target="_blank" rel="noreferrer">
            Brand Profile Studio
          </a>
          <a href="https://kuberone.online" target="_blank" rel="noreferrer">
            KuberOne Platform
          </a>
        </div>

        <div className="site-footer__cta">
          <h4>Need guidance?</h4>
          <p>Talk to a verified professional near you.</p>
          <Link to="/professionals" className="site-footer__cta-btn">
            Browse Directory
          </Link>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p>© {new Date().getFullYear()} Kuber Finserve. All rights reserved.</p>
          <p>Your Business. Your Brand. Powered by Kuber Finserve.</p>
        </div>
      </div>
    </footer>
  );
}
