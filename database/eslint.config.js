import rootConfig from '../eslint.config.js';

export default [
  ...rootConfig,
  {
    files: ['prisma/seeds/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: './tsconfig.seeds.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
