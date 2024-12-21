import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, Edit,  MoreVertical,  Trash2, RefreshCw } from 'lucide-react';
import './products.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddProduct from '../addProduct/addProduct';
import EditProduct from '../editProduct/editProduct';
import BasicPagination from '../../pagination/pagination';

const Products = () => {
  const [allProducts, setAllProducts] = useState([])
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Products');
  const [selectedDate, setSelectedDate] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [editTab,setEditTab] = useState(false)
  const [addTab,setAddTab] = useState(false)
  const actionMenuRefs = useRef({});
  const [page, setPage] = useState(1);
  const [ordersPerPage] = useState(3);

  useEffect(() => {
    async function fetchData() {
      try{
      const response = await axios.get("http://localhost:3000/admin/productdata", { 
        withCredentials: true 
    });
    console.log('Axios Response:', response.data);
    if (Array.isArray(response.data)) {
      setAllProducts(response.data);
     } else {
      console.error('Invalid data format:', response.data);
      setError('Invalid data format');
    } 
  }catch(error){
    console.error('Fetch Products Error:', error);
  }
    }

    fetchData();
  },[]);

  // useEffect(() => {
  //   handleFilterClick(activeFilter);
  // }, [allProducts]);


  const filterProducts = (productList, searchTerm, filter, date) => {
    return productList.filter(product => {
      // Search filtering
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase());
  
      // Calculate stock
      const calculateEffectiveStock = (variants) => {
        return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
      };
  
      // Filter logic
      const matchesFilter = 
        filter === 'All Products' || 
        (filter === 'In Stock' && !product.isDeleted && calculateEffectiveStock(product.variants) > 0) ||
        (filter === 'Out of Stock' && !product.isDeleted && calculateEffectiveStock(product.variants) === 0) ||
        (filter === 'Deleted' && product.isDeleted);
  
      // Date filtering
      const matchesDate = !date || 
        (new Date(product.createdAt).toDateString() === new Date(date).toDateString());
  
      return matchesSearch && matchesFilter && matchesDate;
    });
  };

  useEffect(() => {
    const filteredProducts = filterProducts(
      allProducts, 
      searchQuery, 
      activeFilter, 
      selectedDate
    );
    setProducts(filteredProducts);
  }, [allProducts, searchQuery, activeFilter, selectedDate]);



  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };
  
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };
  
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/admin/productdata');
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };



  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const toggleActionMenu = (productId) => {
    setOpenActionMenuId(openActionMenuId === productId ? null : productId);
  };

  //Delete
  const handleSoftDelete = async(product)=>{
    try{
      const response = await axios.put(
        `http://localhost:3000/admin/softdeleteproduct/${product._id}`, 
        { isDeleted: !product.isDeleted },
        { withCredentials: true }
      );
        // Update the local state
      const updatedProduct = allProducts.map(prod => 
        prod._id === product._id 
          ? { ...prod, isDeleted: !prod.isDeleted } 
          : prod
      );

      setAllProducts(updatedProduct);
      setProducts(updatedProduct);

    }catch(error){
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  }

  //Edit
  
  const handleEdit = (product)=>{
    setSelectedProduct(product)
    setEditTab(true);
        
  }



  const calculateTotalStock = (variants) => {
    return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
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

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const pageCount = Math.ceil(products.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const currentOrders = products.slice(startIndex, startIndex + ordersPerPage);


  const renderContent = () => {
    if (addTab) {
      return (
        <AddProduct 
          onSave={(newProduct)=>{
            if(newProduct){
              setProducts(prev => [...prev,newProduct])
            }
            setAddTab(false)
          }} 
          onCancel={()=>setAddTab(false)}
          onUpdateSuccess={fetchProducts}
        />
      );
    }



    if (editTab) {
      return (
        <EditProduct 
          product={selectedProduct} 
          onCancel={()=>setEditTab(false)}
          onUpdateSuccess={fetchProducts}
        />
      );
    }
  
      return (
        <>
      <div className="product-dashboard">
      <div className="product-dashboard-header">
        <div className="product-header-left">
          <h1>Products</h1>
          <div className="product-breadcrumb">
            <span className="dashboard-link">Dashboard</span>
            <span className="separator">/</span>
            <span>Customers List</span>
          </div>
        </div>
        <div className="product-header-actions">
          <button className="btn btn-primary"
          onClick={()=>setAddTab(true)}>
            <Plus size={16} className="mr-2" />
            Add New Product
          </button>
        </div>
      </div>

      <div className="product-search-bar">
        <div className="search-icon-wrapper">
          <Search size={16} className="search-icon" />
        </div>
        <input
          type="text"
          placeholder="Search Product..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <div className="product-filters-section">
        <div className="product-filter-tabs">
          {['All Products', 'In Stock', 'Out of Stock', "Deleted"].map((filter) => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterClick(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="product-filter-actions">
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

      <div className="product-customers-table">
        <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Type</th>
            <th>Brand</th>
            <th>Variants</th>
            <th>Stock Status</th>
            <th>Added</th>
            <th>Action</th>
          </tr>
        </thead>
          <tbody>
            {currentOrders.map((product) => (
              <tr key={product._id}>
                <td>
                  <div className="product-name">
                  {product.images[0] && (
                    <img src={product.images[0]} alt="" />
                     )}
                    <span>{product.name}</span>
                  </div>
                </td>

                <td>{product.category?.name}</td>
                <td>{product.type}</td>
                <td>{product.brand || 'N/A'}</td>
               
                <td>
                 <div className="variants-details">
                 {product.isDeleted ? (
                 <span className="text-primary">Product Archived</span>
                      ) : (
                   product.variants.map((variant, index) => (
                  <div key={index} className="variant-item mb-1">
                   <span className="font-semibold">Size: {variant.size}</span>
                    <span className="ml-2">Price: ${variant.price.toFixed(2)}</span>
                   <span className="ml-2 text-gray-600">Stock: {variant.stock}</span>
                    </div>
                     ))
                    )}
                  </div>
                  </td>

              <td>
              <span 
                  className={`status-badge ${
                       product.isDeleted 
                         ? "deleted" 
                         : (calculateTotalStock(product.variants) > 0 
                              ? "active" 
                              : "blocked")
                      }`}
               >
                  {product.isDeleted 
                         ? "N/A" 
                         : (calculateTotalStock(product.variants) > 0 
                             ? "Available" 
                             : "Out of Stock")
                      }
               </span>
              </td>

                <td>{format(new Date(product.createdAt), 'dd MMM yyyy')}</td>

                <td>
                  <div 
                    className="action-wrapper"
                    ref={(el) => actionMenuRefs.current[product._id] = el}
                  >
                    <div className="action-container">
                      <button 
                        className="action-menu-trigger"
                        onClick={() => toggleActionMenu(product._id)}
                      >
                        <MoreVertical size={20} />
                      </button>
                      {openActionMenuId === product._id && (
                        <div className="action-dropdown">
                          <button className="dropdown-item"
                          onClick={()=> handleEdit(product)}>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </button>
                    
                          <button 
                             className={`dropdown-item flex items-center ${product.isDeleted ? 'text-success' : 'text-danger'}`}
                             onClick={()=>handleSoftDelete(product)}
                                               >
                              {product.isDeleted ? (
                              <>
                               <RefreshCw size={16} className="mr-2" />
                               Restore
                                    </>
                                ) : (
                                <>
                             <Trash2 size={16} className="mr-2" />
                             Soft Delete
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
    </>
      );
   
    }

    return(

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
    )

          
 
};

export default Products;