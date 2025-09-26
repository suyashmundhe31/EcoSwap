import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  bgColor = 'bg-white', 
  textColor = 'text-black', 
  icon 
}) => {
  return (
    <div className={`${bgColor} ${textColor} p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100`}>
      {icon && (
        <div className="mb-4 flex items-center justify-start">
          {icon}
        </div>
      )}
      <div className="text-3xl font-bold mb-2 tracking-tight">
        {value}
      </div>
      <div className="text-sm opacity-70 leading-relaxed">
        {subtitle}
      </div>
    </div>
  );
};

export default StatsCard;