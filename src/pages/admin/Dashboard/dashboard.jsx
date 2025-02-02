import React, { useState, useEffect } from 'react';
import { CalendarIcon, ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TopItemsSection from './bestsellingitems';
import api from '../../../utils/adminAxiosConfig';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);




const AdminDashboard = () => {
  const [filterOption, setFilterOption] = useState('Last Month');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchSalesData(filterOption);
  }, [filterOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [salesData]);

  const fetchSalesData = async (filter) => {
    setLoading(true);
    setError(null);
    try {
      let startDate = new Date(), endDate = new Date();
      
      if (filter instanceof Date) {
        startDate = new Date(filter);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(filter);
        endDate.setHours(23, 59, 59, 999);
      } else {
        switch(filter) {
          case 'Today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'Last Week':
          case 'Last 7 Days':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'Last Month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        }
      }

      const response = await api.get('/admin/getorders', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isDeleted: false
        }
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      const transformedData = response.data
        .filter(order => 
          order && 
          order.products && 
          Array.isArray(order.products) && 
          order.products.length > 0 &&
          order.user &&
          order.paymentInfo
        )
        .map(order => ({
          orderId: order._id || 'N/A',
          date: new Date(order.createdAt || Date.now()),
          products: order.products
            .filter(p => p && p.product)
            .map(p => ({
              name: p.product?.name || 'Unknown Product',
              quantity: p.quantity || 0,
              variant: p.product?.variants?.find(v => v._id === p.variantId) || null,
              category: p.product?.category?.name || 'Uncategorized'
            })),
            userName: `${order.user?.firstname || ''} ${order.user?.lastname || ''}`.trim() || 'N/A',
          amount: order.totalPrice || 0,
          discount: order.discountAmount || 0,
          status: order.paymentInfo?.status || 'PENDING'
        }));

      setSalesData(transformedData);
    } catch (err) {
      setError('Failed to fetch sales data');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/category-sales');
      setCategoryData(response.data.categories);
    } catch (err) {
      setError('Failed to fetch category data');
      console.error('Error fetching category data:', err);
    } finally {
      setLoading(false);
    }
  };


  const formatIndianRupee = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const totalSales = salesData.length;
  const totalAmount = salesData.reduce((sum, sale) => sum + sale.amount, 0);
  const totalDiscount = salesData.reduce((sum, sale) => sum + sale.discount, 0);

  const processHourlyData = (data) => {
    const hourlyData = Array(24).fill(0);
    data.forEach(sale => {
      const hour = new Date(sale.date).getHours();
      hourlyData[hour] += sale.amount;
    });
    return hourlyData;
  };

   const chartData = () => {
    if (isCustomDate && filterOption instanceof Date) {
      const hourlyAmounts = processHourlyData(salesData);
      return {
        labels: Array.from({ length: 24 }, (_, i) => 
          i.toString().padStart(2, '0') + ':00'
        ),
        datasets: [{
          label: 'Hourly Sales',
          data: hourlyAmounts,
          borderColor: '#47645a',
          backgroundColor: '#9bac9c',
          tension: 0.1
        }]
      };
    }
    return {
      labels: salesData.map(sale => {
        const date = new Date(sale.date);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      }),
      datasets: [{
        label: 'Sales Amount',
        data: salesData.map(sale => sale.amount),
        borderColor: '#47645a',
        backgroundColor: '#9bac9c',
        tension: 0.1
      }]
    };
  };


  const chartOptions = () => {
    const baseOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => `Sales: $${context.raw.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `$${value}`
          }
        }
      }
    };

    if (isCustomDate && filterOption instanceof Date) {
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          x: {
            title: {
              display: true,
              text: 'Hour of Day'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      };
    }

    return {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    };
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsCustomDate(true);
    fetchSalesData(date);
    setShowFilterOptions(false);
  };

  const handleFilterOptionChange = (option) => {
    setFilterOption(option);
    setIsCustomDate(false);
    let newDate = new Date();
    
    switch(option) {
      case 'Today':
        break;
      case 'Last 7 Days':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'Last Month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    
    setSelectedDate(newDate);
    setShowFilterOptions(false);
    fetchSalesData(option);
  };

  const getFilterDisplayText = () => {
    if (isCustomDate) {
      return selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return filterOption;
  };
  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800';
      case 'ON THE ROAD':
        return 'bg-violet-100 text-violet-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPDFRupee = (amount) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  const handleExcelDownload = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // 1. Create Summary Sheet
    const summaryData = [
      ['Sales Report'],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [''],
      ['Summary Statistics'],
      [''],
      ['Total Orders', totalSales],
      ['Total Revenue', formatIndianRupee(totalAmount)],
      ['Total Discounts', formatIndianRupee(totalDiscount)],
      ['']
    ];
  
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
  
    // 2. Create Sales Details Sheet
    // First, prepare the data in the correct format
    const salesRows = salesData.map(sale => ({
      Date: new Date(sale.date).toLocaleDateString(),
      'Order ID': sale.orderId,
      Products: sale.products.map(p => `${p.name} (${p.quantity})`).join(', '),
      User: sale.userName,
      Amount: formatIndianRupee(sale.amount),
      Discount: formatIndianRupee(sale.discount),
      Status: sale.status
    }));
  
    // Convert the array of objects to worksheet
    const salesWS = XLSX.utils.json_to_sheet(salesRows);
    
    // Set column widths
    const salesColWidth = [
      { wch: 15 },  // Date
      { wch: 25 },  // Order ID
      { wch: 40 },  // Products
      { wch: 25 },  // User
      { wch: 15 },  // Amount
      { wch: 15 },  // Discount
      { wch: 15 }   // Status
    ];
    salesWS['!cols'] = salesColWidth;
  
    // Add the sales worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, salesWS, 'Sales Details');
  
    // Save the file
    try {
      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `sales_report_${date}.xlsx`);
      console.log("Excel file generated successfully");
    } catch (error) {
      console.error("Error generating Excel file:", error);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Sales Report', 15, 15);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 25);
    
    // Add summary statistics
    doc.text('Summary', 15, 35);
    doc.text(`Total Orders: ${totalSales}`, 15, 45);
    doc.text(`Total Revenue: ${formatPDFRupee(totalAmount)}`, 15, 55);
    doc.text(`Total Discounts: ${formatPDFRupee(totalDiscount)}`, 15, 65);
    
    // Add sales data table
    const tableColumns = [
      'Date', 'Order ID', 'Products', 'User', 'Amount', 'Discount', 'Status'
    ];
    
    const tableData = salesData.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      sale.orderId,
      sale.products.length > 1
        ? `${sale.products[0].name} (${sale.products[0].quantity}) +${sale.products.length - 1}`
        : `${sale.products[0].name} (${sale.products[0].quantity})`,
      sale.userName,
      formatPDFRupee(sale.amount),
      formatPDFRupee(sale.discount),
      sale.status
    ]);

    doc.autoTable({
      startY: 75,
      head: [tableColumns],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 100, 90] }
    });

    // Add chart as image
    const chartCanvas = document.querySelector('canvas');
    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL('image/png');
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addPage();
      doc.text('Sales Chart', 15, 15);
      doc.addImage(chartImage, 'PNG', 15, 25, pageWidth - 30, 100);
    }

    // Save the PDF
    doc.save(`sales_report_${new Date().toISOString().split('T')[0]}.pdf`);

  };

  const itemsPerPage = 4;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salesData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salesData.length / itemsPerPage);

 useEffect(() => {
    fetchSalesData(filterOption);
  }, [filterOption]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with filter options */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Sales Dashboard</h1>
        <div className="relative">
          <button
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className="bg-[#47645a] text-white px-4 py-2 rounded-md flex items-center hover:bg-[#3a5048] transition-colors"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            {getFilterDisplayText()}
            <ChevronDownIcon className="h-5 w-5 ml-2" />
          </button>
          {showFilterOptions && (
            <div className="absolute right-0 mt-2 w-auto bg-white rounded-md shadow-lg z-10 flex">
              <div className="p-2">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  inline
                />
              </div>
              <div className="w-48 py-1 border-l border-gray-200">
                {['Last 7 Days', 'Last Month'].map((option) => (
                  <button
                    key={option}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#9bac9c] hover:text-white transition-colors"
                    onClick={() => handleFilterOptionChange(option)}
                  >
                    {option}
                  </button>
                ))}
                <div className="border-t border-gray-100">
                  <button
                    className="block w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-[#9bac9c] hover:text-white transition-colors"
                    onClick={handleDownload}
                  >
                    <ArrowDownTrayIcon className="h-4 w-5 inline mr-1" />
                    Download Report (pdf)
                  </button>
                </div>
                <div className="border-t border-gray-100">
                  <button
                    className="block w-full text-left  py-2 text-sm text-gray-700 hover:bg-[#9bac9c] hover:text-white transition-colors"
                    onClick={handleExcelDownload}
                  >
                    <ArrowDownTrayIcon className="h-4 w-5 inline mr-1" />
                    Download Report (excel)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading sales data...</p>
        </div>
      )}
      {/* Metrics Cards */}
      {!loading  && (
        <>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#9bac9c] p-4 rounded-md shadow">
              <h2 className="text-lg font-semibold mb-2 text-white">Total Orders</h2>
              <p className="text-2xl font-bold text-white">{totalSales}</p>
            </div>
            <div className="bg-[#9bac9c] p-4 rounded-md shadow">
              <h2 className="text-lg font-semibold mb-2 text-white">Total Revenue</h2>
              <p className="text-2xl font-bold text-white">{formatIndianRupee(totalAmount)}</p>
            </div>
            <div className="bg-[#9bac9c] p-4 rounded-md shadow">
              <h2 className="text-lg font-semibold mb-2 text-white">Total Discounts</h2>
              <p className="text-2xl font-bold text-white">{formatIndianRupee(totalDiscount)}</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 mb-6">
                {/* Sales Graph */}
                <div className="col-span-12 lg:col-span-8 bg-white p-4 rounded-md shadow h-[420px]">
                <h2 className="text-lg font-semibold  text-gray-800">
                  {isCustomDate ? 'Sales of a day' : 'Sales of the selected Period'}
                </h2>
                <Line data={chartData()} options={chartOptions()} />
              </div>

                  {/* Category Breakdown */}
                  <div className="col-span-12 lg:col-span-4 bg-white p-4 rounded-md shadow h-[420px]">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  Category Distribution
                </h2>
                <div className="space-y-4 overflow-y-auto h-[calc(100%-3rem)]">
                  {categoryData.map(({ category, percentage, count }) => (
                    <div key={category} className="relative">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {category}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {percentage}% ({count} items)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-[#47645a] h-4 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {categoryData.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No category data available
                    </div>
                  )}
                </div>
              </div>
          </div>

      <TopItemsSection/>
  
      {/* Sales Table */}
      <div className="bg-white rounded-md shadow overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#9bac9c] text-white">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((sale) => (
                  <tr key={sale.orderId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.products.length > 1
                        ? `${sale.products[0].name} (${sale.products[0].quantity}) and ${sale.products.length - 1} more`
                        : `${sale.products[0].name} (${sale.products[0].quantity})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatIndianRupee(sale.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, salesData.length)}</span> of{' '}
                    <span className="font-medium">{salesData.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-[#47645a] border-[#47645a] text-white'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } ${number === 1 ? 'rounded-l-md' : ''} ${
                          number === totalPages ? 'rounded-r-md' : ''
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
          </div>
      </>
      )}
    </div>
  );
};

export default AdminDashboard;