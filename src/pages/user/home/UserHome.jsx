import React,{useEffect, useState} from 'react'
import { SearchIcon } from 'lucide-react'
import { ShoppingBag, Truck, Phone } from 'lucide-react'
import HeaderLogin from '../../../components/header-login/header-login'
import Footer from '../../../components/footer/footer'
import "./UserHome.scss"
import home1 from "../../../assets/images/home 1.png"
import home2 from "../../../assets/images/home 2.png"
import home3 from "../../../assets/images/home 3.png"
import bannerImg from "../../../assets/images/banner-img.png"
import cato1 from "../../../assets/images/catogeries 1.png"
import cato2 from "../../../assets/images/catogery2.png"
import cato3 from "../../../assets/images/catogery 3.png"
import { useParams } from 'react-router-dom';
import axios from "axios";
import { useSelector } from 'react-redux'
import axioInstence from '../../../utils/axiosConfig'

export default function UserHome() {
  const userdetail = useSelector((state) => state.user.user);
  // console.log(userdetail)

  const [user,setUser] = useState()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [loading,setLoading] = useState(true)

  useEffect(() => {
    fetchUser();
  }, [])

  const fetchUser = async () => {
    try {
      setLoading(true);
      if (!userdetail?.id) {
        navigate('/user/login');
        return;
      }
      const response = await axioInstence.get(`/user/getuserdata/${userdetail.id}`);
      const fetchedUser = response.data;
      setError(null);
      setUser(fetchedUser);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', err);
    }finally {
      setLoading(false);
  }
  };



  return (
    <>
    <HeaderLogin />
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
      <div className="hero-content">
        <h1>Buy your dream plants</h1>
        <div className="metrics">
          <div className="metric">
            <span className="number">50+</span>
            <span className="label">Plant Species</span>
          </div>
          <div className="metric-divider">|</div>
          <div className="metric">
            <span className="number">100+</span>
            <span className="label">Customers</span>
          </div>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search plants..." />
          <SearchIcon className="search-icon" />
        </div>
      </div>
      <div className="hero-image">
        <div className="plant-container">
          <img src={bannerImg} alt="Featured plant" />
        </div>
      </div>
    </section>

      {/* Best Selling Section */}
      <section className="best-selling">
      <div className="section-header">
        <h2>Best Selling Plants</h2>
        <button className="see-more">See more →</button>
      </div>
      <div className="products-grid">
        <div className="product-card">
          <img src={home1} alt="Natural Plants" />
          <div className="product-info">
            <h3>Natural Plants</h3>
            <div className="price">₹ 1,400.00</div>
            <div className="reviews">★ 5.0 (3.2k)</div>
          </div>
        </div>
        <div className="product-card">
          <img src={home2} alt="Artificial Plants" />
          <div className="product-info">
            <h3>Artificial Plants</h3>
            <div className="price">₹ 900.00</div>
            <div className="reviews">★ 4.8 (1.2k)</div>
          </div>
        </div>
        <div className="product-card">
          <img src={home3} alt="Artificial Plants" />
          <div className="product-info">
            <h3>Artificial Plants</h3>
            <div className="price">₹ 1,200.00</div>
            <div className="reviews">★ 4.9 (2.3k)</div>
          </div>
        </div>
      </div>
    </section>

      {/* Categories Section */}
      <div className="cato-heading">
      <h2>Categories</h2>
      </div>
      
      <section className="categories">
      <div className="categories-grid">
        <div className="category-card" style={{ transform: 'rotate(-3deg)' }}>
          <img src={cato1} alt="Natural Plants" />
            <h3>Natural Plants</h3>
        </div>
        <div className="category-card featured">
          <img src={cato2} alt="Plant Accessories" />
          <div className="card-content">
            <h3>Plant Accessories</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>
        <div className="category-card" style={{ transform: 'rotate(3deg)' }}>
          <img src={cato3} alt="Artificial Plants" />
            <h3>Artificial Plants</h3>
        </div>
      </div>
      <button className="explore">
        Explore <span>→</span>
      </button>
    </section>

      {/* Banner Section */}
      <section className="banner">
        <h2>Grow Your World, One Pot at a Time!</h2>
      </section>

      {/* About Section */}
      <section className="about">
      <h2>About us</h2>
      <div className="about-grid">
        <div className="about-card">
          <div className="icon">
            <ShoppingBag size={24} />
          </div>
          <h3>Large Assortment</h3>
          <p>we offer many different types of products with fewer variations in each category.</p>
        </div>
        <div className="about-card">
          <div className="icon">
            <Truck size={24} />
          </div>
          <h3>Fast & Free Shipping</h3>
          <p>4-day or less delivery time, free shipping and an expedited delivery option.</p>
        </div>
        <div className="about-card">
          <div className="icon">
            <Phone size={24} />
          </div>
          <h3>24/7 Support</h3>
          <p>answers to any business related inquiry 24/7 and in real-time.</p>
        </div>
      </div>
    </section>
    </div>
        <Footer/>
    </>
  )
}

