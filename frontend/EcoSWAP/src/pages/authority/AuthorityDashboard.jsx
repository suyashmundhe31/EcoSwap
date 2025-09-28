import React, { useState } from 'react';
import SearchBox from '../../components/layout/search';

const AuthorityDashboard = ({ navigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for companies with ENS names and wallet addresses
  const companiesData = [
    {
      id: 1,
      companyName: 'GreenTech Industries',
      ensName: 'greentech-industries.eth',
      walletAddress: '0x742d35Cc7bF34C6C72b1A74FC5f8a1b3d2D1c8E9',
      carbonCoins: 15000,
      coinsRetired: 3500,
      presentCarbonEmission: 1250.5,
      transactions: [
        {
          id: 1,
          date: '2024-09-20',
          purchasedFrom: 'solar-energy-co.eth',
          quantity: 500,
          transactionId: 'TXN-001-GTC-2024',
          price: 25.50
        },
        {
          id: 2,
          date: '2024-09-18',
          purchasedFrom: 'forest-conservation.eth',
          quantity: 750,
          transactionId: 'TXN-002-GTC-2024',
          price: 28.00
        },
        {
          id: 3,
          date: '2024-09-15',
          purchasedFrom: 'wind-power-ltd.eth',
          quantity: 1000,
          transactionId: 'TXN-003-GTC-2024',
          price: 22.75
        },
        {
          id: 4,
          date: '2024-09-12',
          purchasedFrom: 'clean-energy-solutions.eth',
          quantity: 300,
          transactionId: 'TXN-004-GTC-2024',
          price: 30.00
        },
        {
          id: 5,
          date: '2024-09-10',
          purchasedFrom: 'eco-power-generation.eth',
          quantity: 450,
          transactionId: 'TXN-005-GTC-2024',
          price: 26.80
        }
      ]
    },
    {
      id: 2,
      companyName: 'EcoSolutions Corp',
      ensName: 'ecosolutions-corp.eth',
      walletAddress: '0x8B7f4C9d2E3a5F6B1A8C4D7E9F2A5B8C1D4E7F0A',
      carbonCoins: 8500,
      coinsRetired: 1200,
      presentCarbonEmission: 850.3,
      transactions: [
        {
          id: 1,
          date: '2024-09-22',
          purchasedFrom: 'renewable-resources.eth',
          quantity: 300,
          transactionId: 'TXN-001-ESC-2024',
          price: 27.50
        },
        {
          id: 2,
          date: '2024-09-19',
          purchasedFrom: 'clean-energy-partners.eth',
          quantity: 400,
          transactionId: 'TXN-002-ESC-2024',
          price: 29.00
        },
        {
          id: 3,
          date: '2024-09-16',
          purchasedFrom: 'green-wind-energy.eth',
          quantity: 250,
          transactionId: 'TXN-003-ESC-2024',
          price: 31.00
        }
      ]
    },
    {
      id: 3,
      companyName: 'Sustainable Manufacturing Ltd',
      ensName: 'sustainable-manufacturing.eth',
      walletAddress: '0x1F5E8A9B3C7D4E2F9A6B8C5D1E4F7A9B2C5E8F1A',
      carbonCoins: 22000,
      coinsRetired: 5800,
      presentCarbonEmission: 2100.8,
      transactions: [
        {
          id: 1,
          date: '2024-09-25',
          purchasedFrom: 'green-power-solutions.eth',
          quantity: 1200,
          transactionId: 'TXN-001-SML-2024',
          price: 24.00
        },
        {
          id: 2,
          date: '2024-09-23',
          purchasedFrom: 'carbon-offset-alliance.eth',
          quantity: 800,
          transactionId: 'TXN-002-SML-2024',
          price: 31.25
        },
        {
          id: 3,
          date: '2024-09-21',
          purchasedFrom: 'eco-energy-group.eth',
          quantity: 600,
          transactionId: 'TXN-003-SML-2024',
          price: 28.50
        },
        {
          id: 4,
          date: '2024-09-20',
          purchasedFrom: 'sustainable-sources.eth',
          quantity: 450,
          transactionId: 'TXN-004-SML-2024',
          price: 26.75
        },
        {
          id: 5,
          date: '2024-09-18',
          purchasedFrom: 'renewable-energy-inc.eth',
          quantity: 950,
          transactionId: 'TXN-005-SML-2024',
          price: 23.80
        }
      ]
    },
    {
      id: 4,
      companyName: 'CleanAir Technologies',
      ensName: 'cleanair-tech.eth',
      walletAddress: '0x4A6C8E1F3B9D2A5E7C4F9B2E5A8C1F4B7E0D3A6C',
      carbonCoins: 5500,
      coinsRetired: 900,
      presentCarbonEmission: 420.2,
      transactions: [
        {
          id: 1,
          date: '2024-09-24',
          purchasedFrom: 'pure-energy-inc.eth',
          quantity: 200,
          transactionId: 'TXN-001-CAT-2024',
          price: 32.00
        },
        {
          id: 2,
          date: '2024-09-21',
          purchasedFrom: 'clean-tech-solutions.eth',
          quantity: 150,
          transactionId: 'TXN-002-CAT-2024',
          price: 29.50
        }
      ]
    },
    {
      id: 5,
      companyName: 'Future Energy Systems',
      ensName: 'future-energy-systems.eth',
      walletAddress: '0x9D2F5A8B4E7C1A6F3B9E2C5A8F1B4E7C0A3F6B9D',
      carbonCoins: 31000,
      coinsRetired: 8200,
      presentCarbonEmission: 3200.1,
      transactions: [
        {
          id: 1,
          date: '2024-09-26',
          purchasedFrom: 'global-carbon-exchange.eth',
          quantity: 2000,
          transactionId: 'TXN-001-FES-2024',
          price: 23.75
        },
        {
          id: 2,
          date: '2024-09-24',
          purchasedFrom: 'renewable-credits-co.eth',
          quantity: 1500,
          transactionId: 'TXN-002-FES-2024',
          price: 25.00
        },
        {
          id: 3,
          date: '2024-09-22',
          purchasedFrom: 'green-initiative-partners.eth',
          quantity: 1800,
          transactionId: 'TXN-003-FES-2024',
          price: 27.25
        },
        {
          id: 4,
          date: '2024-09-20',
          purchasedFrom: 'eco-development-corp.eth',
          quantity: 1200,
          transactionId: 'TXN-004-FES-2024',
          price: 24.50
        }
      ]
    },
    {
      id: 6,
      companyName: 'Renewable Innovations Inc',
      ensName: 'renewable-innovations.eth',
      walletAddress: '0x7E3A6F9C2B8D1E4A7C0F3B6E9A2D5F8B1E4C7A0F',
      carbonCoins: 12500,
      coinsRetired: 2800,
      presentCarbonEmission: 980.7,
      transactions: [
        {
          id: 1,
          date: '2024-09-25',
          purchasedFrom: 'solar-power-alliance.eth',
          quantity: 700,
          transactionId: 'TXN-001-RII-2024',
          price: 26.00
        },
        {
          id: 2,
          date: '2024-09-23',
          purchasedFrom: 'wind-energy-collective.eth',
          quantity: 500,
          transactionId: 'TXN-002-RII-2024',
          price: 28.75
        },
        {
          id: 3,
          date: '2024-09-21',
          purchasedFrom: 'hydro-power-solutions.eth',
          quantity: 350,
          transactionId: 'TXN-003-RII-2024',
          price: 30.25
        }
      ]
    },
    {
      id: 7,
      companyName: 'Carbon Neutral Enterprises',
      ensName: 'carbon-neutral-ent.eth',
      walletAddress: '0x2B5F8C1A4E7D0A3F6C9B2E5A8D1F4C7B0E3A6F9C',
      carbonCoins: 18700,
      coinsRetired: 4200,
      presentCarbonEmission: 1650.4,
      transactions: [
        {
          id: 1,
          date: '2024-09-26',
          purchasedFrom: 'green-energy-consortium.eth',
          quantity: 900,
          transactionId: 'TXN-001-CNE-2024',
          price: 25.80
        },
        {
          id: 2,
          date: '2024-09-24',
          purchasedFrom: 'sustainable-power-co.eth',
          quantity: 650,
          transactionId: 'TXN-002-CNE-2024',
          price: 27.40
        },
        {
          id: 3,
          date: '2024-09-22',
          purchasedFrom: 'eco-friendly-energy.eth',
          quantity: 800,
          transactionId: 'TXN-003-CNE-2024',
          price: 24.90
        }
      ]
    },
    {
      id: 8,
      companyName: 'Green Future Corp',
      ensName: 'green-future-corp.eth',
      walletAddress: '0x5C8F1A4B7E0D3A6C9F2B5E8A1D4F7C0B3E6A9F2C',
      carbonCoins: 9200,
      coinsRetired: 1850,
      presentCarbonEmission: 720.3,
      transactions: [
        {
          id: 1,
          date: '2024-09-25',
          purchasedFrom: 'alternative-energy-sources.eth',
          quantity: 400,
          transactionId: 'TXN-001-GFC-2024',
          price: 29.00
        },
        {
          id: 2,
          date: '2024-09-23',
          purchasedFrom: 'clean-power-initiative.eth',
          quantity: 320,
          transactionId: 'TXN-002-GFC-2024',
          price: 31.50
        }
      ]
    }
  ];

  // Filter companies based on search query (search by company name or ENS name)
  const filteredCompanies = companiesData.filter(company =>
    company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.ensName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewTransactions = (companyId, companyName) => {
    console.log('Navigating to company transactions:', companyId, companyName);
    // Navigate to company transactions page with company data
    navigate(`/authority/company-transactions?companyId=${companyId}&companyName=${encodeURIComponent(companyName)}`);
  };

  // Function to copy wallet address to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here if needed
      console.log('Copied to clipboard:', text);
    });
  };

  // Calculate totals for summary statistics
  const totalCompanies = companiesData.length;
  const totalCarbonCoins = companiesData.reduce((sum, company) => sum + company.carbonCoins, 0);
  const totalCoinsRetired = companiesData.reduce((sum, company) => sum + company.coinsRetired, 0);
  const totalEmissions = companiesData.reduce((sum, company) => sum + company.presentCarbonEmission, 0);
  const totalTransactions = companiesData.reduce((sum, company) => sum + company.transactions.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authority Dashboard</h1>
          <p className="text-gray-600">Monitor and oversee carbon credit transactions across all companies</p>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-black">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{totalCompanies}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-600">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Carbon Coins</p>
                <p className="text-2xl font-bold text-gray-900">{totalCarbonCoins.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-800">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Retired</p>
                <p className="text-2xl font-bold text-gray-900">{totalCoinsRetired.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emissions (tons)</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmissions.toLocaleString()}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Search Section */}
        <div className="mb-8">
          <SearchBox 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search companies by name or ENS..."
          />
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 bg-black text-white">
            <h2 className="text-xl font-semibold">Company Carbon Credits Overview</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carbon Coins
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coins Retired
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present Carbon Emission (tons)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                            <span className="font-semibold text-sm">
                              {company.companyName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            {/* ENS Name - Primary display */}
                            <div className="text-lg font-bold text-blue-600 mb-1">
                              {company.ensName}
                            </div>
                            {/* Company Name - Secondary */}
                            <div className="text-sm font-medium text-gray-900 mb-2">
                              {company.companyName}
                            </div>
                            {/* Wallet Address */}
                            <div className="flex items-center space-x-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 break-all">
                                {company.walletAddress}
                              </code>
                              <button
                                onClick={() => copyToClipboard(company.walletAddress)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy wallet address"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {company.transactions.length} transactions
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {company.carbonCoins.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Active credits
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {company.coinsRetired.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {((company.coinsRetired / (company.carbonCoins + company.coinsRetired)) * 100).toFixed(1)}% of total
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {company.presentCarbonEmission.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Current emissions
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewTransactions(company.id, company.companyName)}
                          className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium">No companies found</p>
                        <p className="text-sm">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Showing Results */}
          {filteredCompanies.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredCompanies.length}</span> of{' '}
                  <span className="font-medium">{totalCompanies}</span> companies
                </div>
                <div className="text-sm text-gray-500">
                  {searchQuery && `Filtered by: "${searchQuery}"`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {((totalCoinsRetired / (totalCarbonCoins + totalCoinsRetired)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Credits Retired Rate</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {(totalTransactions / totalCompanies).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg. Transactions per Company</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">
                {(totalEmissions / totalCompanies).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg. Emissions per Company (tons)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;