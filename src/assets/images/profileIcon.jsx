import React from 'react';

const ProfileIcon = ({ name, size = 40, fontSize = 16 }) => {
  // Extract initials
  const getInitials = (name) => {
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0).toUpperCase()).join('');
    return initials.slice(0, 2);
  };

  // Generate a consistent color based on name
  const generateColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#1abc9c', // Turquoise
      '#2ecc71', // Emerald Green
      '#3498db', // Blue
      '#9b59b6', // Amethyst Purple
      '#34495e', // Dark Blue Gray
      '#16a085', // Green Sea
      '#27ae60', // Nephritis Green
      '#2980b9', // Belize Hole Blue
      '#8e44ad', // Wisteria Purple
      '#2c3e50'  // Midnight Blue
    ];

    const colorIndex = Math.abs(hash % colors.length);
    return colors[colorIndex];
  };

  const initials = getInitials(name);
  const backgroundColor = generateColor(name);

  return (
    <div 
      style={{
        width: `${size}px`, 
        height: `${size}px`, 
        borderRadius: '50%', 
        backgroundColor, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: 'white', 
        fontWeight: 'bold',
        fontSize: `${fontSize}px`
      }}
    >
      {initials}
    </div>
  );
};

export default ProfileIcon;