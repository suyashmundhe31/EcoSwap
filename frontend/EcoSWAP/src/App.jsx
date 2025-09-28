import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';

// Enterprise Pages
import EnterpriseDashboard from './pages/enterprise/EnterpriseDashboard';
import EnterpriseMarketplace from './pages/enterprise/EnterpriseMarketplace';
import EnterpriseHistory from './pages/enterprise/EnterpriseHistory';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserIssueCoins from './pages/user/UserIssueCoins';
import SolarPanelForm from './pages/user/SolarPanelForm';
import ForestationForm from './pages/user/ForestationForm';

// Authority Pages
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import CompanyTransactions from './pages/authority/CompanyTransactions';

// Home Page
import HomePage from './pages/HomePage';

function App() {
  const [currentPath, setCurrentPath] = useState('/');

  const navigate = (path) => {
    console.log('Navigating to:', path);
    setCurrentPath(path);
    // Update browser history
    window.history.pushState({ path }, '', path);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      const path = event.state?.path || window.location.pathname + window.location.search;
      console.log('Browser navigation to:', path);
      setCurrentPath(path);
    };

    // Listen for browser back/forward
    window.addEventListener('popstate', handlePopState);

    // Initialize current path from URL
    const initialPath = window.location.pathname + window.location.search;
    setCurrentPath(initialPath);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const renderCurrentPage = () => {
    console.log('Current path:', currentPath);
    
    // Extract the pathname without query parameters for routing
    const pathname = currentPath.split('?')[0];

    switch (pathname) {
      case '/':
        return <HomePage navigate={navigate} />;
      
      // Enterprise routes
      case '/enterprise':
        return <EnterpriseDashboard />;
      case '/enterprise/marketplace':
        return <EnterpriseMarketplace />;
      case '/enterprise/history':
        return <EnterpriseHistory />;
      
      // User routes
      case '/user':
        return <UserDashboard />;
      case '/user/issue-coins':
        console.log('Rendering UserIssueCoins');
        return <UserIssueCoins navigate={navigate} />;
      case '/user/issue-coins/solar':
        console.log('Rendering SolarPanelForm');
        return <SolarPanelForm navigate={navigate} />;
      case '/user/issue-coins/forestation':
        console.log('Rendering ForestationForm');
        return <ForestationForm navigate={navigate} />;
      
      // Authority routes
      case '/authority':
        return <AuthorityDashboard navigate={navigate} />;
      case '/authority/company-transactions':
        console.log('Rendering CompanyTransactions');
        return <CompanyTransactions navigate={navigate} />;
      
      default:
        console.log('Unknown path, redirecting to home:', currentPath);
        return <HomePage navigate={navigate} />;
    }
  };

  // Determine if we should show layout (not for home page)
  const showLayout = !currentPath.startsWith('/') || currentPath !== '/';
  const isEnterprise = currentPath.startsWith('/enterprise');
  const isUser = currentPath.startsWith('/user');
  const isAuthority = currentPath.startsWith('/authority');

  console.log('App render - showLayout:', showLayout, 'isEnterprise:', isEnterprise, 'isUser:', isUser, 'isAuthority:', isAuthority);

  // Show homepage without layout
  if (currentPath === '/') {
    return renderCurrentPage();
  }

  return (
    <Layout 
      currentPath={currentPath} 
      navigate={navigate}
      isEnterprise={isEnterprise}
      isUser={isUser}
      isAuthority={isAuthority}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;