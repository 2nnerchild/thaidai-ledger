import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { TabNav, type TabId } from '@/components/layout/TabNav';
import { ToastProvider, ToastStyles } from '@/components/ui/Toast';
import { DashboardPage } from '@/pages/DashboardPage';
import { EntryPage } from '@/pages/EntryPage';
import { ListPage } from '@/pages/ListPage';
import { VATPage } from '@/pages/VATPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ExportPage } from '@/pages/ExportPage';
import { useTransactionStore } from '@/features/transactions/store';
import { migrateFromLocalStorage } from '@/lib/db';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const load = useTransactionStore((s) => s.load);
  const isLoaded = useTransactionStore((s) => s.isLoaded);

  useEffect(() => {
    migrateFromLocalStorage().then(() => load());
  }, [load]);

  const pageProps = { year };

  return (
    <ToastProvider>
      <ToastStyles />
      <div className="min-h-screen bg-cream">
        <Header year={year} onYearChange={setYear} />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="pb-8">
          {!isLoaded ? (
            <div className="flex items-center justify-center py-20">
              <p className="font-mono text-grey-border text-sm">데이터 불러오는 중...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardPage {...pageProps} />}
              {activeTab === 'entry'     && <EntryPage />}
              {activeTab === 'list'      && <ListPage {...pageProps} />}
              {activeTab === 'vat'       && <VATPage {...pageProps} />}
              {activeTab === 'reports'   && <ReportsPage {...pageProps} />}
              {activeTab === 'export'    && <ExportPage {...pageProps} />}
            </>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
