import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, Edit, Eye, Trash, MoreVertical, Users, Lock, Unlock } from 'lucide-react';
import './customer.scss';
import EditUser from '../edituser/edituser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BasicPagination from '../../pagination/pagination';

const Customer = () => {
  const [allUsers, setAllUsers] = useState([])
  const [user, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [editTab,setEditTab] = useState(false)
  const actionMenuRefs = useRef({});
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(4);

  const navigate = useNavigate();


  useEffect(() => {
    async function fetchData() {
      await axios
        .get("http://localhost:3000/admin/data", { withCredentials: true })
        .then((res) => {
          setAllUsers(res.data);
          console.log(allUsers)
        })
        .catch((err) => {
          console.log("error at axios fetch in getting user data @ admin dash", err);
        });
    }
    fetchData();
  },[]);

  useEffect(() => {
    handleFilterClick(activeFilter);
  }, [allUsers]);


  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  

    const filteredUsers = allUsers.filter((customer) => {
      const searchString = query.toLowerCase();
      
      return (
        customer.username.toLowerCase().includes(searchString) ||
        customer.email.toLowerCase().includes(searchString) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchString)) 
      );
    });
  
    const finalFilteredUsers = filteredUsers.filter((customer) => {
      switch(activeFilter) {
        case 'Active':
          return !customer.isBlocked;
        case 'Blocked':
          return customer.isBlocked;
        case 'All':
        default:
          return true;
      }
    });
  
    setUsers(finalFilteredUsers);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    const filteredUsers = allUsers.filter((customer)=>{
      switch(filter) {
        case 'Active':
          return !customer.isBlocked;
        case 'Blocked':
          return customer.isBlocked;
        case 'All':
        default:
          return true;
      }
    })
    setUsers(filteredUsers)
  }

  const handleDateChange = (e) => {
    const selectedDateValue = e.target.value;
    setSelectedDate(selectedDateValue);

    const filteredUsers = allUsers.filter((customer) => {
      
      const isDateMatch = !selectedDateValue || 
      format(new Date(customer.createdAt), 'yyyy-MM-dd') === selectedDateValue;


    const isStatusMatch = 
      activeFilter === 'All' || 
      (activeFilter === 'Active' && !customer.isBlocked) || 
      (activeFilter === 'Blocked' && customer.isBlocked);

    return isDateMatch && isStatusMatch;
    });
  
    setUsers(filteredUsers);
  };

  const toggleActionMenu = (customerId) => {
    setOpenActionMenuId(openActionMenuId === customerId ? null : customerId);
  };

  //Delete
  const handleDelete = async (customer) => {
    try {
      const id = customer._id;
      const response = await axios.delete(`http://localhost:3000/admin/delete/${id}`, {
        withCredentials: true,
      });
      console.log(response.data.message);

      const updatedUsers = allUsers.filter((u) => u._id !== id);
      setAllUsers(updatedUsers);
      
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  //Edit
  
  const handleEdit = (customer)=>{
    setSelectedUser(customer)
    setEditTab(true);
        
  }

  const handleStatus = async(customer)=>{
    try{
      const response = await axios.put(
        `http://localhost:3000/admin/block/${customer._id}`, 
        { isBlocked: !customer.isBlocked },
        { withCredentials: true }
      );
        // Update the local state
      const updatedUsers = allUsers.map(user => 
        user._id === customer._id 
          ? { ...user, isBlocked: !user.isBlocked } 
          : user
      );

      setAllUsers(updatedUsers);
      setUsers(updatedUsers);

    }catch(error){
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  }

  const handleSaveChanges = async (updatedUser) => {
    try {
      const response = await axios.put(`http://localhost:3000/admin/edit/${updatedUser._id}`, updatedUser);
      if (response.status === 200) {
        toast.success('User updated successfully');
        setEditTab(false);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Failed to update user');
      console.error('Server error:', error.response.data);
    }
  };

  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = Object.values(actionMenuRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
  
      // Close menu only if the click is outside all dropdowns
      if (!isClickInside) {
        setOpenActionMenuId(null);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const pageCount = Math.ceil(user.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const currentOrders = user.slice(startIndex, startIndex + ordersPerPage);
  
    if(!editTab){
      return (
        <>
      <div className="customer-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Customers</h1>
          <div className="breadcrumb">
            <span className="dashboard-link">Dashboard</span>
            <span className="separator">/</span>
            <span>Customers List</span>
          </div>
        </div>
        <div className="header-actions">
          {/* <button className="btn btn-primary">
            <Plus size={16} className="mr-2" />
            Add New Customer
          </button> */}
        </div>
      </div>

      <div className="search-bar">
        <div className="search-icon-wrapper">
          <Search size={16} className="search-icon" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="filters-section">
        <div className="filter-tabs">
          {['All', 'Active', 'Blocked'].map((filter) => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="filter-actions">
        <input
            type="date"
            className="date-picker"
            onChange={handleDateChange}
            value={selectedDate || ''}
          />
          <button className="btn btn-outline">
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>
      </div>

      <div className="customers-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone No</th>
              <th>Status</th>
              <th>Added</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((customer) => (
              <tr key={customer._id}>
                <td>
                  <div className="customer-name">
                    <div className="avatar">
                      {customer.username.charAt(0).toUpperCase()}
                    </div>
                    <span>{customer.username}</span>
                  </div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone ? customer.phone : "Not Given"}</td>
                <td>
                  <span className={`status-badge ${customer.isBlocked ? "blocked" : "active"}`}>
                    {customer.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td>{format(new Date(customer.createdAt), 'dd MMM yyyy')}</td>
                <td>
                  <div 
                    className="action-wrapper"
                    ref={(el) => actionMenuRefs.current[customer._id] = el}
                  >
                    <div className="action-container">
                      <button 
                        className="action-menu-trigger"
                        onClick={() => toggleActionMenu(customer._id)}
                      >
                        <MoreVertical size={20} />
                      </button>
                      {openActionMenuId === customer._id && (
                        <div className="action-dropdown">
                          {/* <button className="dropdown-item"
                          onClick={()=> handleEdit(customer)}>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </button> */}
                          <button 
                             className="dropdown-item flex items-center"
                             onClick={()=>handleStatus(customer)}
                                               >
                              {customer.isBlocked ? (
                              <>
                               <Unlock size={16} className="mr-2" />
                               Un-Block
                                    </>
                                ) : (
                                <>
                             <Lock size={16} className="mr-2" />
                                   Block
                                </>
                                       )}
                              </button>
                          <button id='delete-btn' className="dropdown-item"
                                   onClick={() => { handleDelete(customer)}}>
                            <Trash size={16} className="mr-3" />
                             Delete
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
                  <div className="mt-6 flex justify-center">
                    <BasicPagination count={pageCount} onChange={handlePageChange} />
                  </div>
                )}
    </div>
    </>
      );
    }else{
     return (
      <>
           <EditUser user={selectedUser} onSave={handleSaveChanges}/>
           <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{ 
            fontFamily: "serif",
            fontSize: '18px',
          }}
        />
     </>
     )
     
    }
  
 
};

export default Customer;