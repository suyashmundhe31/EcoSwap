import React, { useState } from 'react';
import PurchaseModal from './PurchaseModal';

const ProjectCard = ({ project, solarImage, forestImage, coinImage, onPurchaseSuccess, userId = 1 }) => {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const handlePurchaseClick = () => {
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSuccess = (purchaseResult) => {
    // Notify parent component of successful purchase
    if (onPurchaseSuccess) {
      onPurchaseSuccess(purchaseResult);
    }
  };

  const getProjectImage = () => {
    // Use source field to determine image type
    if ((project.source === 'solar' || project.source === 'solar_panel' || project.source === 'solar_plant') && solarImage) {
      return (
        <img 
          src={solarImage}
          alt={project.title}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    } else if (project.source === 'forestation' && forestImage) {
      return (
        <img 
          src={forestImage}
          alt={project.title}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    } else {
      // Fallback for any other project types
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
          <div className="text-gray-500 text-sm">No Image</div>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {/* Header with title and coins */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {project.title}
          </h3>
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {project.location}
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="flex items-center justify-end space-x-1 mb-1">
            <img src={coinImage} alt="Carbon Coin" className="w-6 h-6" />
            <div className="font-bold text-lg text-gray-900">{project.coins}</div>
          </div>
          <div className="text-xs text-gray-600 whitespace-nowrap">Available coins</div>
        </div>
      </div>

      {/* Bottom section with image on left and button on right */}
      <div className="flex items-end space-x-4">
        {/* Project Image - Left side (larger, no background) */}
        <div className="w-35 h-28">
          {((project.source === 'solar' || project.source === 'solar_panel' || project.source === 'solar_plant') && solarImage) || (project.source === 'forestation' && forestImage) ? (
            <img 
              src={(project.source === 'solar' || project.source === 'solar_panel' || project.source === 'solar_plant') ? solarImage : forestImage}
              alt={project.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            getProjectImage()
          )}
        </div>

        {/* Purchase Button - Right side (medium) */}
        <div className="flex-1">
          <button 
            onClick={handlePurchaseClick}
            disabled={project.coins === 0}
            className={`w-full py-3 px-6 rounded-full text-sm font-medium transition-colors duration-200 hover:shadow-md ${
              project.coins === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {project.coins === 0 ? 'Sold Out' : 'Purchase'}
          </button>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        project={project}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
        userId={userId}
      />
    </div>
  );
};

export default ProjectCard;