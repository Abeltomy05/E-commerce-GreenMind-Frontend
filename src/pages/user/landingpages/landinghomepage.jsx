import React,{useEffect, useState, useRef} from 'react'
import { SearchIcon, ShoppingBag, Truck, Phone, ChevronLeft, ChevronRight, Quote  } from 'lucide-react';
import { motion } from 'framer-motion';
import HeaderLogin from '../../../components/header-login/header-login'
import Footer from '../../../components/footer/footer'
import home1 from "../../../assets/images/home 1.png"
import home2 from "../../../assets/images/home 2.png"
import home3 from "../../../assets/images/home 3.png"
import bannerImg from "../../../assets/images/banner-img.png"
import { useParams,useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import axioInstence from '../../../utils/axiosConfig'
import SpinnerNormal from '../../../components/normalSpinner/normalspinner';
import axios from 'axios';

export default function LandingHomePage() {
  const userdetail = useSelector((state) => state.user.user);

  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isAnimationRunning, setIsAnimationRunning] = useState(true);
  const [currentReview, setCurrentReview] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [bestproducts, setBestproducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [user,setUser] = useState()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // const [loading,setLoading] = useState(true)

  const duplicatedProducts = [...bestproducts, ...bestproducts];
  const navigate = useNavigate()
  const INITIAL_CATEGORIES_COUNT = 3;

//   useEffect(() => {
//     fetchUser();
//   }, [])

//   const fetchUser = async () => {
//     try {
//       setLoading(true);
//       if (!userdetail?.id) {
//         navigate('/user/login');
//         return;
//       }
//       const response = await axioInstence.get(`/user/getuserdata/${userdetail.id}`);
//       const fetchedUser = response.data;
//       setError(null);
//       setUser(fetchedUser);
//     } catch (err) {
//       setError('Failed to fetch user data');
//       console.error('Error fetching user:', err);
//     }finally {
//       setLoading(false);
//   }
//   };

  //best sellers
  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response = await axios.get('https://backend.abeltomy.site/user/bestsellingproductslandingpage');
        setBestproducts(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load best selling products');
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  //categories
  useEffect(() => {
    const fetchCategoriesWithProducts = async () => {
      try {
        setLoading(true);
        const categoryResponse = await axios.get('https://backend.abeltomy.site/user/categoriesforhomelandingpage');
        const activeCategories = categoryResponse.data;
      
        const categoriesWithImages = await Promise.all(
          activeCategories.map(async (category) => {
            try {
              const productResponse = await axios.get(`https://backend.abeltomy.site/user/categoryimagelandingpage/${category._id}`);
              const { products, count } = productResponse.data;
              const firstProductImage = products && products.length > 0 && products[0].images.length > 0 
              ? products[0].images[0] 
              : '/api/placeholder/400/320';
              
              return {
                id: category._id,
                name: category.name,
                description: category.description,
                count: count || 0,
                image: firstProductImage
              };
            } catch (err) {
              console.error(`Error fetching products for category ${category.name}:`, err);
              return {
                id: category._id,
                name: category.name,
                description: category.description,
                count: 0,
                image: '/api/placeholder/400/320'
              };
            }
          })
        );

        setCategories(categoriesWithImages);
        setError(null);
      } catch (err) {
        setError('Failed to fetch categories');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesWithProducts();
  }, []);
//reviews
useEffect(() => {
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://backend.abeltomy.site/user/getreviewsforhomelandingpage');
      console.log('Raw review response:', response.data);

      if (response.data?.status === 'success' && Array.isArray(response.data.data)) {
        const formattedReviews = response.data.data.map(review => ({
          id: review.id,
          name: review.name || 'Anonymous',
          feedback: review.feedback || 'No feedback provided',
          rating: review.rating || 0,
          profileImage: review.profileImage || null,
          date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }) : 'Date not available'
        }));

        console.log('Formatted reviews:', formattedReviews);
        setReviews(formattedReviews);
      } else {
        console.log('No reviews found or invalid format');
        setReviews([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  fetchReviews();
}, []);
//offer
useEffect(() => {
  const fetchOffer = async () => {
    try {
      const response = await axios.get('https://backend.abeltomy.site/user/activeoffersforhomelandingpage');
      if (response.data.data) {
        setCurrentOffer(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching offer:', err);
    }
  };

  fetchOffer();
}, []);

const formatOfferText = (offer) => {
  if (!offer) return '';
  
  const discountText = offer.discountType === 'PERCENTAGE' 
    ? `${offer.discountValue}% OFF`
    : `₹${offer.discountValue} OFF`;
    
    let targetText = '';
    if (offer.applicableTo === 'product' && offer.target) {
      targetText = offer.target.title || offer.target.name || 'Selected Product';
    } else if (offer.applicableTo === 'category' && offer.target) {
      targetText = offer.target.name || 'Selected Category';
    } else {
      targetText = 'Selected Items';
    }
    
  const maxDiscountText = offer.maxDiscountAmount 
    ? ` (Max ₹${offer.maxDiscountAmount})`
    : '';

  return `${discountText} on ${targetText}${maxDiscountText}`;
};

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };


  const visibleCategories = showAllCategories 
  ? categories 
  : categories.slice(0, INITIAL_CATEGORIES_COUNT);
  const hasMoreCategories = categories.length > INITIAL_CATEGORIES_COUNT;


  const handleProductClick = (productId) => {
    setIsAnimationRunning(false);
    navigate(`/product/${productId}`)
  };

  const currentReviewData = reviews[currentReview] || {};

  if(loading){
  return (
    <>
      <HeaderLogin />
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerNormal />
      </div>
      <Footer />
    </>
  );
}
  return (
    <>
      <HeaderLogin />

      {currentOffer && (
      <div className="w-full bg-[#4a6163] text-white py-1 md:py-2">
        <div className="flex flex-col sm:flex-row items-center justify-center max-w-7xl mx-auto px-2 md:px-4 space-y-1 sm:space-y-0">
          <div className="animate-bounce mr-1 md:mr-2 text-lg md:text-xl lg:text-2xl">🎉</div>
          <div className="text-center flex flex-col sm:flex-row items-center gap-1 md:gap-2">
            <span className="font-semibold text-xs md:text-sm lg:text-base">{currentOffer.title}</span>
            <span className="hidden sm:inline text-xs md:text-sm">-</span>
            <span className="text-[10px] md:text-xs lg:text-sm">{formatOfferText(currentOffer)}</span>
            {currentOffer.endDate && (
              <span className="text-[10px] md:text-xs lg:text-sm mt-1 sm:mt-0 sm:ml-2 bg-white/20 px-1.5 md:px-2 py-0.5 rounded-full">
                Ends {new Date(currentOffer.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="animate-bounce ml-1 md:ml-2 text-lg md:text-xl lg:text-2xl">🎉</div>
        </div>
      </div>
    )}


       <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
        {/* Hero Section */}
        <section className="bg-[#4a6163] rounded-xl px-4 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10 my-3 md:my-4 lg:my-5 relative min-h-[140px] md:min-h-[160px] lg:min-h-[180px] flex flex-col md:flex-row justify-around items-center overflow-hidden">
          <div className="max-w-[300px] md:max-w-[400px] lg:max-w-[500px] relative z-10">
            <h1 className="text-black text-2xl md:text-3xl lg:text-[3.5rem] mb-3 md:mb-4 lg:mb-6 leading-tight md:leading-[65px] font-black">
              Buy your dream plants
            </h1>
            <div className="flex items-center text-black mb-3 md:mb-4 lg:mb-5 text-xs md:text-sm">
              <div className="flex gap-1">
                <span className="font-semibold">50+</span>
                <span className="text-black/80">Plant Species</span>
              </div>
              <div className="mx-2 md:mx-4 opacity-50">|</div>
              <div className="flex gap-1">
                <span className="font-semibold">100+</span>
                <span className="text-black/80">Customers</span>
              </div>
            </div>
            <button 
              className="bg-white hover:bg-gray-50 text-[#4a6163] font-semibold rounded-full py-2.5 md:py-3 px-6 md:px-8 text-sm md:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 group"
              onClick={() => navigate('/shop')}
            >
              Shop Now
              <svg 
                className="w-4 h-4 md:w-5 md:h-5 transform transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
          <div className="relative w-[200px] h-[200px] md:w-[250px] md:h-[250px] lg:w-[300px] lg:h-[300px] mt-4 md:mt-0">
            <div className="absolute -right-5 -top-10 w-full h-full bg-black rounded-full overflow-hidden mt-6 md:mt-8 lg:mt-10">
              <img
                src={bannerImg}
                alt="Featured plant"
                className="w-full h-full object-contain absolute bottom-0 left-[53%] -translate-x-1/2"
              />
            </div>
          </div>
        </section>

        {/* Best Selling Section */}
        <section className="py-6 md:py-8 lg:py-10 flex flex-col md:flex-row items-start gap-4 md:gap-6 lg:gap-8 overflow-hidden">
        <div className="w-full md:w-1/4">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mt-4 md:mt-6 lg:mt-10">
          Best Selling Plants
        </h2>
      </div>

      <div className="w-full md:w-3/4 relative overflow-hidden">
        <div 
          className={`flex gap-6 ${isAnimationRunning ? 'animate-carousel' : ''}`}
          style={{
            animation: isAnimationRunning ? 'scroll 10s linear infinite' : 'none',
          }}
        >
          {duplicatedProducts.map((product, index) => (
            <div 
              key={`${product._id}-${index}`}
              className="product-card flex-shrink-0 w-[calc(33.33%-1rem)] transition-transform hover:scale-105"
              onClick={() => handleProductClick(product._id)}
              role="button"
              tabIndex={0}
            >
              <img
                src={product.img}
                alt={product.title}
                className="w-full aspect-square object-contain bg-gray-50 rounded-lg mb-3 cursor-pointer"
              />
              <div className="text-left">
                <h3 className="text-base font-medium text-black mb-1 ml-4">
                  {product.title}
                </h3>
                <div className="text-sm font-medium text-black mb-1 ml-4">
                  ₹ {product.price.toFixed(2)}
                </div>
                <div className="text-[0.85rem] text-gray-600 ml-4">
                  <span className="text-[#ffd700]">★</span> {product.rating} ({product.reviews} sold)
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isAnimationRunning && (
          <button
            onClick={() => setIsAnimationRunning(true)}
            className="absolute bottom-4 right-4 bg-[#4a6163] text-white px-4 py-2 rounded-md hover:bg-[#3a4d4f] transition-colors"
          >
            Resume Slideshow
          </button>
        )}

        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-carousel {
            animation: scroll 20s linear infinite;
          }
          .animate-carousel:hover {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </section>

  {/* Categories Section */}
  <div className="text-black text-3xl md:text-4xl lg:text-5xl font-bold my-5 md:my-8 lg:my-[50px] text-center font-extrabold">
  <h2 className="text-grey-500 text-2xl md:text-2xl lg:text-3xl font-bold">Categories</h2>
      </div>
      <section className="py-8 md:py-12 lg:py-16 bg-[#4a6163] rounded-xl px-4 md:px-6 lg:px-8 my-8 md:my-12 lg:my-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleCategories.map((category) => (
          <div key={category.id} className="group relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-[#4a6163] opacity-40 group-hover:opacity-50 transition-opacity duration-300" />
            <img 
              src={category.image} 
              alt={category.name}
              className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-3xl font-semibold mb-2">{category.name}</h3>
              <p className="text-m opacity-90 mb-2">{category.count} Products</p>
              <button className="bg-white text-[#4a6163] px-6 py-2 rounded-full text-sm font-medium 
                transform translate-y-4 opacity-100 group-hover:translate-y-0 group-hover:opacity-100 
                transition-all duration-300"
                onClick={()=>{navigate('/shop')}}>
                Explore →
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {hasMoreCategories && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="bg-white text-[#4a6163] px-8 py-3 rounded-full text-sm font-medium 
              hover:bg-gray-50 transition-colors duration-200 shadow-md"
          >
            {showAllCategories ? 'Show Less ↑' : 'See More ↓'}
          </button>
        </div>
      )}
    </section>

        {/* Customer Reviews Section */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
        
        <div className="w-full mx-auto">
          <div className="relative bg-white shadow-lg rounded-lg overflow-hidden border border-[#4a6163]/20">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#4a6163]" />
            <div className="p-8">
              <svg
                className="absolute top-6 left-6 w-12 h-12 text-[#4a6163]/10"
                fill="currentColor"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <div className="relative z-10">
                <p className="text-lg text-gray-700 mb-8 italic pl-12">
                  "{currentReviewData.feedback || 'No feedback provided'}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {currentReviewData.profileImage ? (
                      <img
                        src={currentReviewData.profileImage}
                        alt={currentReviewData.name}
                        className="w-14 h-15 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#4a6163]/10 flex items-center justify-center">
                        <span className="text-[#4a6163] font-bold text-xl">
                          {currentReviewData.name ? currentReviewData.name.charAt(0) : '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-[#4a6163]">
                        {currentReviewData.name || 'Anonymous'}
                      </h3>
                        {/* <p className="text-sm text-gray-500">
                          {currentReviewData.date || 'Date not available'}
                        </p> */}
                      <span className="text-[#ffd700]">
                          {'★'.repeat(Math.min(5, currentReviewData.rating || 0))}
                        </span>
                    </div>
                  </div>
                  {reviews.length > 1 && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)}
                        className="p-2 rounded-full bg-[#4a6163] text-white transition-colors duration-200"
                        aria-label="Previous review"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
                        className="p-2 rounded-full bg-[#4a6163] text-white transition-colors duration-200"
                        aria-label="Next review"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
        {/* About Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Why Choose Us</h2>
        <p className="text-xl text-gray-600 text-center mb-5 max-w-2xl mx-auto">
          We're committed to providing you with the best shopping experience possible.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                <div className="w-20 h-20 bg-[#4a6163] rounded-full flex items-center justify-center mx-auto mb-6 
                  transform hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
      </div>
      <Footer />
    </>
  );
}
const features = [
  { icon: ShoppingBag, title: "Large Assortment", description: "We offer many different types of products with fewer variations in each category." },
  { icon: Truck, title: "Fast & Free Shipping", description: "4-day or less delivery time, free shipping and an expedited delivery option." },
  { icon: Phone, title: "24/7 Support", description: "Answers to any business related inquiry 24/7 and in real-time." }
];




