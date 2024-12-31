import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingCart } from 'lucide-react';
import HeaderLogin from '../../../components/header-login/header-login';
import Footer from '../../../components/footer/footer';
import axiosInstance from '../../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    try {
      const response = await axiosInstance.get('/user/wishlist');
      console.log('Wishlist Response:', response.data);
      setWishlistItems(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      toast.error('Failed to fetch wishlist items');
      setWishlistItems([]);
      setLoading(false);
    }
  };

  const handleAddToCart = async (product, variant) => {
    if (!product?._id || !variant) return;
    
    try {
      const response = await axiosInstance.post('/user/addtocart', {
        user: user.id,
        product: product._id,
        variant: {
          size: variant.size,
          price: variant.price
        },
        quantity: 1
      });
      if(response.status === 400 && response.data.cartLimitReached){
        toast.info('Cart limit reached');
      }
      if(response.status === 200 && response.data.itemExists){
        toast.info('Product is already in your cart');
      }
      if(response.status === 200 && !response.data.itemExists){
        toast.success('Added to cart');
      }
    
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    if (!productId) return;
    
    try {
      await axiosInstance.delete(`/user/remove-wishlist/${productId}`);
      fetchWishlistItems();
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <HeaderLogin />
     <div className="min-h-screen bg-[#778e85]">
         <div className="w-full max-w-7xl mx-auto p-6">
           <h1 className="text-2xl font-semibold mb-6 text-white">Wishlist</h1>
          
           <div className="bg-white rounded-lg shadow-sm">
             {!wishlistItems?.length ? (
               <div className="p-8 text-center">
                 <h2 className="text-xl font-medium text-gray-600">Your wishlist is empty</h2>
                 <p className="mt-2 text-gray-500">Add items to your wishlist to keep track of products you love</p>
               </div>
           ) : ( 
              <>
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 p-4 border-b text-sm font-large text-[#333]">
                  <div>Products</div>
                  <div>Price</div>
                  <div>Status</div>
                  <div>Action</div>
                  <div></div>
                </div>

                <div className="divide-y">
                  {wishlistItems.map((item) => {
                    if (!item?.product?.variants?.length) return null;
                    
                    const variant = item.product.variants[0];
                    const inStock = variant?.stock > 0;
                    
                    return (
                      <div key={item._id} className="grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 p-4 items-center hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 border rounded-lg overflow-hidden">
                            {item.product.images?.length > 0 && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <span className="font-medium text-[#333]">{item.product.name}</span>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm line-through text-gray-500">
                            ₹{((variant?.price || 0) * 1.2).toFixed(2)}
                          </span>
                          <span className="font-medium text-[#3d5e52]">
                            ₹{variant?.price || 0}
                          </span>
                        </div>

                        <div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            inStock ? 'bg-[#3d5e52]/10 text-[#3d5e52]' : 'bg-red-100 text-red-600'
                          }`}>
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <div>
                          <button
                            onClick={() => handleAddToCart(item.product, variant)}
                            disabled={!inStock}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${
                              inStock ? 'bg-[#375d51] hover:bg-[#1a2c25]' : 'bg-gray-300 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>

                        <div>
                          <button
                            onClick={() => handleRemoveFromWishlist(item.product._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="w-6 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;