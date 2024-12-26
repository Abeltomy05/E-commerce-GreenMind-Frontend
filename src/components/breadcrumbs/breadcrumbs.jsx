import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const AdminBreadcrumbs = ({ additionalCrumb, onNavigate }) => {
  const location = useLocation();
  
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(path => path);
    let breadcrumbs = [];
    let currentPath = '';

    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      if (path === 'admin') return;
      const displayName = path.charAt(0).toUpperCase() + path.slice(1);
      breadcrumbs.push({
        path: currentPath,
        label: displayName
      });
    });

    // Add the additional crumb if provided
    if (additionalCrumb) {
      breadcrumbs.push({
        path: `${currentPath}/${additionalCrumb.toLowerCase()}`,
        label: additionalCrumb,
        isVirtual: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (location.pathname === '/admin/login') return null;

  const handleClick = (breadcrumb) => {
    if (onNavigate && breadcrumb.label === 'Products') {
      onNavigate();
      return;
    }
  };

  return (
    <div className="flex items-center text-sm">
      <Link
        to="/admin/dashboard"
        className="text-[#272525] flex items-center"
      >
        <Home className="h-4 w-4" />
        <span className="ml-1">Dashboard</span>
      </Link>

      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center">
          <span className="mx-1 text-[#272525]">/</span>
          {index === breadcrumbs.length - 1 || breadcrumb.isVirtual ? (
            <span className="text-[#272525]">
              {breadcrumb.label}
            </span>
          ) : (
            <button
              onClick={() => handleClick(breadcrumb)}
              className="text-[#272525] hover:underline bg-transparent border-none p-0"
            >
              {breadcrumb.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminBreadcrumbs;