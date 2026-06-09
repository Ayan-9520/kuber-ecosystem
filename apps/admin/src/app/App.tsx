import { BrowserRouter } from 'react-router-dom';

import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/theme/ThemeProvider';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
