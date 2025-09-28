import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import mintCoinApi from '../../services/mintCoinApi';

const PurchaseModal = ({ 
  project, 
  isOpen, 
  onClose, 
  onPurchaseSuccess, 
  userId = 1 
}) => {
  const [creditsToPurchase, setCreditsToPurchase] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const maxCredits = project.credits || project.coins || 0;
  const coinCost = creditsToPurchase; // 1 credit = 1 coin

  const handlePurchase = async () => {
    if (isPurchasing || creditsToPurchase <= 0) return;
    
    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      let result;
      
      // Determine which API to call based on source
      if (project.source === 'solar_plant' || project.apiEndpoint === 'solar-panel') {
        result = await mintCoinApi.purchaseSolarMintCoin(project.id, creditsToPurchase, userId);
      } else if (project.source === 'forestation' || project.apiEndpoint === 'forestation') {
        result = await mintCoinApi.purchaseForestationMintCoin(project.id, creditsToPurchase, userId);
      } else {
        throw new Error('Unknown project source');
      }
      
      if (result.success) {
        console.log('Purchase successful:', result);
        
        // Notify parent component of successful purchase
        if (onPurchaseSuccess) {
          onPurchaseSuccess({
            projectId: project.id,
            creditsPurchased: result.credits_purchased,
            coinsSpent: result.credits_purchased, // Same as credits purchased
            remainingCredits: result.remaining_credits,
            isSoldOut: result.is_sold_out,
            projectName: result.name
          });
        }
        
        // Close modal
        onClose();
        
        // Show success message
        alert(`Successfully purchased ${result.credits_purchased} credits from ${result.name}!`);
      } else {
        throw new Error(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseError(error.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCreditsChange = (value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 1 && numValue <= maxCredits) {
      setCreditsToPurchase(numValue);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Purchase Credits</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Project Info */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">{project.name || project.title}</h4>
          <div className="text-sm text-gray-600">
            <p>Available Credits: <span className="font-medium">{maxCredits}</span></p>
            <p>Source: <span className="font-medium capitalize">{project.source}</span></p>
          </div>
        </div>

        {/* Credits Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credits to Purchase
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleCreditsChange(creditsToPurchase - 1)}
              disabled={creditsToPurchase <= 1}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            </button>
            
            <input
              type="number"
              min="1"
              max={maxCredits}
              value={creditsToPurchase}
              onChange={(e) => handleCreditsChange(e.target.value)}
              className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={() => handleCreditsChange(creditsToPurchase + 1)}
              disabled={creditsToPurchase >= maxCredits}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {/* Quick selection buttons */}
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => setCreditsToPurchase(1)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              1
            </button>
            <button
              onClick={() => setCreditsToPurchase(Math.min(5, maxCredits))}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              5
            </button>
            <button
              onClick={() => setCreditsToPurchase(Math.min(10, maxCredits))}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              10
            </button>
            <button
              onClick={() => setCreditsToPurchase(maxCredits)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              All
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Cost:</span>
            <div className="flex items-center space-x-2">
              <img src="/src/assets/coin.png" alt="Coin" className="w-5 h-5" />
              <span className="font-bold text-lg">{coinCost}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {creditsToPurchase} credit{creditsToPurchase !== 1 ? 's' : ''} × 1 coin per credit
          </div>
        </div>

        {/* Error Message */}
        {purchaseError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{purchaseError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={isPurchasing || creditsToPurchase <= 0}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              isPurchasing 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isPurchasing ? 'Purchasing...' : 'Purchase'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PurchaseModal;