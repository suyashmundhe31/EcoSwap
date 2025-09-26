import React from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import { USER_DASHBOARD_DATA } from '../../utils/userConstants';

const UserDashboard = () => {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Stats Cards Row */}
      <FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Carbon Coin Issued */}
          <div className="bg-green-100 rounded-2xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-yellow-400 rounded-full mr-3"></div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">2000</div>
            <div className="text-sm text-gray-700">Total Carbon Coin Issued</div>
          </div>

          {/* Issue More Coins Button */}
          <div className="bg-black rounded-2xl p-6 shadow-sm flex items-center justify-center">
            <button className="text-white font-semibold text-lg flex items-center hover:opacity-80 transition-opacity">
              Issue more coins
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Current Average Price */}
          <div className="bg-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-6 bg-black rounded-full flex items-center">
                <div className="w-8 h-1 bg-white rounded-full ml-1"></div>
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">$28.91</div>
            <div className="text-sm text-gray-700">Current Average Price (1 carbon coin)</div>
          </div>
        </div>
      </FadeInUp>

      {/* Issue History Table */}
      <FadeInUp delay={200}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-6 text-sm text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-100">
            <div>Issue ID</div>
            <div>Date</div>
            <div>Coins</div>
            <div>Source of Coins</div>
            <div>Verification Status</div>
            <div>Status</div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-50">
            {USER_DASHBOARD_DATA.issueHistory.map((item, index) => (
              <div key={item.id} className="grid grid-cols-6 gap-4 p-6 text-sm items-center hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-800">
                  {item.id}
                </div>
                <div className="text-gray-600">
                  {item.date}
                </div>
                <div className="font-semibold text-gray-900">
                  {item.coins}
                </div>
                <div className="text-gray-700">
                  {item.source}
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.verificationStatus === 'Verified' 
                      ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                      : item.verificationStatus === 'Not Verified'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {item.verificationStatus}
                  </span>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Completed' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* View More Button */}
          <div className="p-6 border-t border-gray-100">
            <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium hover:underline">
              View More →
            </button>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

export default UserDashboard;