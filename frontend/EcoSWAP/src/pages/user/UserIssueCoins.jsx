import React from 'react';
import FadeInUp from '../../components/animations/FadeInUp';

const UserIssueCoins = ({ navigate }) => {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Page Title */}
      <FadeInUp>
        <h1 className="text-4xl font-bold mb-8 text-gray-900 text-center">
          Issue Coins
        </h1>
      </FadeInUp>

      {/* Category Selection */}
      <FadeInUp delay={200}>
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => navigate('/user/issue-coins/solar')}
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Solar Panel
          </button>
          <button 
            onClick={() => navigate('/user/issue-coins/forestation')}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors"
          >
            Forestation
          </button>
        </div>
      </FadeInUp>

      {/* Instructions */}
      <FadeInUp delay={400}>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Choose Your Energy Source</h2>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Select either Solar Panel or Forestation to begin the carbon coin issuance process. 
              You'll need to provide documentation, certifications, and location data to verify your contribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div 
              onClick={() => navigate('/user/issue-coins/solar')}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl mb-3">☀️</div>
              <h3 className="font-semibold text-gray-800 mb-2">Solar Panel</h3>
              <p className="text-sm text-gray-600">Generate coins from solar energy installations</p>
            </div>

            <div 
              onClick={() => navigate('/user/issue-coins/forestation')}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl mb-3">🌳</div>
              <h3 className="font-semibold text-gray-800 mb-2">Forestation</h3>
              <p className="text-sm text-gray-600">Generate coins from reforestation projects</p>
            </div>
          </div>
        </div>
      </FadeInUp>
    </div>
  );
};

export default UserIssueCoins;