import React from 'react'
import { LayoutGrid, Package, List, ShoppingCart, Ticket, Image, FileText, Users, Settings, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'


export function Sidebar() {
 

 
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/product' },
    { icon: List, label: 'Category', path: '/admin/category' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Ticket, label: 'Coupon', path: '/admin/coupon' },
    // { icon: Image, label: 'Banner', path: '/admin/banner' },
    { icon: FileText, label: 'Offer', path: '/admin/offer' },
    { icon: Users, label: 'Customers', path: '/admin/customer' },
    // { icon: Settings, label: 'Settings', path: '/admin/settings' },
    { icon: LogOut, label: 'Logout',  path: '/admin/logout' }
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>GREENMIND</h1>
      </div>
      <nav>
        <div className="menu-label">MENU</div>
        {menuItems.map((item,index) => {
          const Icon = item.icon
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => 
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}