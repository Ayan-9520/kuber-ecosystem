import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { searchApiDocs, trackDocEvent } from '@/lib/openapi';
import type { OpenApiEndpoint } from '@/lib/openapi';

interface ApiDocsSearchProps {
  endpoints: OpenApiEndpoint[];
  placeholder?: string;
  className?: string;
}

export function ApiDocsSearch({
  endpoints,
  placeholder = 'Search endpoints, modules, guides…',
  className,
}: ApiDocsSearchProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length >= 2 ? searchApiDocs(query, endpoints, 12) : [];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = (path: string, label: string) => {
    trackDocEvent('search', query, label);
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <div ref={wrapRef} className={`api-docs-search ${className ?? ''}`}>
      <div className="api-docs-search-input-wrap">
        <Search size={16} className="api-docs-search-icon" />
        <input
          type="search"
          className="api-docs-search-input"
          placeholder={placeholder}
          value={query}
          aria-label="Search API documentation"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {query ? (
          <button type="button" className="api-docs-search-clear" onClick={() => setQuery('')}>
            <X size={14} />
          </button>
        ) : null}
      </div>

      {open && results.length > 0 ? (
        <ul className="api-docs-search-results" role="listbox">
          {results.map((r) => (
            <li key={`${r.type}-${r.id}`}>
              <button
                type="button"
                className="api-docs-search-result"
                onClick={() => handleSelect(r.path, r.title)}
              >
                <span className="api-docs-search-result-type">{r.type}</span>
                <span className="api-docs-search-result-title">{r.title}</span>
                {r.subtitle ? (
                  <span className="api-docs-search-result-sub">{r.subtitle}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
