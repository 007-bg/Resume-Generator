import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Briefcase, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <FileText size={18} color="white" />
                    </div>
                    Resume Critique Agent
                </Link>

                <nav className="nav-links">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                            >
                                <LayoutDashboard size={16} style={{ marginRight: 6 }} />
                                Dashboard
                            </Link>
                            <Link
                                to="/jobs"
                                className={`nav-link ${location.pathname.startsWith('/jobs') ? 'active' : ''}`}
                            >
                                <Briefcase size={16} style={{ marginRight: 6 }} />
                                Jobs
                            </Link>
                            <Link
                                to="/profile/setup"
                                className={`nav-link ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
                            >
                                <User size={16} style={{ marginRight: 6 }} />
                                Profile
                            </Link>
                            <button className="nav-link" onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                <LogOut size={16} style={{ marginRight: 6 }} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-primary"
                                style={{ padding: '6px 16px' }}
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
