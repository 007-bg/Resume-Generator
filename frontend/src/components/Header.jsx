import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser, logout } from '../store/slices/authSlice';

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // eslint-disable-next-line no-unused-vars
    const user = useSelector(selectUser);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navLinkClass = (path, exact = true) => {
        const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
        return `flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
            ? 'bg-secondary text-secondary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`;
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-7xl mx-auto items-center justify-between px-4 sm:px-8">
                <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground hover:opacity-90 transition-opacity">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon icon="mdi:file-document" width="18" />
                    </div>
                    <span>Resume Agent</span>
                </Link>

                <nav className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                                <Icon icon="mdi:view-dashboard" width="16" />
                                <span className="hidden sm:inline">Resumes</span>
                            </Link>
                            <Link to="/applications" className={navLinkClass('/applications')}>
                                <Icon icon="mdi:clipboard-text" width="16" />
                                <span className="hidden sm:inline">Applications</span>
                            </Link>
                            <Link to="/jobs" className={navLinkClass('/jobs', false)}>
                                <Icon icon="mdi:briefcase" width="16" />
                                <span className="hidden sm:inline">Jobs</span>
                            </Link>
                            <Link to="/profile/setup" className={navLinkClass('/profile', false)}>
                                <Icon icon="mdi:account" width="16" />
                                <span className="hidden sm:inline">Profile</span>
                            </Link>
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors bg-transparent border-none cursor-pointer"
                                onClick={handleLogout}
                            >
                                <Icon icon="mdi:logout" width="16" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={navLinkClass('/login')}>
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-primary h-9 px-4 py-2 ml-2"
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
