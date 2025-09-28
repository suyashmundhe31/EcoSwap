import React, { useState } from 'react';
import EnterpriseHeader from './EnterpriseHeader';
import UserHeader from './UserHeader';

const Layout = ({ children, currentPath, navigate, isEnterprise, isUser }) => {
  console.log('Layout - currentPath:', currentPath, 'isEnterprise:', isEnterprise, 'isUser:', isUser);
  
  // State for managing user coins across components
  const [userCoins, setUserCoins] = useState(2500); // Default for MVP
  
  const handleCoinsUpdate = (newCoins) => {
    setUserCoins(newCoins);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isEnterprise && (
        <EnterpriseHeader 
          currentPath={currentPath} 
          navigate={navigate} 
          userCoins={userCoins}
          onCoinsUpdate={handleCoinsUpdate}
        />
      )}
      {isUser && (
        <UserHeader currentPath={currentPath} navigate={navigate} />
      )}
      <main className="min-h-[calc(100vh-80px)]">
        {React.cloneElement(children, { 
          onCoinsUpdate: handleCoinsUpdate,
          userCoins: userCoins 
        })}
      </main>
    </div>
  );
};

export default Layout;