import React,{useState,useEffect} from 'react';
import { TrendingUp, Tag, Building } from 'lucide-react';
import axios from 'axios';


const TopItemsSection = () => {
    const [topItems, setTopItems] = useState({
        topProducts: [],
        topCategories: [],
        topBrands: []
      });
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      useEffect(() => {
        const fetchTopItems = async () => {
          try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/admin/bestsellingitems');
            console.log('Response data:', response.data);
            setTopItems(response.data);
          } catch (err) {
            console.error('Error fetching top items:', err);
            setError('Failed to load data');
          } finally {
            setLoading(false);
          }
        };
    
        fetchTopItems();
      }, []);
    

  const formatIndianRupee = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  const TopItemCard = ({ title, items, icon: Icon }) => (
    <div className="col-span-12 lg:col-span-4 bg-white p-4 rounded-md shadow">
      <div className="flex items-center mb-4">
        <Icon className="h-6 w-6 text-[#47645a] mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#47645a]" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No data available
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.name} className="relative">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-5 rounded-full bg-[#9bac9c] text-white flex items-center justify-center text-sm mr-2">
                    {index + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count} units
                      </span>
                    </div>
                    {/* <div className="text-sm text-[#47645a] font-medium">
                      {formatIndianRupee(item.amount)}
                    </div> */}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#47645a] h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(item.count / Math.max(...items.map(i => i.count))) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))
          )}
          {items.length > 0 && items.length < 5 && (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5 - items.length)].map((_, index) => (
                <div 
                  key={`empty-${index}`} 
                  className="h-16 bg-gray-50 rounded-md border border-dashed border-gray-200"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-6 mb-6">
      <TopItemCard 
        title="Top Selling Products" 
        items={topItems.topProducts} 
        icon={TrendingUp}
      />
      <TopItemCard 
        title="Top Categories" 
        items={topItems.topCategories} 
        icon={Tag}
      />
      <TopItemCard 
        title="Top Brands" 
        items={topItems.topBrands} 
        icon={Building}
      />
    </div>
  );
};
export default TopItemsSection;