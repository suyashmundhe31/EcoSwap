import React, { useState, useEffect } from 'react';

const CompanyTransactions = ({ navigate }) => {
  const [companyData, setCompanyData] = useState(null);

  // Same mock data as AuthorityDashboard
  const companiesData = {
    1: {
      companyName: 'GreenTech Industries',
      carbonCoins: 15000,
      coinsRetired: 3500,
      presentCarbonEmission: 1250.5,
      transactions: [
        { id: 1, date: '2024-09-20', purchasedFrom: 'Solar Energy Co.', quantity: 500 },
        { id: 2, date: '2024-09-18', purchasedFrom: 'Forest Conservation Inc.', quantity: 750 },
        { id: 3, date: '2024-09-15', purchasedFrom: 'Wind Power Ltd.', quantity: 1000 },
        { id: 4, date: '2024-09-12', purchasedFrom: 'Clean Energy Solutions', quantity: 300 },
        { id: 5, date: '2024-09-10', purchasedFrom: 'Eco Power Generation', quantity: 450 }
      ]
    },
    2: {
      companyName: 'EcoSolutions Corp',
      carbonCoins: 8500,
      coinsRetired: 1200,
      presentCarbonEmission: 850.3,
      transactions: [
        { id: 1, date: '2024-09-22', purchasedFrom: 'Renewable Resources', quantity: 300 },
        { id: 2, date: '2024-09-19', purchasedFrom: 'Clean Energy Partners', quantity: 400 },
        { id: 3, date: '2024-09-16', purchasedFrom: 'Green Wind Energy', quantity: 250 }
      ]
    },
    3: {
      companyName: 'Sustainable Manufacturing Ltd',
      carbonCoins: 22000,
      coinsRetired: 5800,
      presentCarbonEmission: 2100.8,
      transactions: [
        { id: 1, date: '2024-09-25', purchasedFrom: 'Green Power Solutions', quantity: 1200 },
        { id: 2, date: '2024-09-23', purchasedFrom: 'Carbon Offset Alliance', quantity: 800 },
        { id: 3, date: '2024-09-21', purchasedFrom: 'Eco Energy Group', quantity: 600 },
        { id: 4, date: '2024-09-20', purchasedFrom: 'Sustainable Sources', quantity: 450 },
        { id: 5, date: '2024-09-18', purchasedFrom: 'Renewable Energy Inc.', quantity: 950 }
      ]
    },
    4: {
      companyName: 'CleanAir Technologies',
      carbonCoins: 5500,
      coinsRetired: 900,
      presentCarbonEmission: 420.2,
      transactions: [
        { id: 1, date: '2024-09-24', purchasedFrom: 'Pure Energy Inc.', quantity: 200 },
        { id: 2, date: '2024-09-21', purchasedFrom: 'Clean Tech Solutions', quantity: 150 }
      ]
    },
    5: {
      companyName: 'Future Energy Systems',
      carbonCoins: 31000,
      coinsRetired: 8200,
      presentCarbonEmission: 3200.1,
      transactions: [
        { id: 1, date: '2024-09-26', purchasedFrom: 'Global Carbon Exchange', quantity: 2000 },
        { id: 2, date: '2024-09-24', purchasedFrom: 'Renewable Credits Co.', quantity: 1500 },
        { id: 3, date: '2024-09-22', purchasedFrom: 'Green Initiative Partners', quantity: 1800 },
        { id: 4, date: '2024-09-20', purchasedFrom: 'Eco Development Corp', quantity: 1200 }
      ]
    },
    6: {
      companyName: 'Renewable Innovations Inc',
      carbonCoins: 12500,
      coinsRetired: 2800,
      presentCarbonEmission: 980.7,
      transactions: [
        { id: 1, date: '2024-09-25', purchasedFrom: 'Solar Power Alliance', quantity: 700 },
        { id: 2, date: '2024-09-23', purchasedFrom: 'Wind Energy Collective', quantity: 500 },
        { id: 3, date: '2024-09-21', purchasedFrom: 'Hydro Power Solutions', quantity: 350 }
      ]
    },
    7: {
      companyName: 'Carbon Neutral Enterprises',
      carbonCoins: 18700,
      coinsRetired: 4200,
      presentCarbonEmission: 1650.4,
      transactions: [
        { id: 1, date: '2024-09-26', purchasedFrom: 'Green Energy Consortium', quantity: 900 },
        { id: 2, date: '2024-09-24', purchasedFrom: 'Sustainable Power Co.', quantity: 650 },
        { id: 3, date: '2024-09-22', purchasedFrom: 'Eco-Friendly Energy', quantity: 800 }
      ]
    },
    8: {
      companyName: 'Green Future Corp',
      carbonCoins: 9200,
      coinsRetired: 1850,
      presentCarbonEmission: 720.3,
      transactions: [
        { id: 1, date: '2024-09-25', purchasedFrom: 'Alternative Energy Sources', quantity: 400 },
        { id: 2, date: '2024-09-23', purchasedFrom: 'Clean Power Initiative', quantity: 320 }
      ]
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('companyId');
    
    console.log('Company ID:', companyId);
    console.log('Available companies:', Object.keys(companiesData));
    
    if (companyId && companiesData[companyId]) {
      setCompanyData(companiesData[companyId]);
    }
  }, []);

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/authority')}
            className="flex items-center text-gray-600 hover:text-black transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Company Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{companyData.companyName}</h1>
          <p className="text-gray-600">Transaction History</p>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-black text-white">
            <h2 className="text-xl font-semibold">All Transactions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchased From
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyData.transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.purchasedFrom}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {transaction.quantity.toLocaleString()} credits
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Total Transactions: <span className="font-semibold">{companyData.transactions.length}</span>
              {' | '}
              Total Credits: <span className="font-semibold">
                {companyData.transactions.reduce((sum, t) => sum + t.quantity, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyTransactions;