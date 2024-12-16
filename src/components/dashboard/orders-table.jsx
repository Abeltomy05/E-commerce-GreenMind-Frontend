import React from 'react'
import { Edit, Eye, Trash, ChevronRight } from 'lucide-react'

export function OrdersTable() {
  const orders = [
    {
      id: '302012',
      product: {
        name: 'Americano',
        image: '/plant1.jpg',
        additionalProducts: 3
      },
      date: '29 Dec 2022',
      customer: 'Josh Wisley',
      total: '₹59000',
      payment: '24 Jun 2023',
      status: 'Processing'
    },
    {
      id: '302013',
      product: {
        name: 'Espresso',
        image: '/plant2.jpg',
        additionalProducts: 2
      },
      date: '15 Jan 2023',
      customer: 'Emily Chen',
      total: '₹42000',
      payment: '10 Jul 2023',
      status: 'Completed'
    },
    {
      id: '302014',
      product: {
        name: 'Latte',
        image: '/plant3.jpg',
        additionalProducts: 1
      },
      date: '03 Feb 2023',
      customer: 'Michael Wong',
      total: '₹35000',
      payment: '18 Jul 2023',
      status: 'Cancelled'
    }
  ]

  return (
    <div className="orders-section">
      <h3>
        Latest Orders
      </h3>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td className="product-cell">
                <img src={order.product.image} alt={order.product.name} />
                <div>
                  <p>{order.product.name}</p>
                  <span>+{order.product.additionalProducts} Products</span>
                </div>
              </td>
              <td>{order.date}</td>
              <td>{order.customer}</td>
              <td>{order.total}</td>
              <td>{order.payment}</td>
              <td>
                <span className={`status ${order.status.toLowerCase().replace(' ', '-')}`}>
                  {order.status}
                </span>
              </td>
              <td className="actions">
                  <button className="action-button edit"><Edit size={16} /></button>
                  <button className="action-button view"><Eye size={16} /></button>
                  <button className="action-button delete"><Trash size={16} /></button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}