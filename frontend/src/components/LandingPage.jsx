import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * Landing Page Component
 * Clean mono/dual color design with minimal gradients
 * Color palette: Coral (primary), Sky (secondary), Navy (background)
 */
function LandingPage() {
    const [scrollOpacity, setScrollOpacity] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Fade out within the first 300px of scrolling
            const newOpacity = Math.max(0, 1 - scrollY / 300);
            setScrollOpacity(newOpacity);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToFeatures = () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative min-h-screen w-full flex items-center overflow-hidden">
                {/* Subtle background accent - only slight glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute w-[600px] h-[600px] bg-coral rounded-full blur-[200px] opacity-10 -top-48 -right-48" />
                    <div className="absolute w-[400px] h-[400px] bg-sky rounded-full blur-[150px] opacity-10 bottom-0 left-0" />
                </div>

                {/* Main Content */}
                <div className="relative z-10 w-full px-8 md:px-16 lg:px-24 py-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text Content */}
                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy border border-sky/30 rounded-full text-sm text-sky mb-8">
                                ✨ AI-Powered Resume Generation
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8">
                                Craft Your
                                <br />
                                <span className="text-coral">Perfect Resume</span>
                                <br />
                                with AI
                            </h1>

                            <p className="text-xl text-sky/80 max-w-xl mb-12 leading-relaxed">
                                Let our multi-agent AI system create tailored, ATS-optimized resumes
                                that get you noticed. Land your dream job faster.
                            </p>

                            <div className="flex gap-4 flex-wrap">
                                <Link to="/register" className="btn btn-primary text-lg px-10 py-4">
                                    Get Started Free
                                </Link>
                                <Link to="/login" className="btn btn-secondary text-lg px-10 py-4">
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        {/* Right: 3D Resume Mockup */}
                        <div className="relative flex items-center justify-center lg:justify-end">
                            <div className="relative" style={{ perspective: '1000px' }}>
                                {/* Main Resume */}
                                <div
                                    className="relative w-[340px] h-[440px] bg-white rounded-lg shadow-2xl"
                                    style={{
                                        transform: 'rotateY(-15deg) rotateX(5deg)',
                                        animation: 'float3d 6s ease-in-out infinite'
                                    }}
                                >
                                    {/* Resume Content Mockup */}
                                    <div className="p-6 h-full flex flex-col">
                                        {/* Header */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-full bg-coral" />
                                            <div className="flex-1">
                                                <div className="h-4 w-32 bg-navy-dark rounded mb-2" />
                                                <div className="h-3 w-24 bg-sky/30 rounded" />
                                            </div>
                                        </div>

                                        {/* Summary */}
                                        <div className="mb-6">
                                            <div className="h-3 w-full bg-gray-200 rounded mb-2" />
                                            <div className="h-3 w-11/12 bg-gray-200 rounded mb-2" />
                                            <div className="h-3 w-3/4 bg-gray-200 rounded" />
                                        </div>

                                        {/* Experience */}
                                        <div className="mb-6">
                                            <div className="h-4 w-24 bg-coral rounded mb-3" />
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-2 h-2 bg-coral rounded-full" />
                                                <div className="h-3 w-40 bg-gray-200 rounded" />
                                            </div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-2 h-2 bg-coral rounded-full" />
                                                <div className="h-3 w-36 bg-gray-200 rounded" />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 bg-coral rounded-full" />
                                                <div className="h-3 w-32 bg-gray-200 rounded" />
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="mt-auto">
                                            <div className="h-4 w-16 bg-sky rounded mb-3" />
                                            <div className="flex flex-wrap gap-2">
                                                <div className="h-6 w-16 bg-sky/20 rounded-full" />
                                                <div className="h-6 w-20 bg-coral/20 rounded-full" />
                                                <div className="h-6 w-14 bg-sky/20 rounded-full" />
                                                <div className="h-6 w-18 bg-coral/20 rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 rounded-lg border-2 border-coral/20 pointer-events-none" />
                                </div>

                                {/* Shadow Resumes */}
                                <div
                                    className="absolute top-4 -left-6 w-[340px] h-[440px] bg-navy rounded-lg"
                                    style={{ transform: 'rotateY(-20deg) rotateX(8deg)', zIndex: -1 }}
                                />
                                <div
                                    className="absolute top-8 -left-12 w-[340px] h-[440px] bg-navy-dark rounded-lg"
                                    style={{ transform: 'rotateY(-25deg) rotateX(10deg)', zIndex: -2 }}
                                />

                                {/* Floating elements */}
                                <div className="absolute -top-8 -right-8 w-16 h-16 bg-coral rounded-lg shadow-lg flex items-center justify-center text-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                                    🤖
                                </div>
                                <div className="absolute -bottom-4 -left-8 w-14 h-14 bg-sky rounded-lg shadow-lg flex items-center justify-center text-xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                                    ✓
                                </div>
                                <div className="absolute top-1/2 -right-12 w-12 h-12 bg-cream rounded-full shadow-lg flex items-center justify-center text-lg animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                                    📄
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer z-20 transition-all duration-300 hover:scale-105"
                    style={{ opacity: scrollOpacity, pointerEvents: scrollOpacity > 0 ? 'auto' : 'none' }}
                    onClick={scrollToFeatures}
                >
                    <span className="text-sky/60 text-xs uppercase tracking-[0.2em] font-medium">Scroll to explore</span>
                    <div className="w-[30px] h-[50px] border-2 border-sky/30 rounded-full p-2 flex justify-center">
                        <div className="w-1.5 h-1.5 bg-coral rounded-full animate-scroll-wheel" />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-8 md:px-16 lg:px-24 bg-navy-dark relative w-full">
                <div className="absolute top-0 left-0 right-0 h-px bg-sky/20" />

                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="inline-block text-sm font-semibold text-coral uppercase tracking-widest mb-4">
                        Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Everything You Need to Land Your Dream Job
                    </h2>
                    <p className="text-lg text-sky/70">
                        Powerful AI tools to create, optimize, and track your job applications
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '🤖',
                            title: 'AI Resume Generation',
                            description: 'Our multi-agent system crafts personalized resumes tailored to each job description, optimized for ATS systems.'
                        },
                        {
                            icon: '📊',
                            title: 'Job Match Analysis',
                            description: 'Get instant match scores and detailed analysis of how your profile aligns with job requirements.'
                        },
                        {
                            icon: '📋',
                            title: 'Application Tracker',
                            description: 'Track all your applications in one place with our intuitive Kanban board and analytics dashboard.'
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="group p-8 bg-navy border border-sky/20 rounded-xl hover:-translate-y-2 hover:border-coral/50 transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-navy-dark rounded-xl flex items-center justify-center mb-6 text-3xl border border-sky/20">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-sky/70 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-32 px-8 md:px-16 lg:px-24 w-full">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <span className="inline-block text-sm font-semibold text-coral uppercase tracking-widest mb-4">
                        How It Works
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Three Simple Steps to Success
                    </h2>
                    <p className="text-lg text-sky/70">
                        Get started in minutes and let AI do the heavy lifting
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-12 relative">
                    {/* Connecting line - this is ONE gradient accent */}
                    <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-1 bg-gradient-to-r from-coral via-cream to-sky z-0 rounded-full" />

                    {[
                        { num: 1, title: 'Add Your Profile', desc: 'Enter your experience, skills, and achievements once. We\'ll use this as your "ground truth" for all resumes.' },
                        { num: 2, title: 'Paste Job Description', desc: 'Found a job you like? Paste the description and our AI analyzes the requirements instantly.' },
                        { num: 3, title: 'Download & Apply', desc: 'Get a tailored, ATS-optimized resume in seconds. Download as PDF and start applying!' }
                    ].map((step, index) => (
                        <div key={index} className="flex-1 text-center relative z-10">
                            <div className="w-24 h-24 bg-coral rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-8">
                                {step.num}
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                            <p className="text-sky/70 max-w-sm mx-auto">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section - solid background */}
            <section className="py-32 px-8 md:px-16 lg:px-24 bg-navy-dark text-center relative overflow-hidden w-full">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-coral rounded-full blur-[200px] opacity-10" />
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Ready to Transform Your Job Search?
                    </h2>
                    <p className="text-xl text-sky/70 mb-12 max-w-2xl mx-auto">
                        Join professionals who've landed their dream jobs with AI-powered resumes.
                    </p>
                    <Link to="/register" className="btn btn-primary text-xl px-12 py-5">
                        Start Building Your Resume
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 px-8 md:px-16 lg:px-24 bg-navy border-t border-sky/10 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-2xl font-bold text-coral">Resume Agent</div>
                    <p className="text-sky/50 text-sm">
                        © {new Date().getFullYear()} Resume Agent. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <a href="#" className="text-sky/50 hover:text-coral transition-colors">Privacy</a>
                        <a href="#" className="text-sky/50 hover:text-coral transition-colors">Terms</a>
                        <a href="#" className="text-sky/50 hover:text-coral transition-colors">Contact</a>
                    </div>
                </div>
            </footer>

            {/* Custom CSS for Animations */}
            <style>{`
            @keyframes float3d {
                0%, 100% {
                    transform: rotateY(-15deg) rotateX(5deg) translateY(0);
                }
                50% {
                    transform: rotateY(-12deg) rotateX(3deg) translateY(-20px);
                }
            }
            
            @keyframes scroll-wheel {
                0% {
                    transform: translateY(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(15px);
                    opacity: 0;
                }
            }

            .animate-scroll-wheel {
                animation: scroll-wheel 1.5s ease-in-out infinite;
            }
            
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .animate-fade-in {
                animation: fade-in 0.8s ease-out;
            }
        `}</style>
        </div>
    );
}

export default LandingPage;
