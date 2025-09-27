import React from 'react';
import coinImage from '../../assets/coin.png';

const EnterpriseHeader = ({ currentPath, navigate, userCoins = 2350 }) => {
  const navItems = [
    { id: '/enterprise', label: 'Dashboard' },
    { id: '/enterprise/marketplace', label: 'Marketplace' },
    { id: '/enterprise/history', label: 'History' }
  ];

  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
      {/* Logo */}
      <div 
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/')}
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
            onClick={() => navigate(item.id)}
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
      
      {/* User Info & Connect Wallet */}
      <div className="flex items-center space-x-4">
        {/* User Coins Display with coin images */}
        <div className="flex items-center space-x-2">
          <img 
            src={coinImage} 
            alt="Coin" 
            className="w-6 h-6 rounded-full"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML += '<div class="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"><span class="text-xs font-bold text-yellow-900">+</span></div>';
            }}
          />
          <span className="text-gray-800 font-semibold">{userCoins}</span>
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

export default EnterpriseHeader;