import React, { useState,useEffect } from 'react'
import { MetricCard } from '../../../components/dashboard/metric-card'
import { RevenueChart } from '../../../components/dashboard/revenue-chart'
import  MostSold  from '../../../components/dashboard/most-sold'
import { OrdersTable } from '../../../components/dashboard/orders-table'
import axios from 'axios';
import { toast } from 'react-toastify';
import "./dashboard.scss"
import BasicBreadcrumbs from '../../../components/breadcrumbs/breadcrumbs'

export default function Dashboard() {

  const [metrics, setMetrics] = useState([
    {
      title: "Today's Sales",
      value: "₹0",
      subtitle: "Items sold today",
      progress: 0,
      color: "#4318FF"
    },
    {
      title: "Today's Revenue",
      value: "₹0",
      subtitle: "Profit made today",
      progress: 0,
      color: "#05CD99"
    },
    {
      title: "Users Count",
      value: "0",
      subtitle: "Total registered users",
      progress: 0,
      color: "#FFB547"
    }
  ]);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        // const salesResponse = await axios.get('http://localhost:3000/admin/today-sales');
        
 
        // const revenueResponse = await axios.get('http://localhost:3000/admin/today-revenue');
        

        const userCountResponse = await axios.get('http://localhost:3000/admin/user-count');

        // Update metrics state with fetched data
        setMetrics([
          {
            title: "Today's Sales",
            value: "sample data",
            subtitle: "sample data",
            progress: "sample data", // Assuming 100,000 is max for progress
            color: "#4318FF"
          },
          {
            title: "Today's Revenue",
            value: "sample data",
            subtitle: "sample data",
            progress: "sample data", // Assuming 50,000 is max for progress
            color: "#05CD99"
          },
          {
            title: "Users Count",
            value: userCountResponse.data.toLocaleString(),
            subtitle: "Total registered users",
            progress: Math.min((userCountResponse.data / 25000) * 100, 100), // Assuming 25,000 is max for progress
            color: "#FFB547"
          }
        ]);
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        toast.error("Failed to load dashboard metrics");
      }
    };

 
    fetchDashboardMetrics();

    const intervalId = setInterval(fetchDashboardMetrics, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, []);


  return (
    <div className="dashboard">
        <div className="metrics-container">
            {metrics.map((metric, index) => (
                <MetricCard 
                    key={index}
                    title={metric.title}
                    value={metric.value}
                    subtitle={metric.subtitle}
                    progress={metric.progress}
                    color={metric.color}
                />
            ))}
        </div>
        <div className="charts-container">
            <RevenueChart />
            <MostSold />
        </div>
        <div className="orders-container">
            <OrdersTable />
        </div>
        <BasicBreadcrumbs/>
    </div>
);


}


