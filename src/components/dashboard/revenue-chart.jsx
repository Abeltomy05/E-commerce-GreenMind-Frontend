import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-plugin-gradient';

Chart.register(...registerables);

export function RevenueChart() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

 
  const primaryColor = '#47645a';
  const lightPrimaryColor = '#6d8f83';
  const lighterPrimaryColor = '#90ada3';
  const paleColor = '#b4cbc2';

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [
          {
            label: 'Profit',
            data: [100, 80, 85, 70, 80, 50, 70, 90, 70],
            backgroundColor: primaryColor,
            borderRadius: 8,
            barThickness: 20,
            gradient: {
              backgroundColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                colorStops: [
                  { offset: 0, color: primaryColor },
                  { offset: 1, color: 'rgba(71, 100, 90, 0.5)' }
                ]
              }
            }
          },
          {
            label: 'Loss',
            data: [70, 60, 50, 45, 60, 40, 50, 60, 50],
            backgroundColor: lighterPrimaryColor,
            borderRadius: 8,
            barThickness: 20,
            gradient: {
              backgroundColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                colorStops: [
                  { offset: 0, color: lighterPrimaryColor },
                  { offset: 1, color: 'rgba(144, 173, 163, 0.5)' }
                ]
              }
            }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
              color: paleColor
            },
            ticks: {
              color: lightPrimaryColor,
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              display: false,
              color: paleColor
            },
            ticks: {
              color: lightPrimaryColor,
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: primaryColor,
              font: {
                size: 12
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(71, 100, 90, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="revenue-section">
      <div className="revenue-header">
        <div>
          <h3>Total Revenue</h3>
          <div className="revenue-amount">
            ₹50,23,780
            <span className="trend-up" style={{color: primaryColor}}>↑ 5% than last month</span>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}