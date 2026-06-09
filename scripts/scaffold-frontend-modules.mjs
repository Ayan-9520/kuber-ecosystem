import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const ADMIN_MODULES = [
  'dashboard', 'leads', 'customers', 'applications', 'documents',
  'partners', 'commissions', 'campaigns', 'support', 'analytics', 'settings',
];

const CUSTOMER_MODULES = [
  'auth', 'dashboard', 'profile', 'kyc', 'loan-products', 'applications',
  'documents', 'emi', 'eligibility', 'ai-advisor', 'voice-ai', 'referrals',
  'support', 'notifications', 'settings',
];

const DSA_MODULES = [
  'auth', 'dashboard', 'lead-submission', 'lead-tracking', 'commissions',
  'reports', 'training', 'support', 'settings',
];

function pascalCase(str) {
  return str.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function write(filePath, content) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(filePath)) writeFileSync(filePath, content, 'utf8');
}

function scaffoldAdmin() {
  const base = join(import.meta.dirname, '..', 'apps', 'admin', 'src', 'features');
  for (const mod of ADMIN_MODULES) {
    const Name = pascalCase(mod);
    write(join(base, mod, 'index.ts'), `export { ${Name}Page } from './pages/${Name}Page.js';\n`);
    write(
      join(base, mod, 'pages', `${Name}Page.tsx`),
      `export function ${Name}Page() {
  return (
    <div className="page-container">
      <h1>${Name}</h1>
      <p>KuberOne Admin — ${mod} module scaffold</p>
    </div>
  );
}
`,
    );
  }
}

function scaffoldMobile(app, modules, screenType = 'screens') {
  const base = join(import.meta.dirname, '..', 'apps', app, 'src', 'features');
  for (const mod of modules) {
    const Name = pascalCase(mod);
    write(join(base, mod, 'index.ts'), `export { ${Name}Screen } from './${screenType}/${Name}Screen.js';\n`);
    write(
      join(base, mod, screenType, `${Name}Screen.tsx`),
      `import { StyleSheet, Text, View } from 'react-native';

export function ${Name}Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${Name}</Text>
      <Text style={styles.subtitle}>${app.replace('mobile-', '')} — ${mod}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#071A1F' },
  title: { fontSize: 24, fontWeight: '700', color: '#22D3A6', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94A3B8' },
});
`,
    );
  }
}

scaffoldAdmin();
scaffoldMobile('mobile-customer', CUSTOMER_MODULES);
scaffoldMobile('mobile-dsa', DSA_MODULES);
console.log('Frontend modules scaffolded');
