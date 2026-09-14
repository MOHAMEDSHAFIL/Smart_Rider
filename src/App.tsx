import React from 'react';
import { SmartRiderProvider, useSmartRider } from './context/SmartRiderContext';
import { TopNav } from './components/layout/TopNav';
import { Sidebar } from './components/layout/Sidebar';
import { ScanlineOverlay } from './components/common/ScanlineOverlay';
import { OverviewPage } from './components/overview/OverviewPage';
import { UsersPage } from './components/users/UsersPage';
import { SessionsPage } from './components/sessions/SessionsPage';
import { PolicyPage } from './components/policy/PolicyPage';
import { DemoPage } from './components/demo/DemoPage';




const MainLayout: React.FC = () => {
  const { activeTab } = useSmartRider();



  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;

      case 'users':
        return <UsersPage />;

      case 'sessions':
        return <SessionsPage />;

      case 'policy':
        return <PolicyPage />;

      case 'demo':
        return <DemoPage />;

      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark:bg-crt-dark bg-day-bg text-slate-800 dark:text-crt-text relative selection:bg-crt-green selection:text-black">

      {/* CRT Scanline Overlay */}
      <ScanlineOverlay />

      {/* Persistent Top Navigation */}
      <TopNav />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {renderActiveTab()}
          </div>
        </main>

      </div>
    </div>
  );
};


export function App() {
  return (
    <SmartRiderProvider>
      <MainLayout />
    </SmartRiderProvider>
  );
}

export default App;