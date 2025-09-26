import React, { useState } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import StatsCard from '../../components/dashboard/StatsCard';
import EarthGlobe from '../../components/dashboard/EarthGlobe';
import RetirementTable from '../../components/dashboard/RetirementTable';
import PurchaseHistory from '../../components/dashboard/PurchaseHistory';
import RetirementWidget from '../../components/dashboard/RetirementWidget';
import { DASHBOARD_DATA, RETIREMENT_DATA, PURCHASE_HISTORY, TIME_PERIODS } from '../../utils/constants';
import earthImage from '../../assets/earth.png';

const EnterpriseDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('overall');


  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Page Title */}
      <FadeInUp>
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 tracking-wide">
          ROAD TO NET-ZERO
        </h1>
      </FadeInUp>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <FadeInUp delay={100}>
          <StatsCard
            title="CO₂"
            value={DASHBOARD_DATA.totalCredits}
            subtitle="Total Carbon Credit Owned"
          />
        </FadeInUp>

        <FadeInUp delay={200}>
          <StatsCard
            title="Total Purchased"
            value={DASHBOARD_DATA.totalPurchased}
            subtitle="Total Carbon Coin Purchased"
            bgColor="bg-green-50"
            icon={<div className="w-6 h-6 bg-yellow-400 rounded-full shadow-sm"></div>}
          />
        </FadeInUp>

        <FadeInUp delay={300}>
          <div className="flex justify-center">
            <EarthGlobe coinsToRetire={DASHBOARD_DATA.coinsToRetire} earthImage={earthImage} />
          </div>
        </FadeInUp>

        <FadeInUp delay={400}>
          <StatsCard
            title="Current Price"
            value={`$${DASHBOARD_DATA.currentPrice}`}
            subtitle="Current Average Price (1 carbon coin)"
          />
        </FadeInUp>

        <FadeInUp delay={500}>
          <StatsCard
            title="Total Retired"
            value={DASHBOARD_DATA.totalRetired}
            subtitle="Total Carbon Coin Retired"
            bgColor="bg-blue-50"
            icon={<div className="w-6 h-6 bg-yellow-400 rounded-full shadow-sm"></div>}
          />
        </FadeInUp>
      </div>

      {/* Time Period Selector */}
      <FadeInUp delay={600}>
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {TIME_PERIODS.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 ${
                  selectedPeriod === period.id
                    ? 'bg-black text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </FadeInUp>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FadeInUp delay={700} className="lg:col-span-2">
          <div className="space-y-6">
            <RetirementTable data={RETIREMENT_DATA} />
            <PurchaseHistory data={PURCHASE_HISTORY} />
          </div>
        </FadeInUp>

        <FadeInUp delay={800}>
          <RetirementWidget coinsToRetire={DASHBOARD_DATA.retireCoins} />
        </FadeInUp>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;