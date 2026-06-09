import { EMAIL_BRAND } from '../constants/email.constants.js';

export function renderBrandedEmailHtml(params: {
  subject: string;
  bodyHtml: string;
  preheader?: string;
  unsubscribeUrl?: string;
}): string {
  const { primary, dark, surface, text, muted, company, product } = EMAIL_BRAND;
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(params.subject)}</title>
  <style>
    body { margin:0; padding:0; background:${dark}; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
    .wrap { max-width:600px; margin:0 auto; background:${surface}; }
    .header { background:linear-gradient(135deg,${dark} 0%,${surface} 100%); padding:28px 32px; border-bottom:3px solid ${primary}; }
    .logo { color:${primary}; font-size:22px; font-weight:700; letter-spacing:0.5px; }
    .tagline { color:${muted}; font-size:12px; margin-top:4px; }
    .content { padding:32px; color:${text}; font-size:15px; line-height:1.65; }
    .content a { color:${primary}; }
    .footer { padding:24px 32px; background:${dark}; color:${muted}; font-size:12px; text-align:center; }
    .footer a { color:${primary}; text-decoration:none; }
    @media (max-width:620px) { .content,.header,.footer { padding:20px; } }
  </style>
</head>
<body>
  <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(params.preheader ?? params.subject)}</span>
  <div class="wrap">
    <div class="header">
      <div class="logo">${company}</div>
      <div class="tagline">${product} — Smart Lending Platform</div>
    </div>
    <div class="content">${params.bodyHtml}</div>
    <div class="footer">
      <p>&copy; ${year} ${company}. All rights reserved.</p>
      <p>This is an automated message from ${product}.</p>
      ${params.unsubscribeUrl ? `<p><a href="${escapeHtml(params.unsubscribeUrl)}">Unsubscribe</a></p>` : ''}
    </div>
  </div>
</body>
</html>`;
}

export function renderTemplateString(template: string, variables: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : '';
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
