import React from 'react';
import coinImage from '../../assets/coin.png';

const AuthorityHeader = ({navigate}) => {
  return (
    <header className="flex justify-between items-center p-6 bg-white border-b border-gray-100">
      {/* Logo */}
      <div 
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/')}
      >
        <span className="text-xl font-bold text-gray-900">Eco</span>
        <span className="bg-black text-white px-2 py-1 text-sm ml-1 rounded font-medium">
          SWAP
        </span>
      </div>
    </header>
  );
};

export default AuthorityHeader;