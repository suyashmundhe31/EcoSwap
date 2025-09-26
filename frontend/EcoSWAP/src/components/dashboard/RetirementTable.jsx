import React from 'react';

const RetirementTable = ({ data }) => {
  const getStatusStyle = (status) => {
    return status === 'Completed' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 mb-6 pb-3 border-b border-gray-200">
        <div className="font-semibold uppercase tracking-wider">Retirement ID</div>
        <div className="font-semibold uppercase tracking-wider">Date</div>
        <div className="font-semibold uppercase tracking-wider">Coins</div>
        <div className="font-semibold uppercase tracking-wider">Status</div>
      </div>
      
      {/* Table Body */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div 
            key={item.id} 
            className="grid grid-cols-4 gap-4 py-3 text-sm items-center hover:bg-gray-50 rounded-lg transition-colors duration-200 px-2 -mx-2"
          >
            <div className="font-medium text-gray-800">
              {item.id}
            </div>
            <div className="text-gray-600">
              {item.date}
            </div>
            <div className="font-semibold text-gray-900">
              {item.coins}
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* View More Button */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium hover:underline">
          View More →
        </button>
      </div>
    </div>
  );
};

export default RetirementTable;