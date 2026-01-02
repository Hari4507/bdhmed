import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Database, GitBranch, GitCompare, PlusCircle } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Input', icon: PlusCircle },
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/internals', label: 'BDH Internals', icon: GitBranch },
    { path: '/comparison', label: 'Transformer vs BDH', icon: GitCompare },
  ];

  return (
    <div className="flex h-screen bg-netflix-black text-netflix-light font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-netflix-dark border-r border-gray-800 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Database className="w-8 h-8 text-netflix-red" />
          <span>
            <span className="text-netflix-red">BDH</span>
            <span className="text-white">MED</span>
          </span>
        </h1>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                location.pathname === item.path
                  ? 'bg-netflix-red text-white'
                  : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        {children}
      </div>
    </div>
  );
};

export default Layout;
