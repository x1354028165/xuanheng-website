import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Tickets from './pages/Tickets';
import News from './pages/News';
import Faq from './pages/Faq';
import Jobs from './pages/Jobs';
import Products from './pages/Products';
import Solutions from './pages/Solutions';
import Brands from './pages/Brands';
import Cases from './pages/Cases';
import FileAssets from './pages/FileAssets';
import ProductRelations from './pages/ProductRelations';
import SeoConfig from './pages/SeoConfig';
import NotificationConfig from './pages/NotificationConfig';
import PageContent from './pages/PageContent';
import I18nDict from './pages/I18nDict';
import MediaLibrary from './pages/MediaLibrary';
import AccountMgmt from './pages/AccountMgmt';
import AuditLogs from './pages/AuditLogs';
import CacheMgmt from './pages/CacheMgmt';
import HealthCheck from './pages/HealthCheck';
import SitemapMgmt from './pages/SitemapMgmt';
import DocResources from './pages/DocResources';
import FirmwareVersions from './pages/FirmwareVersions';
import SoftwareDownloads from './pages/SoftwareDownloads';
import LanguagesPage from './pages/LanguagesPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigProvider theme={{
      token: { colorPrimary: '#1A3FAD' },
      components: {
        Menu: {
          itemMarginBlock: 0,
          itemMarginInline: 0,
          itemBorderRadius: 0,
          subMenuItemBorderRadius: 0,
        },
      },
    }}>
      <AuthProvider>
        <BrowserRouter basename="/admin">
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="news" element={<News />} />
              <Route path="faq" element={<Faq />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="products" element={<Products />} />
              <Route path="solutions" element={<Solutions />} />
              <Route path="brands" element={<Brands />} />
              <Route path="cases" element={<Cases />} />
              <Route path="file-assets" element={<FileAssets />} />
              <Route path="product-relations" element={<ProductRelations />} />
              <Route path="seo-config" element={<SeoConfig />} />
              <Route path="notification-config" element={<NotificationConfig />} />
              <Route path="page-content" element={<PageContent />} />
              <Route path="i18n-dict" element={<I18nDict />} />
              <Route path="media-library" element={<MediaLibrary />} />
              <Route path="account-mgmt" element={<AccountMgmt />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="cache-mgmt" element={<CacheMgmt />} />
              <Route path="health-check" element={<HealthCheck />} />
              <Route path="sitemap" element={<SitemapMgmt />} />
              <Route path="doc-resources" element={<DocResources />} />
              <Route path="firmware-versions" element={<FirmwareVersions />} />
              <Route path="software-downloads" element={<SoftwareDownloads />} />
              <Route path="languages" element={<LanguagesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
