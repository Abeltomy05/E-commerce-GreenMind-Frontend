import React from 'react'

export function MetricCard({ title, value, subtitle, progress, color }) {
  return (
    <div className="metric-card">
      <div className="metric-info">
        <h3>{title}</h3>
        <h2>{value}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="metric-chart">
        <svg viewBox="0 0 36 36" className="circular-chart">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#eee"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${progress}, 100`}
          />
        </svg>
      </div>
    </div>
  )
}

