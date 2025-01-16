import React, { useState, useEffect } from "react"
import { Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import CouponCreation from "./createCoupon"
import api from "../../../utils/adminAxiosConfig"

const CouponManagement = () => {
  const [activeTab, setActiveTab] = useState("All")
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
 
  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/admin/getcoupons')
      if (!response.data) throw new Error('No data received')
      setCoupons(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError('Failed to fetch coupons')
      console.error('Error fetching coupons:', err)
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCoupon = async(couponData) => {
    try {
      await fetchCoupons()
      setShowCreateForm(false)
    } catch (err) {
      console.error('Error after coupon creation:', err)
    }
  }

  const handleCancel = () => {
    setShowCreateForm(false)
  }

  const handleDelete = async (couponId) => {
    try {
      await api.delete(`/admin/deletecoupon/${couponId}`)
      await fetchCoupons()
    } catch (err) {
      console.error('Error deleting coupon:', err)
      setError('Failed to delete coupon')
    }
  }

  const getCouponStatus = (coupon) => {
    const currentDate = new Date()
    const expiryDate = new Date(coupon.expiryDate)
    return currentDate > expiryDate ? "Expired" : "Active"
  }

  const filteredCoupons = Array.isArray(coupons) ? coupons.filter(coupon => {
    if (activeTab === "All") return true
    const status = getCouponStatus(coupon)
    return status === activeTab
  }) : []

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (showCreateForm) {
    return <CouponCreation onSubmit={handleCreateCoupon} onCancel={handleCancel} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#9bac9c] p-6 flex items-center justify-center">
        <div className="text-[#47645a]">Loading coupons...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#9bac9c] p-6 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#9bac9c] p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#47645a]">Coupon</h2>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-[#47645a] hover:bg-[#47645a]/90 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </button>
        </div>

        <div className="mb-6">
          <nav className="flex gap-4" aria-label="Tabs">
            {["All", "Active", "Expired"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 rounded transition-colors ${
                  activeTab === tab
                    ? "bg-[#47645a] text-white font-medium"
                    : "text-gray-900 hover:text-white-900 hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {filteredCoupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 font-medium text-gray-600">Coupon Code</th>
                  <th className="pb-3 font-medium text-gray-600">Discount</th>
                  <th className="pb-3 font-medium text-gray-600">Max Discount</th>
                  <th className="pb-3 font-medium text-gray-600">Min Purchase</th>
                  <th className="pb-3 font-medium text-gray-600">Start Date</th>
                  <th className="pb-3 font-medium text-gray-600">Expiry Date</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Uses</th>
                  <th className="pb-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon)
                  return (
                    <tr 
                      key={coupon._id} 
                      className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 text-gray-800">{coupon.code}</td>
                      <td className="py-4 text-gray-800">{coupon.discount}%</td>
                      <td className="py-4 text-gray-800">₹{coupon.maximumDiscountAmount}</td>
                      <td className="py-4 text-gray-800">₹{coupon.minimumPurchaseAmount}</td>
                      <td className="py-4 text-gray-800">{formatDate(coupon.startDate)}</td>
                      <td className="py-4 text-gray-800">{formatDate(coupon.expiryDate)}</td>
                      <td className="py-4">
                        <span 
                          className={`px-2 py-1 text-sm rounded-full ${
                            status === "Active"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-800">{coupon.usageCount || 0}/{coupon.maxUses || '∞'}</td>
                      <td className="py-4">
                        <button 
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Delete coupon"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-600 text-lg mb-4">No coupons are available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CouponManagement

