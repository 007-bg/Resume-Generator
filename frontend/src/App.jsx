import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import JobDashboard from './components/JobDashboard';
import JobDetail from './components/JobDetail';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import OAuthCallback from './components/auth/OAuthCallback';
import ResumeDashboard from './components/ResumeDashboard';
import ProfileSetup from './components/ProfileSetup';
import ApplicationsDashboard from './components/ApplicationsDashboard';
import { selectIsAuthenticated, selectAuthLoading, fetchCurrentUser } from './store/slices/authSlice';

// Protected Route wrapper
function ProtectedRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectAuthLoading);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-gray-500">
                <div className="spinner w-10 h-10" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Public Route (redirect if already logged in)
function PublicRoute({ children }) {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectAuthLoading);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-gray-500">
                <div className="spinner w-10 h-10" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginForm /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterForm /></PublicRoute>} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><ResumeDashboard /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><ApplicationsDashboard /></ProtectedRoute>} />
            <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><JobDashboard /></ProtectedRoute>} />
            <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />

            {/* Default redirect for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    const dispatch = useDispatch();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    // Fetch current user on mount if we have tokens
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCurrentUser());
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 w-full">
                <AppRoutes />
            </main>
        </div>
    );
}

export default App;
