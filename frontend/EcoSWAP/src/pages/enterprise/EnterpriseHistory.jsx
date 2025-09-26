import React, { useState } from 'react';
import FadeInUp from '../../components/animations/FadeInUp';
import PurchaseHistory from '../../components/dashboard/PurchaseHistory';
import { PURCHASE_HISTORY } from '../../utils/constants';

const EnterpriseHistory = () => {
  const [filteredHistory, setFilteredHistory] = useState(PURCHASE_HISTORY);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter history based on status and search term
  React.useEffect(() => {
    let filtered = PURCHASE_HISTORY;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHistory(filtered);
  }, [statusFilter, searchTerm]);

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Page Title */}
      <FadeInUp>
        <h1 className="text-4xl font-bold mb-8 text-gray-900">
          Purchase History
        </h1>
      </FadeInUp>

      {/* Filters Section */}
      <FadeInUp delay={100}>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search transactions or projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-gray-300 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:bg-white focus:border-gray-300 focus:outline-none transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Statistics Cards */}
      <FadeInUp delay={200}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-2">Total Transactions</div>
            <div className="text-2xl font-bold text-gray-900">{PURCHASE_HISTORY.length}</div>
          </div>
          
          <div className="bg-green-50 rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="text-sm text-green-600 mb-2">Completed</div>
            <div className="text-2xl font-bold text-green-900">
              {PURCHASE_HISTORY.filter(item => item.status === 'Completed').length}
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-2xl p-6 shadow-sm border border-yellow-100">
            <div className="text-sm text-yellow-600 mb-2">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">
              {PURCHASE_HISTORY.filter(item => item.status === 'Pending').length}
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Purchase History Table */}
      <FadeInUp delay={300}>
        <PurchaseHistory data={filteredHistory} />
      </FadeInUp>

      {/* No Results Message */}
      {filteredHistory.length === 0 && (searchTerm || statusFilter !== 'all') && (
        <FadeInUp delay={400}>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        </FadeInUp>
      )}

      {/* Results Summary */}
      {filteredHistory.length > 0 && (searchTerm || statusFilter !== 'all') && (
        <FadeInUp delay={500}>
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {filteredHistory.length} of {PURCHASE_HISTORY.length} transactions
          </div>
        </FadeInUp>
      )}
    </div>
  );
};

export default EnterpriseHistory;