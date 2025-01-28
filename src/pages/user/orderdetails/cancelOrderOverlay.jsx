import React, { useState } from 'react';
import { X } from 'lucide-react';

const CancelOrderOverlay = ({ onClose, onConfirm, isSubmitting }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }
    
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Cancel Order</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please provide a reason for cancelling your order. This helps us improve our service.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Reason
            </label>
            <textarea
              id="reason"
              rows={4}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Please explain why you want to cancel this order..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderOverlay;