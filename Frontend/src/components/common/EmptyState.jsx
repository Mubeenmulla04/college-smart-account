import React from 'react';
import { HiOutlineFolderOpen } from 'react-icons/hi';

const EmptyState = ({ title = 'No data found', message = 'There are no records to display at this time.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <HiOutlineFolderOpen className="text-3xl text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-xs">{message}</p>
    </div>
  );
};

export default EmptyState;
