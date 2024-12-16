import { Route, Routes } from 'react-router-dom';
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserRoute from './routes/userRoute';
import AdminRoute from './routes/adminRoute';
import NotFoundPage from './pages/notfound/notfound';

function App() {
 

  return (
    <>
     <Routes>
      <Route path="/user/*" element={<UserRoute />} />
      <Route path="/admin/*" element={<AdminRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <ToastContainer />
    </>
   
  )
}

export default App
