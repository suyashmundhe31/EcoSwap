import React, { useState } from 'react';
import coinImage from '../../assets/coin.png';

const RetirementWidget = ({ coinsToRetire, onRetire, isLoading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(coinsToRetire.toString());

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(coinsToRetire.toString());
  };

  const handleSave = () => {
    const newValue = parseInt(editValue) || 0;
    if (onRetire) {
      onRetire(newValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(coinsToRetire.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

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
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-3xl font-bold text-gray-900 tracking-tight border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                min="0"
                max="999999"
              />
              <div className="flex space-x-1">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                00{coinsToRetire}
              </span>
              <button
                onClick={handleEdit}
                disabled={isLoading}
                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                title="Edit amount"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => onRetire && onRetire(parseInt(editValue) || coinsToRetire)}
          disabled={isLoading || isEditing}
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? 'Processing...' : 'Retire'}
        </button>
      </div>
    </div>
  );
};

export default RetirementWidget;