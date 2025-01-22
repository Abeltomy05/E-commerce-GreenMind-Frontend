import React, { useState, useEffect, useCallback  } from 'react';
import axios from 'axios';
import {  toast } from 'react-toastify';
import Cropper from 'react-easy-crop';
import './editProduct.scss';
import AdminBreadcrumbs from '../../breadcrumbs/breadcrumbs';
import api from '../../../utils/adminAxiosConfig';


const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

  async function getCroppedImg(imageSrc, pixelCrop) {
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
  
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  }


const EditProduct = ({ product, onCancel, onUpdateSuccess}) => {

  const [categories, setCategories] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    brand: '',
    description: '',
    images: [],
    variants: [{ size: '', price: '', stock: '' }]
  });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [temporaryImage, setTemporaryImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/admin/categorydata-addproduct', {
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


  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category?._id || '',
        type: product.type || '',
        brand: product.brand || '',
        description: product.description || '',
        images: product.images || [],
        variants: product.variants?.length 
          ? product.variants.map(variant => ({
              size: variant.size,
              price: variant.price.toString(),
              stock: variant.stock.toString()
            }))
          : [{ size: '', price: '', stock: '' }]
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariantChange = (index, e) => {
    const { name, value } = e.target;
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [name]: value
    };
    setFormData(prev => ({
      ...prev,
      variants: newVariants
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: '', price: '', stock: '' }]
    }));
  };

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      variants: newVariants.length ? newVariants : [{ size: '', price: '', stock: '' }]
    }));
  };

  const handleImageSelect = async (e) => {
    if (e.target.files?.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setTemporaryImage(imageUrl);
      setCropModalOpen(true);
    }
  };

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(temporaryImage, croppedAreaPixels);
      const { data } = await axios.get('http://localhost:3000/admin/generate-upload-url');
      const { signature, timestamp, uploadPreset, apiKey, cloudName } = data;

      const formData = new FormData();
      formData.append('file', croppedBlob);
      formData.append('upload_preset', uploadPreset);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('api_key', apiKey);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      setFormData(prev => {
        const newImages = [...prev.images];
        if (selectedImageIndex !== null && selectedImageIndex < 4) {
          newImages[selectedImageIndex] = response.data.secure_url;
        } else if (newImages.length < 4) {
          newImages.push(response.data.secure_url);
        }
        return {
          ...prev,
          images: newImages
        };
      });

      // Clean up
      setCropModalOpen(false);
      setTemporaryImage(null);
      setSelectedImageIndex(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (error) {
      toast.error('Failed to upload cropped image');
      console.error('Crop/upload error:', error);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
  
    try {
      const { data } = await axios.get('http://localhost:3000/admin/generate-upload-url');
      const { signature, timestamp, uploadPreset, apiKey, cloudName } = data;
  
      const imageUrls = await Promise.all(files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('api_key', apiKey);
  
        try {
          const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
          );
          return response.data.secure_url;
        } catch (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          console.error('Image upload error:', uploadError);
          return null;
        }
      }));
  
      const validImageUrls = imageUrls.filter(url => url !== null);
  
      setFormData(prev => {
        const newImages = [...prev.images];
        
        // Replace image at the selected index or add if less than 4
        if (selectedImageIndex !== null && selectedImageIndex < 4) {
          newImages[selectedImageIndex] = validImageUrls[0];
        } else if (newImages.length < 4) {
          newImages.push(validImageUrls[0]);
        }
  
        return {
          ...prev,
          images: newImages
        };
      });
  
      setSelectedImageIndex(null);
    } catch (error) {
      toast.error('Failed to generate upload URL');
      console.error('Upload URL generation error:', error);
    }
  };

  const removeImage = (indexToRemove) => {
    setFormData(prev => {
        const newImages = prev.images.filter((_, index) => index !== indexToRemove);
        if (newImages.length < 4) {
            while (newImages.length < 4) {
                newImages.push(null);
              }
            }
            return {
                ...prev,
                images: newImages
              };
            });
          };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        variants: formData.variants.map(variant => ({
          size: variant.size,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock)
        }))
      };

      const response = await api.put(`/admin/editproduct/${product._id}`, payload);
      console.log('Product updated successfully', response.data);
      toast.success('Product updated successfully', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      onUpdateSuccess();
      setTimeout(() => {
        onCancel();
      }, 1000);

    } catch (error) {
        toast.error('Error updating product', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
      console.error('Error updating product:', error.response ? error.response.data : error);
    }
  };

 return (
    <div className="edit-product-container">
      <form onSubmit={handleSubmit} className="edit-product-form">
       <div className="wrapper-head">
          <div className="breadcrumb">
          <AdminBreadcrumbs additionalCrumb="Edit Product" />
         </div>
         <h2 className="form-title">Edit Product</h2>
      </div>
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
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
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Hanging">Hanging</option>
            <option value="Desktop">Desktop</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="brand">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
      <label>Images</label>
      <div className="image-preview">
        {[0, 1, 2].map((index) => (
          <div key={index} className="image-item">
            {formData.images[index] ? (
              <>
                <img src={formData.images[index]} alt={`Product ${index + 1}`} />
                <div className="image-actions">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    id={`image-upload-input-${index}`}
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      document.getElementById(`image-upload-input-${index}`).click();
                      setSelectedImageIndex(index);
                    }}
                    className="replace-image-btn"
                  >
                    Replace
                  </button>
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    className="remove-image-btn"
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <div className="image-upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  id={`image-upload-input-${index}`}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    document.getElementById(`image-upload-input-${index}`).click();
                    setSelectedImageIndex(index);
                  }}
                  className="add-image-btn"
                >
                  Upload Image
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {cropModalOpen && (
        <div className="crop-modal">
          <div className="crop-container">
            <Cropper
              image={temporaryImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="crop-controls">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
            <div className="crop-buttons">
              <button 
                type="button" 
                onClick={() => {
                  setCropModalOpen(false);
                  setTemporaryImage(null);
                }}
                className="cancel-crop-btn"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleCropConfirm}
                className="confirm-crop-btn"
              >
                Confirm Crop
              </button>
            </div>
          </div>
        </div>
      )}
      </div>


        <div className="variants-section">
          <h3>Product Variants</h3>
          {formData.variants.map((variant, index) => (
            <div key={index} className="variant-group">
              <div className="variant-inputs">
                <input
                  type="text"
                  name="size"
                  placeholder="Size"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, e)}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(e) => handleVariantChange(index, e)}
                  required
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(index, e)}
                  required
                  min="0"
                />
                {formData.variants.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeVariant(index)}
                    className="remove-variant-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button 
            type="button" 
            onClick={addVariant}
            className="add-variant-btn"
          >
            Add Variant
          </button>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
          >
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;