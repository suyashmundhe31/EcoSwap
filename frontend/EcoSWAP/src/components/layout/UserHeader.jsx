import React from 'react';

const UserHeader = ({ currentPath, navigate }) => {
  const navItems = [
    { id: '/user', label: 'Dashboard' },
    { id: '/user/issue-coins', label: 'Issue coins' }
  ];

  const handleNavClick = (path) => {
    console.log('UserHeader: Navigating to:', path);
    navigate(path);
  };

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
      {/* Logo */}
      <div 
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleNavClick('/')}
      >
        <span className="text-xl font-bold text-gray-900">Eco</span>
        <span className="bg-black text-white px-2 py-1 text-sm ml-1 rounded font-medium">
          SWAP
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex space-x-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`px-6 py-2 rounded-full text-sm transition-all duration-200 font-medium ${
              currentPath === item.id
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      
      {/* User Coins Display & Connect Wallet */}
      <div className="flex items-center space-x-4">
        {/* User Coins Display */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-lg border border-yellow-200">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-yellow-900">+</span>
          </div>
          <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
          <div className="flex flex-col">
            <span className="text-gray-800 font-bold text-lg">2350</span>
            <span className="text-xs text-gray-600 font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
              Carbon Coins
            </span>
          </div>
          <div className="ml-2 text-xs text-yellow-700 font-medium" style={{fontFamily: 'Space Mono, monospace'}}>
            1 ton CO₂ = 1 coin
          </div>
        </div>
        
        {/* Connect Wallet */}
        <button className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-full text-sm hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          Connect Wallet
        </button>
      </div>
    </header>
  );
};

export default UserHeader;