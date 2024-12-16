const express = require("express")
const adminRoute = express.Router()
const {adminLogin,getUserData,deleteUser,editUser,isBlock,} = require("../controller/adminController")
const {getProductData,addProduct,softDeleteProduct,editProduct} = require("../controller/productController")
const {cloudinaryImgUpload} = require("../controller/cloudinaryController")
const {userCount} = require("../controller/dashboardController")
const {categoryData,addCategoryData,categoryStatus,categoryEdit,categoryDataForAddProduct} = require('../controller/categoryController')
const authMiddleware = require("../middleware/authMiddleware")

adminRoute.post('/login',adminLogin);
adminRoute.get('/data',getUserData);
adminRoute.delete('/delete/:id',deleteUser);
adminRoute.put('/edit/:id',editUser);
adminRoute.put('/block/:id',isBlock);
adminRoute.get('/productdata',getProductData);
adminRoute.post('/addproduct',addProduct);
adminRoute.put('/editproduct/:id',editProduct);
adminRoute.get('/generate-upload-url',cloudinaryImgUpload);
adminRoute.put('/softdeleteproduct/:id',softDeleteProduct);
adminRoute.get('/user-count',userCount);
adminRoute.get('/categorydata',categoryData);
adminRoute.post('/addcategorydata',addCategoryData);
adminRoute.put('/categorystatus/:id',categoryStatus);
adminRoute.put('/editcategory/:id',categoryEdit);
adminRoute.get('/categorydata-addproduct',categoryDataForAddProduct);


module.exports = adminRoute;