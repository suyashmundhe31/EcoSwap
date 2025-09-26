import React, { useState } from 'react';
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

// Home Page
import HomePage from './pages/HomePage';

function App() {
  const [currentPath, setCurrentPath] = useState('/');

  const navigate = (path) => {
    console.log('Navigating to:', path);
    setCurrentPath(path);
  };

  const renderCurrentPage = () => {
    console.log('Current path:', currentPath);

    switch (currentPath) {
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
      
      default:
        console.log('Unknown path, redirecting to home:', currentPath);
        return <HomePage navigate={navigate} />;
    }
  };

  // Determine if we should show layout (not for home page)
  const showLayout = currentPath !== '/';
  const isEnterprise = currentPath.startsWith('/enterprise');
  const isUser = currentPath.startsWith('/user');

  console.log('App render - showLayout:', showLayout, 'isEnterprise:', isEnterprise, 'isUser:', isUser);

  if (!showLayout) {
    return renderCurrentPage();
  }

  return (
    <Layout 
      currentPath={currentPath} 
      navigate={navigate}
      isEnterprise={isEnterprise}
      isUser={isUser}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;