import React, { useState } from 'react';
import './addCategory.scss';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AdminBreadcrumbs from '../../breadcrumbs/breadcrumbs';
import api from '../../../utils/adminAxiosConfig';

const AddCategory = ({onUpdateSuccess,onCancel}) => {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
        toast.error('Category name is required');
        return;
      }

      setIsLoading(true);

    try{
        const payload = {
            name: categoryName.trim(),
            description: description.trim() || '', 
            isActive: true 
          };
        const response = await api.post('/admin/addcategorydata',payload);
        toast.success('Category created successfully');
        setCategoryName('');
        setDescription('');
        onUpdateSuccess();
     
        setTimeout(()=>{
            onCancel()
        },2000)
        
    }catch (error) {
        console.error('Category creation error:', error);
        toast.error(error.message || 'Failed to create category');  
     }finally {
        setIsLoading(false);
      }
  };

  if(isLoading){
    return <div>Adding data.....</div>
  }

  return (
    <div className="add-category">
        <div className="wrapper-head">
      <div className="breadcrumb">
      <AdminBreadcrumbs additionalCrumb="Add Category" />
      </div>
      <h2>Add New Category</h2>
      </div>

      <div className="form-card">
        <h2>General Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="categoryName">Category Name</label>
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Type category name here..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type category description here..."
            />
          </div>
          <div className="button-group">
            <button type="submit" className="btn-submit">Submit</button>
            <button type="button" className="btn-cancel" onClick={() => window.history.back()}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;

