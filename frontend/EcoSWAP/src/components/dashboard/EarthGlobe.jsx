import React from 'react';
import earthImage from '../../assets/earth.png';
import coinImage from '../../assets/coin.png';

const EarthGlobe = ({ coinsToRetire, progressPercentage = 25 }) => {
  const totalCircles = 20;
  const filledCircles = Math.round((progressPercentage / 100) * totalCircles);

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Unified progress circles around earth - Full 360 degree coverage */}
        <div className="absolute inset-0">
          {[...Array(totalCircles)].map((_, i) => {
            const angle = (i * (360 / totalCircles)); // 18 degrees apart for full coverage
            const radius = 80; // Distance from center
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const isFilled = i < filledCircles;
            
            return (
              <div
                key={i}
                className="absolute w-4 h-4"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                }}
              >
                {/* Progress circle with coin image or placeholder */}
                {isFilled ? (
                  <img 
                    src={coinImage} 
                    alt="Coin" 
                    className="w-4 h-4 rounded-full transition-all duration-500"
                    style={{ animationDelay: `${i * 100}ms` }}
                    onError={(e) => {
                      // Fallback to colored circle if image fails
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div class="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600 shadow-lg transition-all duration-500"></div>`;
                    }}
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 transition-all duration-500" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Rotating Earth Image - Using your earth.png */}
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 animate-spin-slow">
          <img 
            src={earthImage} 
            alt="Earth" 
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-2xl">🌍</span>
                </div>
              `;
            }}
          />
        </div>
      </div>
      
      {/* Coins to Retire Info with Progress */}
      <div className="mt-6 text-center">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {coinsToRetire}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Carbon Coin to Retire
        </div>
        <div className="text-xs text-gray-500">
          {progressPercentage}% Goal Achieved ({filledCircles}/{totalCircles})
        </div>
      </div>
    </div>
  );
};

export default EarthGlobe;