import React from 'react'
import PropTypes from 'prop-types'

const MostSold = ({ items }) => {
  return (
    <div className="most-sold">
      <h3>Most Sold Items</h3>
      <div className="items">
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`} className="item">
            <div className="item-header">
              <span className="name">{item.name}</span>
              <span className="percentage">{item.percentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

MostSold.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired
    })
  ).isRequired
}

MostSold.defaultProps = {
  items: [
    { name: 'Natural Plants', percentage: 70 },
    { name: 'Artificial Plants', percentage: 40 },
    { name: 'Plant Accessories', percentage: 60 }
  ]
}

export default MostSold