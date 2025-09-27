import React from 'react';

const ProjectCard = ({ project, solarImage, forestImage, coinImage }) => {
  const getProjectImage = () => {
    if (project.type === 'solar' && solarImage) {
      return solarImage;
    } else if (project.type === 'forest' && forestImage) {
      return forestImage;
    }
    
    // Fallback illustrations (no background)
    if (project.type === 'solar') {
      return (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Solar Panel Illustration */}
          <div className="relative">
            <div className="w-20 h-12 bg-blue-600 rounded transform -rotate-12 shadow-lg"></div>
            <div className="w-20 h-12 bg-blue-500 rounded transform -rotate-6 absolute top-1 left-1 shadow-md"></div>
            <div className="w-20 h-12 bg-blue-400 rounded absolute top-2 left-2"></div>
            {/* Sun */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full">
              <div className="absolute inset-1 bg-yellow-300 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Tree Illustration */}
          <div className="flex space-x-2">
            <div className="relative">
              <div className="w-3 h-16 bg-amber-600 rounded-full"></div>
              <div className="absolute -top-4 -left-2 w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="absolute -top-6 -left-1 w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
            <div className="relative">
              <div className="w-3 h-20 bg-amber-700 rounded-full"></div>
              <div className="absolute -top-6 -left-3 w-10 h-10 bg-green-400 rounded-full"></div>
              <div className="absolute -top-8 -left-2 w-7 h-7 bg-green-500 rounded-full"></div>
            </div>
            <div className="relative">
              <div className="w-3 h-18 bg-amber-600 rounded-full"></div>
              <div className="absolute -top-5 -left-2 w-8 h-8 bg-green-600 rounded-full"></div>
              <div className="absolute -top-7 -left-1 w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
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
          {(project.type === 'solar' && solarImage) || (project.type === 'forest' && forestImage) ? (
            <img 
              src={project.type === 'solar' ? solarImage : forestImage}
              alt={project.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            getProjectImage()
          )}
        </div>

        {/* Purchase Button - Right side (medium) */}
        <div className="flex-1">
          <button className="w-full bg-black text-white py-3 px-6 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200 hover:shadow-md">
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;