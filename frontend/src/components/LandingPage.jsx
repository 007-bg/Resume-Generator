import { Link } from 'react-router-dom';

/**
 * Landing Page Component
 * Summer/Vintage themed landing page with animations
 */
function LandingPage() {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-background-shapes">
                    <div className="hero-shape hero-shape-1"></div>
                    <div className="hero-shape hero-shape-2"></div>
                    <div className="hero-shape hero-shape-3"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-badge">
                        ✨ AI-Powered Resume Generation
                    </div>

                    <h1 className="hero-title">
                        Craft Your Perfect Resume with{' '}
                        <span className="hero-title-gradient">AI Intelligence</span>
                    </h1>

                    <p className="hero-subtitle">
                        Let our multi-agent AI system create tailored, ATS-optimized resumes
                        that get you noticed. Track applications, analyze job matches, and
                        land your dream job.
                    </p>

                    <div className="hero-cta">
                        <Link to="/register" className="btn-summer-primary">
                            Get Started Free
                        </Link>
                        <Link to="/login" className="btn-summer-secondary">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <div className="section-header">
                    <span className="section-label">Features</span>
                    <h2 className="section-title">Everything You Need to Land Your Dream Job</h2>
                    <p className="section-subtitle">
                        Powerful AI tools to create, optimize, and track your job applications
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🤖</div>
                        <h3 className="feature-title">AI Resume Generation</h3>
                        <p className="feature-description">
                            Our multi-agent system crafts personalized resumes tailored to
                            each job description, optimized for ATS systems.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3 className="feature-title">Job Match Analysis</h3>
                        <p className="feature-description">
                            Get instant match scores and detailed analysis of how your profile
                            aligns with job requirements.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📋</div>
                        <h3 className="feature-title">Application Tracker</h3>
                        <p className="feature-description">
                            Track all your applications in one place with our intuitive
                            Kanban board and analytics dashboard.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="landing-how-it-works">
                <div className="section-header">
                    <span className="section-label">How It Works</span>
                    <h2 className="section-title">Three Simple Steps to Success</h2>
                    <p className="section-subtitle">
                        Get started in minutes and let AI do the heavy lifting
                    </p>
                </div>

                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3 className="step-title">Add Your Profile</h3>
                        <p className="step-description">
                            Enter your experience, skills, and achievements once.
                            We'll use this as your "ground truth" for all resumes.
                        </p>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <h3 className="step-title">Paste Job Description</h3>
                        <p className="step-description">
                            Found a job you like? Paste the description and our AI
                            analyzes the requirements instantly.
                        </p>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <h3 className="step-title">Download & Apply</h3>
                        <p className="step-description">
                            Get a tailored, ATS-optimized resume in seconds.
                            Download as PDF and start applying!
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Transform Your Job Search?</h2>
                    <p className="cta-subtitle">
                        Join thousands of professionals who've landed their dream jobs
                        with AI-powered resumes.
                    </p>
                    <Link to="/register" className="btn-summer-primary">
                        Start Building Your Resume
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">Resume Agent</div>
                    <div className="footer-links">
                        <Link to="/login" className="footer-link">Login</Link>
                        <Link to="/register" className="footer-link">Sign Up</Link>
                    </div>
                    <div className="footer-copyright">
                        © 2026 Resume Agent. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
