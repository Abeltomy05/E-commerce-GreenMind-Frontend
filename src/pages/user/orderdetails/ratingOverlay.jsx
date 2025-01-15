import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import {toast} from 'react-toastify'
import axiosInstance from '../../../utils/axiosConfig';

const RatingOverlay = ({ onClose,orderId }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
        toast.error('Please select a rating');
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await axiosInstance.post('/user/addrating', {
          orderId,
          rating,
          feedback
        });
  
        if (response.data.success) {
          toast.success('Thank you for your rating!');
          setTimeout(()=>{
            setIsSubmitting(false);
          },2000)
          onClose();
        } else {
          throw new Error(response.data.message || 'Failed to submit rating');
        }
      } catch (error) {
        console.error('Error submitting rating:', error);
        toast.error(error.message || 'Failed to submit rating. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold mb-4">Rate Your Order</h3>
        
        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              className="focus:outline-none"
              disabled={isSubmitting}
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback here..."
          className="w-full p-3 border rounded-md mb-4 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isSubmitting}
        />

        <button
          onClick={handleSubmit}
          disabled={!rating || isSubmitting}
          className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
};

export default RatingOverlay;