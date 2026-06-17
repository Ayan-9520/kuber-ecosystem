import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = 'typescript', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="api-code-block">
      <div className="api-code-block-header">
        <span className="api-code-block-lang">{title ?? language}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void handleCopy()}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="api-code-block-body">
        <code>{code}</code>
      </pre>
    </div>
  );
}
