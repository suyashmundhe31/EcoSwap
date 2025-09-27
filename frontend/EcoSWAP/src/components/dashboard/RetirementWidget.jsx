import React from 'react';
import coinImage from '../../assets/coin.png';

const RetirementWidget = ({ coinsToRetire }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <h3 className="text-lg font-semibold mb-6 text-gray-900">
        Number of coins to retire
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={coinImage} 
            alt="Coin" 
            className="w-8 h-8 rounded-full mr-4 animate-pulse-slow shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML += '<div class="w-8 h-8 bg-yellow-400 rounded-full animate-pulse-slow shadow-sm"></div>';
            }}
          />
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            00{coinsToRetire}
          </span>
        </div>
        
        <button className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95">
          Retire
        </button>
      </div>
    </div>
  );
};

export default RetirementWidget;