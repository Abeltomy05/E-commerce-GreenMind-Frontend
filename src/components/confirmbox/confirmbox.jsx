import React from 'react';
import { X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <h2 className="text-xl font-bold text-[#3d5e52] mb-4">Confirm Return</h2>
        <p className="text-gray-700 text-sm mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;