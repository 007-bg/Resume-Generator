import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

function LoginForm() {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8000/accounts/google/login/';
    };

    const handleGithubLogin = () => {
        window.location.href = 'http://localhost:8000/accounts/github/login/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Icon icon="mdi:file-document" width="24" />
                        </div>
                        Resume Agent
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to continue building your perfect resume</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-0.5 border border-border"
                        >
                            <Icon icon="flat-color-icons:google" width="24" />
                            Continue with Google
                        </button>

                        <button
                            onClick={handleGithubLogin}
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#24292e] text-white font-semibold rounded-xl hover:bg-[#2f363d] transition-all hover:-translate-y-0.5"
                        >
                            <Icon icon="mdi:github" width="24" />
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RegisterForm() {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8000/accounts/google/login/';
    };

    const handleGithubLogin = () => {
        window.location.href = 'http://localhost:8000/accounts/github/login/';
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary mb-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                            <Icon icon="mdi:file-document" width="24" />
                        </div>
                        Resume Agent
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-muted-foreground">Get started with AI-powered resume building</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-0.5 border border-border"
                        >
                            <Icon icon="flat-color-icons:google" width="24" />
                            Continue with Google
                        </button>

                        <button
                            onClick={handleGithubLogin}
                            className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#24292e] text-white font-semibold rounded-xl hover:bg-[#2f363d] transition-all hover:-translate-y-0.5"
                        >
                            <Icon icon="mdi:github" width="24" />
                            Continue with GitHub
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { LoginForm, RegisterForm };
