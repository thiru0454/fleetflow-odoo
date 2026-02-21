import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, BarChart3, AlertTriangle, MapPin, Users, Zap, CheckCircle, ArrowRight, Lock, Menu, X, Home } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Fleet Management',
      desc: 'Real-time vehicle tracking, lifecycle management, and status updates',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Analytics & ROI',
      desc: 'Data-driven insights, cost analysis, and fuel efficiency tracking',
    },
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: 'Safety Compliance',
      desc: 'Driver monitoring, license expiry alerts, and safety scoring',
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Trip Dispatcher',
      desc: 'Route optimization, cargo validation, and assignment management',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Driver Management',
      desc: 'Full CRUD operations, performance metrics, and compliance tracking',
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Secure Operations',
      desc: 'Enterprise-grade security, role-based access, and data protection',
    },
  ];

  const benefits = [
    { num: '35%', label: 'Cost Reduction' },
    { num: '99.7%', label: 'System Uptime' },
    { num: '2.4K+', label: 'Vehicles Managed' },
    { num: '100+', label: 'Companies Trust Us' },
  ];

  const roles = [
    {
      role: 'Fleet Manager',
      responsibilities: [
        'Oversee vehicle health & asset lifecycle',
        'Monitor utilization rates',
        'Track operational costs',
      ],
    },
    {
      role: 'Dispatcher',
      responsibilities: [
        'Create & manage trips',
        'Assign drivers & vehicles',
        'Validate cargo loads',
      ],
    },
    {
      role: 'Safety Officer',
      responsibilities: [
        'Monitor driver compliance',
        'Track license expirations',
        'Manage safety scores',
      ],
    },
    {
      role: 'Financial Analyst',
      responsibilities: [
        'Audit fuel spending',
        'Calculate maintenance ROI',
        'Analyze operational costs',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-background/40 border-b border-primary/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg shadow-lg group-hover:shadow-xl transition-all">
                <Truck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-bold tracking-tight">
                  FLEET<span className="text-primary">FLOW</span>
                </span>
                <p className="text-xs text-muted-foreground">Fleet Management</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </button>
              <button
                onClick={() => document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                For Teams
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </button>
              <button
                onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </button>
              <a
                href="#"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            </div>

            {/* Login Button + Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/login')}
                className="hidden md:inline-flex bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/50 shadow-md transition-all duration-300 gap-2"
              >
                <Lock className="h-4 w-4" />
                Login
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileOpen && (
            <div className="md:hidden pt-4 pb-4 space-y-3 animate-fade-in border-t border-primary/10 mt-4">
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => {
                  document.getElementById('roles')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                For Teams
              </button>
              <button
                onClick={() => {
                  document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                How It Works
              </button>
              <a
                href="#"
                className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors block"
              >
                About
              </a>
              <Button
                onClick={() => {
                  navigate('/login');
                  setMobileOpen(false);
                }}
                className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg shadow-md transition-all duration-300 gap-2"
              >
                <Lock className="h-4 w-4" />
                Login
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/15 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
            <span className="block mb-2 animate-slide-in-up" style={{ animationDelay: '200ms' }}>Revolutionize Your</span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-primary/70 animate-slide-in-up" style={{ animationDelay: '300ms' }}>Fleet Operations</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
            Centralized digital hub for fleet management, driver safety, and operational analytics. Replace manual logbooks with intelligent automation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 shadow-lg transition-all duration-300 h-12 px-8 text-base font-medium group"
            >
              <span className="group-hover:translate-x-1 transition-transform">Get Started</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:border-primary hover:bg-primary/10 hover:scale-105 h-12 px-8 text-base font-medium transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, i) => (
              <div 
                key={i} 
                className="glass-card p-6 hover:border-primary/80 hover:shadow-xl hover:shadow-primary/20 hover:scale-110 transition-all duration-300 cursor-pointer animate-scale-in" 
                style={{ animationDelay: `${600 + i * 50}ms` }}
              >
                <p className="text-3xl font-bold text-primary mb-2 group-hover:text-4xl transition-all">{benefit.num}</p>
                <p className="text-sm text-muted-foreground">{benefit.label}</p>
              </div>
            ))}
          </div>

          {/* Feature Image */}
          <div className="glass-card p-8 rounded-2xl border-primary/30 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 animate-scale-in" style={{ animationDelay: '900ms' }}>
            <div className="h-96 bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/10 rounded-lg flex items-center justify-center group hover:from-primary/30 hover:via-secondary/40 transition-all duration-500">
              <div className="text-center">
                <Truck className="h-20 w-20 text-primary/40 mx-auto mb-4 group-hover:text-primary/60 group-hover:scale-110 transition-all duration-300" />
                <p className="text-muted-foreground group-hover:text-primary/80 transition-colors">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
              ✨ Core Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to <span className="text-primary">Manage Your Fleet</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed for modern logistics and fleet operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card p-8 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="p-3 bg-gradient-to-br from-primary/30 to-primary/20 rounded-lg w-fit mb-4 text-primary group-hover:from-primary/50 group-hover:to-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-sm group-hover:text-muted-foreground/80 transition-colors">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
              👥 For Every Role
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="text-primary">All Team Members</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Role-based access control ensures everyone has exactly what they need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((item, i) => (
              <div
                key={i}
                className="glass-card p-6 hover:border-primary/80 hover:shadow-xl hover:shadow-primary/20 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-fade-in cursor-pointer group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/70 group-hover:w-3 group-hover:h-3 transition-all" />
                  <h3 className="text-lg font-bold text-primary group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/70 transition-all">{item.role}</h3>
                </div>
                <ul className="space-y-3">
                  {item.responsibilities.map((resp, j) => (
                    <li key={j} className="flex gap-3 items-start group/item">
                      <CheckCircle className="h-5 w-5 text-status-available flex-shrink-0 mt-0.5 group-hover/item:text-primary group-hover/item:scale-110 transition-all duration-300" />
                      <span className="text-sm text-muted-foreground group-hover/item:text-muted-foreground/90 transition-colors">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-6 bg-gradient-to-b from-background to-secondary/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
              🔄 Workflow
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Streamlined Operations <span className="text-primary">From End to End</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Add Vehicles', desc: 'Register your fleet with capacity and details' },
              { step: '2', title: 'Manage Drivers', desc: 'Track licenses, safety scores, and compliance' },
              { step: '3', title: 'Create Trips', desc: 'Dispatch drivers with cargo validation' },
              { step: '4', title: 'Track Operations', desc: 'Monitor costs, fuel efficiency, and ROI' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 mb-8 animate-fade-in group cursor-pointer" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg group-hover:shadow-lg group-hover:shadow-primary/50 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  {item.step}
                </div>
                <div className="flex-1 pt-1 group-hover:translate-x-2 transition-transform duration-300">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto glass-card p-12 text-center border-primary/30 hover:border-primary/80 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 animate-fade-in group cursor-pointer" style={{ animationDelay: '100ms' }}>
          <Zap className="h-12 w-12 text-primary mx-auto mb-4 group-hover:animate-spin group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/70" />
          <h2 className="text-4xl font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">Start Managing Your Fleet Today</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto group-hover:text-muted-foreground/80 transition-colors">
            Join hundreds of logistics companies using FleetFlow to optimize operations, reduce costs, and improve safety.
          </p>

          <Button
            onClick={() => navigate('/login')}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 shadow-lg transition-all duration-300 h-12 px-8 text-base font-medium group/btn"
          >
            <span className="group-hover/btn:translate-x-1 transition-transform">Login to FleetFlow</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-2 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-background/50 backdrop-blur-md py-8 hover:bg-background/60 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="group animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-4 group-hover:translate-x-1 transition-transform">
                <Truck className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-bold group-hover:text-primary transition-colors">FleetFlow</span>
              </div>
              <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">Fleet & Logistics Management System</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <h4 className="font-bold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Features</a></li>
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Pricing</a></li>
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Security</a></li>
              </ul>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h4 className="font-bold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">About</a></li>
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Blog</a></li>
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Contact</a></li>
              </ul>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
              <h4 className="font-bold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Privacy</a></li>
                <li><a href="#" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 text-center text-sm text-muted-foreground hover:text-muted-foreground/80 transition-colors animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p>© 2026 FleetFlow. All rights reserved. | Modular Fleet & Logistics Management System</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
