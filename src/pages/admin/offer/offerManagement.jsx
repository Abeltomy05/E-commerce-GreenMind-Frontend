
import React, { useState,useEffect } from 'react'
import CreateOfferForm from './createOffer'
import { Loader2 } from "lucide-react";
import axios from 'axios';

export default function OfferManagement() {
    const [offers, setOffers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
  
    const fetchOffers = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:3000/admin/getoffers');
        setOffers(response.data);
        setError(null);
       } catch (err) {
        setError('Error loading offers. Please try again later.');
      console.error('Error fetching offers:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleDeleteOffer = async (offerId) => {
      try {
        const response = await axios.delete(`http://localhost:3000/admin/deleteoffer/${offerId}`);
        
        if (response.status === 200) {
            fetchOffers();
        } else {
            throw new Error('Failed to delete offer');
          }
      } catch (err) {
        setError('Error deleting offer. Please try again.');
        console.error('Error deleting offer:', err);
      }
    };
  
    useEffect(() => {
      fetchOffers();
    }, []);
  
    const filteredOffers = filter === 'all' 
      ? offers 
      : offers.filter(offer => offer.applicableTo === filter);
  
      if (error) {
        return (
          <div className="p-5 min-h-screen bg-[#9bac9c]">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button 
                onClick={() => {
                  setError(null);
                  fetchOffers();
                }}
                className="ml-2 text-red-700 hover:text-red-900 underline"
              >
                Retry
              </button>
            </div>
          </div>
        );
      }
  
      return (
        <div className="p-5 min-h-screen bg-[#9bac9c]">
          {!showCreateForm && (
            <>
              <h1 className="text-2xl font-bold mb-5 text-white">Manage Offers</h1>
              
              <div className="flex justify-between items-center mb-5">
                <div>
                  <button 
                    onClick={() => setFilter('all')} 
                    className={`mr-2 px-4 py-2 border-none cursor-pointer ${
                      filter === 'all' ? 'bg-[#47645a] text-white' : 'bg-white text-black'
                    }`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilter('product')} 
                    className={`mr-2 px-4 py-2 border-none cursor-pointer ${
                      filter === 'product' ? 'bg-[#47645a] text-white' : 'bg-white text-black'
                    }`}
                  >
                    Product Offers
                  </button>
                  <button 
                    onClick={() => setFilter('category')} 
                    className={`px-4 py-2 border-none cursor-pointer ${
                      filter === 'category' ? 'bg-[#47645a] text-white' : 'bg-white text-black'
                    }`}
                  >
                    Category Offers
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-[#47645a] text-white border-none cursor-pointer"
                >
                  + Create Offer
                </button>
              </div>
            </>
          )}
    
          {showCreateForm ? (
            <CreateOfferForm 
              onClose={() => {
                setShowCreateForm(false);
                fetchOffers();
              }} 
            />
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p>Loading offers...</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No offers found. Create your first offer!
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Discount</th>
                      <th className="p-3 text-left">Valid Period</th>
                      <th className="p-3 text-left">Applicable To</th>
                      <th className="p-3 text-left">Max Discount</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOffers.map((offer) => (
                      <tr key={offer._id} className="border-b border-gray-200">
                        <td className="p-3">{offer.name}</td>
                        <td className="p-3">{offer.description}</td>
                        <td className="p-3">
                          {offer.discountType === 'PERCENTAGE' 
                            ? `${offer.discountValue}%` 
                            : `₹${offer.discountValue}`}
                        </td>
                        <td className="p-3">
                          {new Date(offer.startDate).toLocaleDateString()} - 
                          {new Date(offer.endDate).toLocaleDateString()}
                        </td>
                        <td className="p-3 capitalize">{offer.applicableTo}</td>
                        <td className="p-3">
                          {offer.maxDiscountAmount ? `₹${offer.maxDiscountAmount}` : '-'}
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => handleDeleteOffer(offer._id)}
                            className="px-3 py-1 bg-red-500 text-white border-none cursor-pointer rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      );
  }