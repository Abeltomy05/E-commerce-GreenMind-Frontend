import React from 'react'
import { Route, Routes } from 'react-router-dom';
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserRoute from './routes/userRoute';
import AdminRoute from './routes/adminRoute';
import NotFoundPage from './pages/shared/notfound';
import LandingHomePage from './pages/user/landingpages/landinghomepage';
import LandingShop from './pages/user/landingpages/landingshoppage';
import LandingProductView from './pages/user/landingpages/productdetailslanding';
import AboutContent from './pages/user/about/about';
import ContactPage from './pages/user/contact/contact';

function App() {
  return (
    <>
     <Routes>
      <Route path="/user/*" element={<UserRoute />} />
      <Route path="/admin/*" element={<AdminRoute />} />

      
      <Route path="/" element={<LandingHomePage />} />
      <Route path="/shop" element={<LandingShop />} />
      <Route path="/about" element={<AboutContent />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/product/:productId" element={<LandingProductView />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <ToastContainer 
     autoClose={3000}
     closeOnClick
    />
    </>
   
  )
}

export default App
