import { Route, Routes } from 'react-router-dom';

import { DirectoryPage } from './pages/DirectoryPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PartnerProfilePage } from './pages/PartnerProfilePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/professionals" element={<DirectoryPage />} />
      <Route path="/partner/:slug" element={<PartnerProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
