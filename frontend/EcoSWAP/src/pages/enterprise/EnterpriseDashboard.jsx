import React, { useState, useEffect } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import StatsCard from '../../components/dashboard/StatsCard';
import EarthGlobe from '../../components/dashboard/EarthGlobe';
import RetirementTable from '../../components/dashboard/RetirementTable.jsx';
import PurchaseHistory from '../../components/dashboard/PurchaseHistory.jsx';
import RetirementWidget from '../../components/dashboard/RetirementWidget.jsx';
import { DASHBOARD_DATA, RETIREMENT_DATA, PURCHASE_HISTORY, TIME_PERIODS } from '../../utils/constants';
import coinImage from '../../assets/coin.png';
import earthImage from '../../assets/earth.png';

// API Service for retirement operations
class RetirementAPI {
  constructor() {
    this.baseURL = 'http://localhost:8000/api/v1/credit-retirement';
  }

  async getDashboardStats(userId) {
    try {
      const response = await fetch(`${this.baseURL}/dashboard-stats/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch retirement stats:', error);
    }
    return null;
  }

  async retireCredits(userId, coinsToRetire, reason = 'Net Zero Goal', autoConfirm = false) {
    try {
      const response = await fetch(`${this.baseURL}/retire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          coins_to_retire: coinsToRetire,
          retirement_reason: reason,
          auto_confirm: autoConfirm
        })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Retirement failed');
      }
    } catch (error) {
      console.error('Failed to retire credits:', error);
      throw error;
    }
  }

  async getRetirementHistory(userId) {
    try {
      const response = await fetch(`${this.baseURL}/history/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch retirement history:', error);
    }
    return [];
  }

  async updateRetirementRequest(retirementId, userId, updateData) {
    try {
      const response = await fetch(`${this.baseURL}/update/${retirementId}?user_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Update failed');
      }
    } catch (error) {
      console.error('Failed to update retirement:', error);
      throw error;
    }
  }

  async confirmRetirement(retirementId, userId) {
    try {
      const response = await fetch(`${this.baseURL}/confirm/${retirementId}?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Confirmation failed');
      }
    } catch (error) {
      console.error('Failed to confirm retirement:', error);
      throw error;
    }
  }

  async cancelRetirement(retirementId, userId) {
    try {
      const response = await fetch(`${this.baseURL}/cancel/${retirementId}?user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Cancellation failed');
      }
    } catch (error) {
      console.error('Failed to cancel retirement:', error);
      throw error;
    }
  }

  async getPendingRetirements(userId) {
    try {
      const response = await fetch(`${this.baseURL}/pending/${userId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch pending retirements:', error);
    }
    return [];
  }
}

const EnterpriseDashboard = ({ onCoinsUpdate, userCoins, userId = 1 }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('overall');
  const [retirementStats, setRetirementStats] = useState(null);
  const [retirementHistory, setRetirementHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retirementMessage, setRetirementMessage] = useState('');

  const api = new RetirementAPI();

  // Fetch retirement data
  const fetchRetirementData = async () => {
    setIsLoading(true);
    try {
      const [stats, history] = await Promise.all([
        api.getDashboardStats(userId),
        api.getRetirementHistory(userId)
      ]);
      
      if (stats) {
        setRetirementStats(stats);
      }
      setRetirementHistory(history);
    } catch (error) {
      console.error('Error fetching retirement data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle credit retirement
  const handleRetireCredits = async (coinsToRetire) => {
    if (coinsToRetire <= 0 || coinsToRetire > userCoins) {
      setRetirementMessage('Invalid amount or insufficient coins');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.retireCredits(userId, coinsToRetire, 'Net Zero Goal', false); // Create pending retirement
      
      if (result.success) {
        if (result.status === 'completed') {
          setRetirementMessage(`Successfully retired ${coinsToRetire} coins! Certificate: ${result.certificate_number}`);
          
          // Update coins in parent component
          if (onCoinsUpdate) {
            onCoinsUpdate(result.remaining_user_coins);
          }
        } else {
          setRetirementMessage(`Retirement request created! Amount: ${coinsToRetire} coins. Status: ${result.status}. You can modify or confirm it later.`);
        }
        
        // Refresh retirement data
        await fetchRetirementData();
      }
    } catch (error) {
      setRetirementMessage(`Retirement failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchRetirementData();
  }, [userId]);

  // Calculate dynamic stats
  const totalCredits = retirementStats?.total_retired || DASHBOARD_DATA.totalCredits;
  const totalRetired = retirementStats?.total_retired || DASHBOARD_DATA.totalRetired;
  const availableForRetirement = retirementStats?.available_for_retirement || userCoins;
  const progressPercentage = retirementStats?.progress_percentage || 25;
  const co2Offset = retirementStats?.co2_offset_tons || totalRetired;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Page Title */}
      <FadeInUp>
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 tracking-wide">
          ROAD TO NET-ZERO
        </h1>
      </FadeInUp>

      {/* Progress Indicator */}
      {retirementMessage && (
        <FadeInUp>
          <div className={`mb-6 p-4 rounded-lg ${
            retirementMessage.includes('Successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {retirementMessage}
          </div>
        </FadeInUp>
      )}

      {/* Main Stats Grid - Updated with dynamic data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Left Stats - 2 cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeInUp delay={100}>
            <StatsCard
              title="CO2 Offset"
              value={`${co2Offset.toFixed(1)} tons`}
              subtitle="Total CO2 Offset Achieved"
              bgColor="bg-green-50"
            />
          </FadeInUp>

          <FadeInUp delay={200}>
            <StatsCard
              title="Available Coins"
              value={availableForRetirement.toFixed(0)}
              subtitle="Available for Retirement"
              bgColor="bg-blue-50"
              icon={<img src={coinImage} alt="Carbon Coin" className="w-6 h-6" />}
            />
          </FadeInUp>
        </div>

        {/* Center Earth Globe - Updated with dynamic progress */}
        <FadeInUp delay={300}>
          <div className="flex justify-center">
            <EarthGlobe 
              coinsToRetire={availableForRetirement} 
              progressPercentage={progressPercentage}
              isLoading={isLoading}
            />
          </div>
        </FadeInUp>

        {/* Right Stats - 2 cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeInUp delay={400}>
            <StatsCard
              title="Net Zero Progress"
              value={`${progressPercentage.toFixed(1)}%`}
              subtitle="Progress Toward Net Zero"
              bgColor="bg-purple-50"
            />
          </FadeInUp>

          <FadeInUp delay={500}>
            <StatsCard
              title="Total Retired"
              value={totalRetired.toFixed(0)}
              subtitle="Total Carbon Coins Retired"
              bgColor="bg-gray-50"
              icon={<img src={coinImage} alt="Carbon Coin" className="w-6 h-6" />}
            />
          </FadeInUp>
        </div>
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

      {/* Bottom Section - Updated Layout */}
      <div className="space-y-8">
        {/* Retirement Table and Widget Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <FadeInUp delay={700} className="lg:col-span-2">
            <RetirementTable 
              data={retirementHistory.length > 0 ? retirementHistory : RETIREMENT_DATA} 
            />
          </FadeInUp>

          <FadeInUp delay={800}>
            <RetirementWidget 
              coinsToRetire={availableForRetirement}
              onRetire={handleRetireCredits}
              isLoading={isLoading}
              progressPercentage={progressPercentage}
            />
          </FadeInUp>
        </div>

        {/* Purchase History - Full Width */}
        <FadeInUp delay={900}>
          <PurchaseHistory data={PURCHASE_HISTORY} />
        </FadeInUp>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;