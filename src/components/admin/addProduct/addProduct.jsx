import { Cloudinary } from 'cloudinary-core';
import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import { Plus, Trash,Upload,X } from 'lucide-react';
import { toast } from 'react-toastify';
import './addProduct.scss';
import uploadImageToCloudinary from '../../../services/cloudinaryService';

export default function AddProduct({ onSave, onUpdateSuccess, onCancel }) {
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    type: '',
    brand: '',
    description: '',
    images: [null, null, null],
    variants: [{ size: 'S', price: 0, stock: 0 }]
  });

  const [cropState, setCropState] = useState({
    currentImageIndex: null,
    imageToCrop: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null
  });

  const [categories, setCategories] = useState([]);

  const productTypes = ['Indoor', 'Outdoor', 'Hanging', 'Desktop'];
  const sizes = ['S', 'M', 'L'];

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCropState(prev => ({
      ...prev,
      croppedAreaPixels
    }));
  }, []);

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.src = url;
  });

  const handleCropConfirm = async () => {
    if (cropState.croppedAreaPixels) {
      try {
        const croppedImageUrl = await getCroppedImg(
          cropState.imageToCrop,
          cropState.croppedAreaPixels
        );

        const updatedImages = [...productData.images];
        updatedImages[cropState.currentImageIndex] = croppedImageUrl;
        
        setProductData(prev => ({
          ...prev,
          images: updatedImages
        }));

        setCropState({
          currentImageIndex: null,
          imageToCrop: null,
          crop: { x: 0, y: 0 },
          zoom: 1,
          croppedAreaPixels: null
        });
      } catch (error) {
        toast.error('Cropping failed');
        console.error(error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/categorydata-addproduct', {
          withCredentials: true
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };
  
    fetchCategories();
  }, []);

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropState(prev => ({
        ...prev,
        currentImageIndex: index,
        imageToCrop: reader.result,
        crop: { x: 0, y: 0 },
        zoom: 1
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const updatedImages = [...productData.images];
    updatedImages[index] = null;
    setProductData(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  const addVariant = () => {
    setProductData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: 'S', price: 0, stock: 0 }]
    }));
  };

  const removeVariant = (indexToRemove) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...productData.variants];
    updatedVariants[index][field] = field === 'price' || field === 'stock' 
      ? Number(value) 
      : value;
    
    setProductData(prev => ({
      ...prev,
      variants: updatedVariants
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = [];
      if (productData.images && productData.images.length > 0) {

        imageUrls = await uploadImageToCloudinary(productData.images);
      }
     
      const productPayload = {
        ...productData,
        images: imageUrls,
      };
      console.log("Payload being sent:", JSON.stringify(productPayload, null, 2));
      const result = await axios.post("http://localhost:3000/admin/addproduct", productPayload);
      console.log("Product added successfully!", result);
      toast.success('Product Added Successfully', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      onUpdateSuccess();
      onCancel()
      
    } catch (error) {
      toast.error('Error Adding product', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      console.error("Add Product Error:", error.response ? error.response.data : error);
    }
  };


  return (
    <div className="add-product-container">
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
         </div>

          <div className="form-group">
            <label>Product Type</label>
            <select
              name="type"
              value={productData.type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Type</option>
              {productTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={productData.brand}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="image-upload-section full-width">
  <h3>Product Images</h3>
  <div className="image-grid">
    {[0, 1, 2].map((index) => (
      <div key={index} className="image-upload-box">
        <input
          type="file"
          accept="image/*"
          id={`image-upload-${index}`}
          onChange={(e) => handleImageUpload(index, e)}
          className="image-input"
        />
        <label 
          htmlFor={`image-upload-${index}`} 
          className={`upload-label ${productData.images[index] ? 'has-image' : ''}`}
        >
          {productData.images[index] ? (
            <>
              <img 
                src={productData.images[index]} 
                alt={`Product Preview ${index + 1}`} 
                className="image-preview" 
              />
              <div className="hover-overlay">
                <span className="delete-text" onClick={() => removeImage(index)}>
                  Delete
                </span>
              </div>
            </>
          ) : (
            <div className="upload-content">
              <Upload size={32} />
              <span>Upload Image</span>
            </div>
          )}
        </label>
      </div>
    ))}
  </div>
</div>

{cropState.imageToCrop && (
        <div className="crop-modal">
          <div className="crop-container">
            <Cropper
              image={cropState.imageToCrop}
              crop={cropState.crop}
              zoom={cropState.zoom}
              aspect={1} // 1:1 aspect ratio, adjust as needed
              onCropChange={(crop) => setCropState(prev => ({ ...prev, crop }))}
              onCropComplete={onCropComplete}
              onZoomChange={(zoom) => setCropState(prev => ({ ...prev, zoom }))}
            />
            <div className="crop-controls">
              <input 
                type="range"
                value={cropState.zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setCropState(prev => ({ ...prev, zoom: Number(e.target.value) }))}
              />
              <div className="crop-actions">
                <button 
                  type="button" 
                  onClick={() => setCropState({
                    currentImageIndex: null,
                    imageToCrop: null,
                    crop: { x: 0, y: 0 },
                    zoom: 1,
                    croppedAreaPixels: null
                  })}
                >
                  <X /> Cancel
                </button>
                <button type="button" onClick={handleCropConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

<div className="variants-section full-width">
  <h3>
    Product Variants 
    <button
      type="button"
      className="add-variant-btn"
      onClick={addVariant}
    >
      <Plus size={16} /> Add Variant
    </button>
  </h3>

  {productData.variants.map((variant, index) => (
    <div key={index} className="variant-row">
      <div className="variant-input-group">
        <label>Size:</label>
        <select
          value={variant.size}
          onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
        >
          {sizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
      
      <div className="variant-input-group">
        <label>Price:</label>
        <input
          type="number"
          placeholder="Price"
          value={variant.price}
          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
          min="0"
          step="1"
        />
      </div>
      
      <div className="variant-input-group">
        <label>Stock:</label>
        <input
          type="number"
          placeholder="Stock"
          value={variant.stock}
          onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
          min="0"
        />
      </div>
      
      {productData.variants.length > 1 && (
        <button
          type="button"
          className="remove-variant-btn"
          onClick={() => removeVariant(index)}
        >
          <Trash size={16} />
        </button>
      )}
    </div>
  ))}
</div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Add Product
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}