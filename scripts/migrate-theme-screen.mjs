import { readFileSync, writeFileSync } from 'node:fs';

/** Migrate a screen that uses static `colors` + module-level StyleSheet to useAppTheme. */
export function migrateThemeScreen(filePath) {
  let content = readFileSync(filePath, 'utf8');
  if (!content.includes("@/theme") || !content.includes('colors')) return false;
  if (content.includes('useAppTheme()')) return false;
  if (!content.includes('const styles = StyleSheet.create(')) return false;

  content = content.replace(/import \{([^}]*)\} from '@\/theme';/g, (match, imports) => {
    const parts = imports
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== 'colors');
    if (parts.length === 0) return match;
    return `import { ${parts.join(', ')} } from '@/theme';`;
  });

  if (!content.includes('useAppTheme')) {
    content = content.replace(
      /import \{([^}]*)\} from 'react';/,
      (match, imports) => {
        const set = new Set(
          imports
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        );
        set.add('useMemo');
        return `import { ${[...set].join(', ')} } from 'react';`;
      },
    );
    const themeImport = content.match(/import \{[^}]+\} from '@\/theme';/);
    if (themeImport) {
      content = content.replace(
        themeImport[0],
        `import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';\n${themeImport[0]}`,
      );
    } else {
      content = `import { type AppColors, useAppTheme } from '@/theme/ThemeProvider';\n${content}`;
    }
  }

  content = content.replace(
    /const styles = StyleSheet\.create\(\{/,
    'function createStyles(colors: AppColors) {\n  return StyleSheet.create({',
  );

  const lastStylesClose = content.lastIndexOf('});');
  if (lastStylesClose === -1) return false;
  content = `${content.slice(0, lastStylesClose + 3)}\n}${content.slice(lastStylesClose + 3)}`;

  const injected = content.replace(
    /(export function \w+[^{]*\{)/,
    '$1\n  const { colors } = useAppTheme();\n  const styles = useMemo(() => createStyles(colors), [colors]);',
  );
  if (injected === content) return false;

  writeFileSync(filePath, injected);
  return true;
}

if (process.argv[1]?.endsWith('migrate-theme-screen.mjs')) {
  const paths = process.argv.slice(2);
  let count = 0;
  for (const p of paths) {
    if (migrateThemeScreen(p)) {
      count += 1;
      console.log('migrated:', p);
    }
  }
  console.log(`Done. Migrated ${count} files.`);
}
