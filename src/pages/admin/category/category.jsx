import React, { useState, useRef, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, Edit, MoreVertical, Check, X } from 'lucide-react';
import './category.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddCategory from '../../../components/admin/addCategory/addCategory';
import EditCategory from '../../../components/admin/editCategory/editCategory';
import BasicPagination from '../../../components/pagination/pagination';
import AdminBreadcrumbs from '../../../components/breadcrumbs/breadcrumbs';

const Category = () => {
  const [category, setCategory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Category');
  const [selectedDate, setSelectedDate] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [editTab, setEditTab] = useState(false);
  const [addTab, setAddTab] = useState(false);
  const actionMenuRefs = useRef({});
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(4);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get("http://localhost:3000/admin/categorydata", { 
          withCredentials: true 
        });
        console.log('Axios Response:', response.data);
        if (Array.isArray(response.data)) {
          setCategory(response.data);
        } else {
          console.error('Invalid data format:', response.data);
          toast.error('Invalid data format');
        } 
      } catch(error) {
        toast.error('Failed to fetch categories');
        console.error('Fetch Products Error:', error);
      }
    }

    fetchData();
  }, []);






  const filteredCategories = useMemo(() => {
    return category.filter(cat => {
      // Search filter
      const matchesSearch = !searchQuery || 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesFilter = 
        activeFilter === 'All Category' ||
        (activeFilter === 'Active' && cat.isActive) ||
        (activeFilter === 'Non-Active' && !cat.isActive);
      
      // Date filter (if selectedDate is set)
      const matchesDate = !selectedDate || 
        format(new Date(cat.createdAt), 'yyyy-MM-dd') === selectedDate;
      
      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [category, searchQuery, activeFilter, selectedDate]);


  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const pageCount = Math.ceil(filteredCategories.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const currentOrders = filteredCategories.slice(startIndex, startIndex + ordersPerPage);
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };
  
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };
  
  const fetchCategory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/categorydata');
      setCategory(response.data);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const toggleActionMenu = (categoryId) => {
    setOpenActionMenuId(openActionMenuId === categoryId ? null : categoryId);
  };

  const handleActive = async (item) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/admin/categorystatus/${item._id}`, 
        { isActive: !item.isActive },
        { withCredentials: true }
      );
    
      const updatedData = category.map(cat => 
        cat._id === item._id 
          ? { ...cat, isActive: !cat.isActive } 
          : cat
      );

      setCategory(updatedData);
    } catch(error) {
      console.error("Error updating category status:", error);
      toast.error("Failed to update category status");
    }
  };
  
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setEditTab(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInside = Object.values(actionMenuRefs.current).some(
        (ref) => ref && ref.contains(event.target)
      );
  
      if (!isClickInside) {
        setOpenActionMenuId(null);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderContent = () => {
    if (addTab) {
      return (
        <>
        <AdminBreadcrumbs additionalCrumb="Add Category"/>
        <AddCategory 
          onSave={(newCategory) => {
            if(newCategory) {
              setCategory(prev => [...prev, newCategory]);
            }
            setAddTab(false);
          }} 
          onCancel={() => setAddTab(false)}
          onUpdateSuccess={fetchCategory}
        />
        </>
      );
    }

    if (editTab && selectedCategory) {
      return (
        <>
        <AdminBreadcrumbs additionalCrumb="Edit Category"/>
        <EditCategory 
          category={selectedCategory} 
          onCancel={() => setEditTab(false)}
          onUpdateSuccess={fetchCategory}
        />
        </>
      );
    }
  
    return (
      <div className="category-dashboard">
        <div className="category-dashboard-header">
          <div className="category-header-left">
            <h1>Category</h1>
            {/* <div className="category-breadcrumb">
              <AdminBreadcrumbs/>
            </div> */}
          </div>
          <div className="category-header-actions">
            <button className="btn btn-primary" onClick={() => setAddTab(true)}>
              <Plus size={16} className="mr-2" />
              Add New Category
            </button>
          </div>
        </div>

        <div className="category-search-bar">
          <div className="search-icon-wrapper">
            <Search size={16} className="search-icon" />
          </div>
          <input
            type="text"
            placeholder="Search category..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="category-filters-section">
          <div className="category-filter-tabs">
            {['All Category', 'Active', 'Non-Active'].map((filter) => (
              <button
                key={filter}
                className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="category-filter-actions">
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

        <div className="category-table">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                {/* <th>Sold</th> */}
                <th>Status</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="product-name">
                      <span>{item.name}</span>
                    </div>
                  </td>

                  {/* <td>Sample data</td> */}

                  <td>
                    <span className={`status-badge ${item.isActive ? "active" : "blocked"}`}>
                      {item.isActive ? "Active" : "Non-Active"}
                    </span>
                  </td>

                  <td>{format(new Date(item.createdAt), 'dd MMM yyyy')}</td>

                  <td>
                    <div 
                      className="action-wrapper"
                      ref={(el) => actionMenuRefs.current[item._id] = el}
                    >
                      <div className="action-container">
                        <button 
                          className="action-menu-trigger"
                          onClick={() => toggleActionMenu(item._id)}
                        >
                          <MoreVertical size={20} className='vertical-dot'/>
                        </button>
                        {openActionMenuId === item._id && (
                          <div className="action-dropdown">
                            <button 
                              className="dropdown-item"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit size={16} className="mr-2" />
                              Edit
                            </button>
                    
                            <button
                              className={`dropdown-item flex items-center ${
                                item.isActive 
                                  ? 'text-success bg-success/10' 
                                  : 'text-danger bg-danger/10'
                              }`}
                              onClick={() => handleActive(item)}
                            >
                              {item.isActive ? (
                                <>
                                  <Check size={16} className="mr-2" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <X size={16} className="mr-2" />
                                  Inactive
                                </>
                              )}
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
    );
  
  };

  return (
    <>
      {renderContent()}
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
  );
};

export default Category;