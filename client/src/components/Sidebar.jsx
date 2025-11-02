import React, { useState } from 'react';
import { Menu, X, Home, LogIn, UserPlus, Shield, Bell, LogOut, HandCoins } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { state, dispatch } = useAuthContext();
    const { isAuthenticated, user } = state;
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        setIsOpen(false);
        navigate('/');
    };

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        ...(isAuthenticated
            ? []
            : [
                { icon: UserPlus, label: 'Candidate Register', href: '/candidate-auth?mode=signup' },
                { icon: LogIn, label: 'Candidate Login', href: '/candidate-auth?mode=login' },
                { icon: Shield, label: 'Admin Login', href: '/admin-auth' }
            ]),
        { icon: Bell, label: 'Announcements', href: '/#announcements' },
        { icon: HandCoins, label: 'My Fines', href: '/my-fines' }
    
    ];

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="fixed cursor-pointer top-4 left-4 z-50 p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div
                className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="pt-20 px-6 h-full flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">OPAC</h2>

                    {isAuthenticated && (
                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 px-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>


                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            <p className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                                {user?.role === 'ISSUER' ? 'Issuer' : user?.role}
                            </p>
                        </div>
                    )}

                    <nav className="space-y-2 flex-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center cursor-pointer gap-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition font-medium mt-auto"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;