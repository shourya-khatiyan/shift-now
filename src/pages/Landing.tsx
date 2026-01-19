import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Briefcase, Users, ArrowRight, MapPin, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth';

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Prevent flashing content while checking auth
  if (!loading && user) {
    return null;
  }

  const features = [
    {
      icon: Zap,
      title: 'Instant Hiring',
      description: 'Post a job and get workers in minutes, not days',
    },
    {
      icon: MapPin,
      title: 'Location-Based',
      description: 'Find jobs or workers right in your neighborhood',
    },
    {
      icon: Clock,
      title: 'Short-Term Work',
      description: 'Designed for hours, not months of commitment',
    },
    {
      icon: Shield,
      title: 'Trust & Ratings',
      description: 'Build reputation through verified reviews',
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
          >
            <Zap size={16} className="fill-current" />
            <span className="text-sm font-semibold">Uber for Jobs</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="text-gradient">Instant Jobs.</span>
            <br />
            <span className="text-foreground">Instant Help.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Connect with nearby workers or find short-term jobs in seconds. No agents, no delays, no hassle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth?role=worker">
              <Button variant="hero" size="lg" className="w-full sm:w-auto group">
                <Users size={20} />
                Find Work
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/auth?role=employer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                <Briefcase size={20} />
                Hire Workers
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient">5K+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Active Workers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient">1K+</p>
              <p className="text-xs md:text-sm text-muted-foreground">Jobs Posted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient">4.8</p>
              <p className="text-xs md:text-sm text-muted-foreground">Avg Rating</p>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            How <span className="text-gradient">SHIFT NOW</span> Works
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Workers */}
            <div className="bg-card rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Users size={20} className="text-success" />
                </div>
                <h3 className="font-bold text-lg">For Workers</h3>
              </div>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Open the app and view nearby jobs
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  Tap Accept on a job you like
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Go, work, and earn instantly
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  Build your reputation with ratings
                </li>
              </ol>
            </div>

            {/* For Employers */}
            <div className="bg-card rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Briefcase size={20} className="text-secondary" />
                </div>
                <h3 className="font-bold text-lg">For Employers</h3>
              </div>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Post your job with details and pay
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  Nearby workers get instant alerts
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  A worker accepts and arrives
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  Rate them and re-hire favorites
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <div className="bg-card rounded-3xl p-8 md:p-12 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of workers and employers already using SHIFT NOW
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Get Started Free
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <Logo size="sm" className="justify-center mb-4" />
          <p>© 2024 SHIFT NOW. Instant jobs. Instant help.</p>
          <p className="mt-2">Team PROPAIN - Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}
