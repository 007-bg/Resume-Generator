import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logout } from '../store/slices/authSlice';

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const user = useSelector(selectUser);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navLinkClass = (path, exact = true) => {
        const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
        return `flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded transition-all duration-150 ${isActive
            ? 'text-white bg-navy'
            : 'text-sky hover:text-white hover:bg-navy/50'
            }`;
    };

    return (
        <header className="bg-navy-dark border-b border-sky/20 px-6 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-coral">
                    <div className="w-8 h-8 bg-coral rounded flex items-center justify-center">
                        <Icon icon="mdi:file-document" width="18" className="text-white" />
                    </div>
                    Resume Agent
                </Link>

                <nav className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                                <Icon icon="mdi:view-dashboard" width="16" />
                                Resumes
                            </Link>
                            <Link to="/applications" className={navLinkClass('/applications')}>
                                <Icon icon="mdi:clipboard-text" width="16" />
                                Applications
                            </Link>
                            <Link to="/jobs" className={navLinkClass('/jobs', false)}>
                                <Icon icon="mdi:briefcase" width="16" />
                                Jobs
                            </Link>
                            <Link to="/profile/setup" className={navLinkClass('/profile', false)}>
                                <Icon icon="mdi:account" width="16" />
                                Profile
                            </Link>
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-sky hover:text-white hover:bg-navy/50 rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
                                onClick={handleLogout}
                            >
                                <Icon icon="mdi:logout" width="16" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={navLinkClass('/login')}>
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-primary px-4 py-1.5"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
