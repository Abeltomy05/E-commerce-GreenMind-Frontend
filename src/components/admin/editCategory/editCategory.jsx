import React, { useState, useEffect } from 'react';
import './editCategory.scss';
import { toast } from 'react-toastify';
import axios from 'axios';
import api from '../../../utils/adminAxiosConfig';

export default function EditCategory({ category, onCancel, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {

      if (!formData.name.trim()) {
        toast.error('Category name is required');
        return;
      }


      const response = await api.put(
        `/admin/editcategory/${category._id}`, 
        {
          name: formData.name,
          description: formData.description
        },
        { 
          withCredentials: true 
        }
      );


      toast.success('Category updated successfully');
      
      if (onUpdateSuccess) {
        onUpdateSuccess(response.data);
      }
      setTimeout(()=>{
        onCancel();
      },1000)
      

    } catch (error) {
      console.error('Error updating category:', error);
      
      if (error.response) {
        toast.error(error.response.data.message || 'Failed to update category');
      } else if (error.request) {
        toast.error('No response from server');
      } else {
        toast.error('Error updating category');
      }
    }
  };

  


  return (
    <div className="edit-category">
      <nav className="breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <span className="separator">/</span>
        <a href="/categories">Categories</a>
        <span className="separator">/</span>
        <span className="current">Add Category</span>
      </nav>

      <div className="form-card">
        <h2>General Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Category Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Type category name here..."
           
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Type category description here..."
              rows={6}
            />
          </div>
          <div className="button-group">
            <button type="submit" className="btn-submit">
              Submit
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

