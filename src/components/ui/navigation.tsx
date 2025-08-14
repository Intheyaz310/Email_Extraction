import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { Home, Mail, Shield, BarChart3 } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/email-extraction', label: 'Email Extraction', icon: Mail },
    { path: '/admin', label: 'Admin', icon: Shield },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              EmailExtract
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`${
                        isActive 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
