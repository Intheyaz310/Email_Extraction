import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './button';
import { Home, Mail, Shield, LayoutGrid } from 'lucide-react';

export function FloatingNav() {
	const location = useLocation();
	const items = [
		{ to: '/', label: 'Home', icon: <Home size={18} /> },
		{ to: '/email-extraction', label: 'Extract', icon: <Mail size={18} /> },
		{ to: '/dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
		{ to: '/admin', label: 'Admin', icon: <Shield size={18} /> },
	];

	return (
		<div className="fixed bottom-4 right-4 z-[1000] flex gap-2 bg-white/80 backdrop-blur-md border border-black/10 rounded-full px-2 py-2 shadow-lg">
			{items.map((item) => (
				<Link key={item.to} to={item.to}>
					<Button size="sm" variant={location.pathname === item.to ? 'default' : 'ghost'} className="gap-2">
						{item.icon}
						<span className="hidden sm:inline">{item.label}</span>
					</Button>
				</Link>
			))}
		</div>
	);
}

export default FloatingNav;
