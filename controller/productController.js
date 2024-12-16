const express =require("express")
const Product = require("../model/productModel")

const getProductData = async(req,res)=>{
    try{
        const products = await Product.find().populate('category', 'name');
        if (!products || products.length === 0) {
          return res.status(404).json({ 
              error: "No products found" 
          });
      }

        return res.status(200).json(products);
    }catch(err){
         console.error('Detailed Product Fetch Error:', err);
        return res.status(500).json({ 
            error: "Failed to fetch products", 
            details: err.message,
            stack: err.stack
        });
    }
}

const addProduct = async(req,res)=>{
    try{
      console.log('Received request body:', JSON.stringify(req.body, null, 2));
        const { 
            name, 
            category, 
            type, 
            brand, 
            description, 
            variants,
            images
          } = req.body;
         
          if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                message: 'At least one variant is required',
                receivedVariants: variants
            });
        }

          const processedVariants = variants.map(variant => ({
            size: variant.size,
            price: parseFloat(variant.price),
            stock: parseInt(variant.stock)
        })); 
      console.log("before upload")

      const newProduct = await Product.create({
        name,
        category,
        type,
        brand: brand || undefined,
        description: description || null,
        images: images || [],
        variants: processedVariants
      });
      await newProduct.save()
      console.log("Product saved successfully:", newProduct);
      res.status(201).json({
        message: 'Product added successfully',
        product: newProduct
      });


      
    }catch(error){

       if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
        return res.status(409).json({
          message: 'A product with similar details already exists'
        });
      }

      res.status(500).json({
        message: 'Failed to add product',
        error: error.message
      });
    }
}

const softDeleteProduct = async(req,res)=>{
  try{
    const productId = req.params.id;
    const { isDeleted } = req.body;
       
    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
        { isDeleted }, 
        { new: true }
      );
    res.status(200).json(updatedProduct);  

}catch(error){
    res.status(500).json({ message: "Error deleting product" });
}
}

const editProduct = async(req,res)=>{
  try{
    const { id } = req.params;
    const updateData = req.body;
  
    if (!id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
  
    const updateObject = {
      name: updateData.name,
      category: updateData.category,
      type: updateData.type || existingProduct.type,
      brand: updateData.brand || existingProduct.brand,
      description: updateData.description || existingProduct.description,
      images: updateData.images || existingProduct.images,
      variants: updateData.variants.map(variant => ({
        size: variant.size,
        price: variant.price,
        stock: variant.stock
      })),
      
      updatedAt: new Date()
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id, 
      updateObject, 
      { 
        new: true,  
        runValidators: true  
      }
    );

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
    
    if (!updatedProduct) {
      return res.status(500).json({ message: 'Failed to update product' });
    }

  }catch(error){
    res.status(500).json({ message: "Error updating product" });
  }
  

}


module.exports = {
    getProductData,
    addProduct,
    softDeleteProduct,
    editProduct
}