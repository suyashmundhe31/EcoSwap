import React from 'react';

const PurchaseHistory = ({ data }) => {
  const getStatusStyle = (status) => {
    return status === 'Completed' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Purchase History
        </h3>
        <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center transition-colors duration-200 font-medium hover:underline">
          Export 
          <span className="ml-1 transform hover:translate-x-1 transition-transform">↗</span>
        </button>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="grid grid-cols-8 gap-4 text-xs text-gray-600 mb-4 pb-3 border-b border-gray-200 min-w-full">
          <div className="font-semibold uppercase tracking-wider">Transaction ID</div>
          <div className="font-semibold uppercase tracking-wider">Date</div>
          <div className="font-semibold uppercase tracking-wider">Project</div>
          <div className="font-semibold uppercase tracking-wider">Coin</div>
          <div className="font-semibold uppercase tracking-wider">Price/Coin</div>
          <div className="font-semibold uppercase tracking-wider">Total</div>
          <div className="font-semibold uppercase tracking-wider">Status</div>
          <div className="font-semibold uppercase tracking-wider">Retired</div>
        </div>
        
        {/* Table Body */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <div 
              key={item.id} 
              className="grid grid-cols-8 gap-4 py-3 text-sm items-center border-b border-gray-50 last:border-b-0 hover:bg-gray-50 rounded-lg transition-colors duration-200 px-2 -mx-2"
            >
              <div className="font-medium text-gray-800">
                {item.id}
              </div>
              <div className="text-gray-600">
                {item.date}
              </div>
              <div className="text-gray-800 min-w-0">
                <div className="truncate font-medium" title={item.project}>
                  {item.project}
                </div>
              </div>
              <div className="font-semibold text-gray-900">
                {item.coin}
              </div>
              <div className="text-gray-600 font-medium">
                {item.price}
              </div>
              <div className="font-semibold text-gray-900">
                {item.total}
              </div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(item.status)}`}>
                  {item.status}
                </span>
              </div>
              <div className="font-semibold text-gray-900">
                {item.retired}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;