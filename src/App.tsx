import { useEffect, useState } from 'react';
import { LoginGate } from '@/components/auth/LoginGate';
import { Header } from '@/components/layout/Header';
import { TabNav, type TabId } from '@/components/layout/TabNav';
import { ToastProvider, ToastStyles } from '@/components/ui/Toast';
import { logout } from '@/features/auth/auth';
import { useCopyProtection } from '@/features/security/useCopyProtection';
import { useTransactionStore } from '@/features/transactions/store';
import { migrateFromLocalStorage } from '@/lib/db';
import { DashboardPage } from '@/pages/DashboardPage';
import { EntryPage } from '@/pages/EntryPage';
import { ExportPage } from '@/pages/ExportPage';
import { ListPage } from '@/pages/ListPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { VATPage } from '@/pages/VATPage';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [authVersion, setAuthVersion] = useState(0);
  const load = useTransactionStore((state) => state.load);
  const isLoaded = useTransactionStore((state) => state.isLoaded);

  useCopyProtection(import.meta.env.PROD);

  useEffect(() => {
    migrateFromLocalStorage().then(() => load());
  }, [load]);

  const handleLogout = () => {
    logout();
    setAuthVersion((version) => version + 1);
  };

  const pageProps = { year };

  return (
    <ToastProvider>
      <ToastStyles />
      <LoginGate key={authVersion}>
        <div className="min-h-screen bg-cream copy-protected">
          <Header year={year} onYearChange={setYear} onLogout={handleLogout} />
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="pb-8">
            {!isLoaded ? (
              <div className="flex items-center justify-center py-20">
                <p className="font-mono text-grey-border text-sm">데이터를 불러오는 중...</p>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <DashboardPage {...pageProps} />}
                {activeTab === 'entry' && <EntryPage />}
                {activeTab === 'list' && <ListPage {...pageProps} />}
                {activeTab === 'vat' && <VATPage {...pageProps} />}
                {activeTab === 'reports' && <ReportsPage {...pageProps} />}
                {activeTab === 'export' && <ExportPage {...pageProps} />}
              </>
            )}
          </main>
        </div>
      </LoginGate>
    </ToastProvider>
  );
}
