import React from 'react';

const EarthGlobe = ({ coinsToRetire, earthImage }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Rotating decorative elements around earth */}
        <div className="absolute inset-0 animate-spin-slow">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-orange-400 rounded-full opacity-80 shadow-sm"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 45}deg) translateY(-80px) translate(-50%, -50%)`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
        
        {/* Earth Image Container - NO ANIMATION, just your image */}
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white bg-white">
          {earthImage ? (
            <img 
              src={earthImage} 
              alt="Earth" 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            // Simple fallback - no animation
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🌍</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Coins to Retire Info */}
      <div className="mt-6 text-center">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {coinsToRetire}
        </div>
        <div className="text-sm text-gray-600">
          Carbon Coin to Retire
        </div>
      </div>
    </div>
  );
};

export default EarthGlobe;