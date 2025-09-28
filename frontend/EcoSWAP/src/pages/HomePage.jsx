import React from 'react';
import FadeInUp from '../components/animations/FadeInUp';

const HomePage = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-6xl mx-auto text-center">
        {/* Logo */}
        <FadeInUp>
          <div className="flex items-center justify-center mb-8">
            <span className="text-4xl font-bold text-gray-900">Eco</span>
            <span className="bg-black text-white px-3 py-2 text-xl ml-2 rounded font-medium">
              SWAP
            </span>
          </div>
        </FadeInUp>

        {/* Welcome Message */}
        <FadeInUp delay={200}>
          <h1 className="text-5xl font-bold mb-6 text-gray-800 tracking-tight">
            Welcome to EcoSWAP
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your sustainable carbon trading platform for a greener future. Choose your experience below.
          </p>
        </FadeInUp>

        {/* Route Options */}
        <FadeInUp delay={400}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Enterprise Option */}
            <div 
              onClick={() => navigate('/enterprise')}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200 hover:-translate-y-2"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Enterprise</h2>
                <p className="text-gray-600 leading-relaxed">
                  Access the full enterprise dashboard with carbon credit management, trading, and analytics.
                </p>
              </div>
              <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:text-blue-700">
                <span>Enter Dashboard</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* User Option */}
            <div 
              onClick={() => navigate('/user')}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200 hover:-translate-y-2"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">User</h2>
                <p className="text-gray-600 leading-relaxed">
                  Individual user interface for carbon coin management, issuance tracking, and personal impact.
                </p>
              </div>
              <div className="flex items-center justify-center text-green-600 font-semibold group-hover:text-green-700">
                <span>Enter Portal</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Authority Option */}
            <div 
              onClick={() => navigate('/authority')}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200 hover:-translate-y-2"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Authority</h2>
                <p className="text-gray-600 leading-relaxed">
                  Government oversight dashboard for monitoring carbon transactions and regulatory compliance.
                </p>
              </div>
              <div className="flex items-center justify-center text-purple-600 font-semibold group-hover:text-purple-700">
                <span>Enter Authority</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Footer */}
        <FadeInUp delay={600}>
          <div className="mt-16 text-gray-500 text-sm">
            <p>Building a sustainable future, one carbon credit at a time.</p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
};

export default HomePage;