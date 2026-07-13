import { Link } from 'react-router-dom';

import './SiteFooter.css';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong>Kuber Verified Professional™</strong>
          <p>Your Business. Your Brand. Powered by Kuber Finserve.</p>
        </div>
        <div className="site-footer__links">
          <Link to="/professionals">Directory</Link>
          <a href="https://kuberfinserve.com" target="_blank" rel="noreferrer">
            Kuber Finserve
          </a>
        </div>
        <p className="site-footer__copy">© {new Date().getFullYear()} Kuber Finserve. All rights reserved.</p>
      </div>
    </footer>
  );
}
