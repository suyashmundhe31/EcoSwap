import React from 'react';
import EnterpriseHeader from './EnterpriseHeader';
import UserHeader from './UserHeader';

const Layout = ({ children, currentPath, navigate, isEnterprise, isUser }) => {
  console.log('Layout - currentPath:', currentPath, 'isEnterprise:', isEnterprise, 'isUser:', isUser);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isEnterprise && (
        <EnterpriseHeader currentPath={currentPath} navigate={navigate} />
      )}
      {isUser && (
        <UserHeader currentPath={currentPath} navigate={navigate} />
      )}
      <main className="min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;