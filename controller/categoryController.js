const express =require("express")
const Product = require("../model/productModel")
const Category = require("../model/categoryModel")

const categoryData = async(req,res)=>{
    try{
       const data = await Category.find();
       res.status(200).json(data)
    }catch(error){
        console.error('Category Fetch Error:', err);
        return res.status(500).json({ 
            error: "Failed to fetch category", 
            details: err.message 
        });
    }
}


const addCategoryData = async(req,res)=>{
    try{
        const { name, description, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ 
              message: 'Category name is required' 
            });
          }

          const existingCategory = await Category.findOne({ 
            name: name.trim() 
          });
          
          if (existingCategory) {
            return res.status(409).json({ 
              message: 'A category with this name already exists' 
            });
          }

          const newCategory = new Category({
            name: name.trim(),
            description: description ? description.trim() : '',
            isActive: isActive !== undefined ? isActive : true
          });

          const savedCategory = await newCategory.save();

          res.status(201).json({
            message: 'Category created successfully',
            category: savedCategory
          });

    }catch(error){
        console.error('Category creation error:', error);
        res.status(500).json({ 
          message: 'Error creating category', 
          error: error.message 
        });
    }
}

const categoryStatus = async(req,res)=>{
    try{
        const { id } = req.params;
        const { isActive } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id, 
            { isActive: isActive },
            { new: true } 
          );
          if (!updatedCategory) {
            return res.status(404).json({ 
              message: 'Category not found' 
            });
          }

          res.status(200).json(updatedCategory);

          

    }catch(error){
        console.error('Error updating category status:', error);
        res.status(500).json({ 
          message: 'Server error', 
          error: error.message 
        });
    }
}

const categoryEdit = async(req,res)=>{
   try{
    const { id } = req.params;
    const { name, description } = req.body;


    if (!name || name.trim() === '') {
      return res.status(400).json({
        message: 'Category name is required'
      });
    }

    const existingCategory = await Category.findOne({ 
        name: name, 
        _id: { $ne: id } 
      });
  
      if (existingCategory) {
        return res.status(409).json({
          message: 'A category with this name already exists'
        });
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id, 
        {
          name: name.trim(),
          description: description ? description.trim() : '',
          updatedAt: new Date()
        }, 
        { 
          new: true,  
          runValidators: true  
        }
      );

      if (!updatedCategory) {
        return res.status(404).json({
          message: 'Category not found'
        });
      }

      res.status(200).json(updatedCategory);


   }catch(error){
    console.error('Error updating category:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

 
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
   }
}

const categoryDataForAddProduct = async(req,res)=>{
    try{
        const activeCategories = await Category.find({ 
            isActive: true 
          }, {
            _id: 1,
            name: 1,
          }).sort({ name: 1 });

          if (activeCategories.length === 0) {
            return res.status(404).json({
              message: 'No active categories found',
              categories: []
            });
          }
          res.status(200).json(activeCategories); 
    }catch(error){
        console.error('Error fetching active categories:', error);
        res.status(500).json({
          message: 'Server error',
          error: error.message
        });
    }
}
module.exports = {
    categoryData,
    addCategoryData,
    categoryStatus,
    categoryEdit,
    categoryDataForAddProduct
}