import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from './button';

export default function TopRightMenu() {
	const [open, setOpen] = React.useState(false);
	return (
		<div className="fixed top-4 right-4 z-[1000]">
			<div className="relative">
				<Button size="icon" variant="ghost" onClick={() => setOpen((o) => !o)} aria-label="Open navigation">
					<Menu />
				</Button>
				{open && (
					<div className="absolute right-0 mt-2 w-40 bg-white/90 backdrop-blur-md border border-black/10 rounded-md shadow-lg p-2">
						<Link to="/" className="block px-3 py-2 rounded hover:bg-black/5" onClick={() => setOpen(false)}>Home</Link>
						<Link to="/email-extraction" className="block px-3 py-2 rounded hover:bg-black/5" onClick={() => setOpen(false)}>Extract</Link>
						<Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-black/5" onClick={() => setOpen(false)}>Dashboard</Link>
						<Link to="/admin" className="block px-3 py-2 rounded hover:bg-black/5" onClick={() => setOpen(false)}>Admin</Link>
					</div>
				)}
			</div>
		</div>
	);
}
