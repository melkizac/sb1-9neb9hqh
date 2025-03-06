import React, { useState, useEffect, useRef } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import {
  Menu,
  X as XIcon,
  BarChart3,
  Shield,
  Workflow,
  ArrowRight,
  Loader2,
  Brain,
  Zap,
  DollarSign,
  Rocket,
  LineChart,
  Users,
  UserCheck,
  Trophy,
  Bot,
  Clock,
  TrendingUp,
  ShoppingCart,
  FileText,
  Settings,
  Database,
  Lightbulb,
  MessageCircle,
} from 'lucide-react';
import { HeroAnimation } from './components/HeroAnimation';
import { ContactForm } from './components/ContactForm';
import { CaseStudy } from './pages/CaseStudy';
import { CaseStudies } from './pages/CaseStudies';
import { UploadLogo } from './pages/UploadLogo';
import { AdminPage } from './pages/AdminPage';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { LinksPage } from './pages/LinksPage';
import { NotFound } from './pages/NotFound';
import { Chat } from './components/Chat';

const features = [
  {
    title: 'Custom AI Solutions',
    description: 'Building AI-driven automation for business operations and accounting.',
    icon: Brain,
  },
  {
    title: 'AI Consulting',
    description: 'Helping businesses integrate AI tools for workflow optimization.',
    icon: BarChart3,
  },
  {
    title: 'Workflow Automation',
    description: 'Developing no-code and AI-powered automation strategies for SMEs.',
    icon: Workflow,
  },
  {
    title: 'AI Training & Workshops',
    description: 'Educating business owners on the power of AI for growth.',
    icon: Shield,
  },
];

const useCases = [
  {
    title: 'Document Processing',
    description: 'Automate data extraction from invoices, receipts, and forms with AI-powered OCR.',
    icon: FileText,
    metrics: '60% faster processing',
  },
  {
    title: 'Financial Analysis',
    description: 'AI-driven insights for better financial decision-making and forecasting.',
    icon: TrendingUp,
    metrics: '85% accuracy rate',
  },
  {
    title: 'Customer Service',
    description: 'Intelligent chatbots and automation for 24/7 customer support.',
    icon: Users,
    metrics: '3x faster response time',
  },
  {
    title: 'Data Management',
    description: 'Smart data organization and analysis for better business insights.',
    icon: Database,
    metrics: '50% less manual work',
  },
  {
    title: 'Process Automation',
    description: 'Streamline repetitive tasks with intelligent workflow automation.',
    icon: Settings,
    metrics: '40% cost reduction',
  },
  {
    title: 'Innovation Strategy',
    description: 'AI-powered insights to drive product and service innovation.',
    icon: Lightbulb,
    metrics: '2x faster development',
  },
];

const benefits = [
  {
    title: 'Automate Repetitive Tasks',
    description: 'Let AI handle routine operations while your team focuses on strategic work.',
    icon: Bot,
  },
  {
    title: 'Cut Operational Costs',
    description: 'Reduce expenses through intelligent process optimization.',
    icon: DollarSign,
  },
  {
    title: 'Boost Productivity',
    description: 'Accelerate workflows and eliminate bottlenecks with AI assistance.',
    icon: Rocket,
  },
  {
    title: 'Enhance Decision-Making',
    description: 'Make data-driven decisions with AI-powered insights.',
    icon: LineChart,
  },
  {
    title: 'Improve Customer Experience',
    description: 'Deliver personalized service through AI-driven interactions.',
    icon: Users,
  },
  {
    title: 'Optimize Workforce',
    description: 'Empower employees with AI tools to maximize their potential.',
    icon: UserCheck,
  },
  {
    title: 'Gain Competitive Edge',
    description: 'Stay ahead of the market with cutting-edge AI capabilities.',
    icon: Trophy,
  },
  {
    title: 'Scale Operations',
    description: 'Grow your business efficiently with automated processes.',
    icon: Zap,
  },
];

const testimonials = [
  {
    quote: "NEXIUS Labs' AI automation solution has transformed our operations. What used to take our team hours now happens in minutes, and with better accuracy. This has allowed us to focus on strategic initiatives and growth.",
    author: "Vincent Sim",
    title: "Operations Director",
    company: "Serial Company",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
  },
  {
    quote: "The AI solution from NEXIUS Labs has revolutionized our accounting processes. Our team now focuses on analysis and strategy instead of manual data entry.",
    author: "Kate Yap",
    title: "CFO",
    company: "Daisy Accounting",
    image: "https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images//kate_yap.jpeg",
  },
  {
    quote: "NEXIUS Labs' AI solution has transformed how we understand and serve our customers. The results have exceeded our expectations.",
    author: "Michael Zhang",
    title: "CEO",
    company: "GreenCart",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
  },
];

function Navigation({ onContactClick }: { onContactClick: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link 
            to="/"
            className="flex items-center focus:outline-none group"
          >
            <img
              src="https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images/m04h4fs8wns-1739784195705.png"
              alt="NEXIUS Labs"
              className="h-8 w-8 object-contain group-hover:opacity-90 transition-opacity"
            />
            <span className="ml-3 text-xl font-display font-extrabold text-nexius-navy tracking-tight uppercase group-hover:text-nexius-teal transition-colors">NEXIUS Labs</span>
          </Link>
          {/* Mobile menu button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="hidden md:flex items-center space-x-8 relative">
            <a href="/#services" className="font-body font-medium text-nexius-charcoal hover:text-nexius-navy transition-colors">Services</a>
            <a href="/#benefits" className="font-body font-medium text-nexius-charcoal hover:text-nexius-navy transition-colors">Benefits</a>
            <Link to="/blog" className="font-body font-medium text-nexius-charcoal hover:text-nexius-navy transition-colors">Blog</Link>
            <Link to="/case-studies" className="font-body font-medium text-nexius-charcoal hover:text-nexius-navy transition-colors">Case Studies</Link>
            <a href="/#testimonials" className="font-body font-medium text-nexius-charcoal hover:text-nexius-navy transition-colors">Testimonials</a>
            <button 
              onClick={onContactClick}
              data-contact="true"
              className="bg-nexius-teal text-white px-4 py-2 rounded-lg hover:bg-nexius-teal/90 transition-colors font-display font-semibold tracking-wide uppercase text-sm"
            >
              Let's Talk
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            <a href="/#services" className="block px-3 py-2 rounded-md text-base font-medium text-nexius-charcoal hover:text-nexius-navy hover:bg-gray-50">
              Services
            </a>
            <a href="/#benefits" className="block px-3 py-2 rounded-md text-base font-medium text-nexius-charcoal hover:text-nexius-navy hover:bg-gray-50">
              Benefits
            </a>
            <Link to="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-nexius-charcoal hover:text-nexius-navy hover:bg-gray-50">
              Blog
            </Link>
            <Link to="/case-studies" className="block px-3 py-2 rounded-md text-base font-medium text-nexius-charcoal hover:text-nexius-navy hover:bg-gray-50">
              Case Studies
            </Link>
            <a href="/#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-nexius-charcoal hover:text-nexius-navy hover:bg-gray-50">
              Testimonials
            </a>
            <button onClick={onContactClick} className="w-full mt-2 px-3 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90 transition-colors font-display font-semibold tracking-wide uppercase text-sm">Let's Talk</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-nexius-navy to-nexius-navy/95">
        <HeroAnimation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="relative text-5xl font-display font-extrabold text-white mb-6 tracking-tight">
              AI Automation & Business Process Optimization for Growth
            </h1>
            <p className="relative text-xl font-body text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              At Nexius Labs, we turn AI into a powerful growth engine for businesses—automating operations, streamlining workflows, and maximizing efficiency.
            </p>
            <div className="relative flex justify-center gap-4">
              <button 
                onClick={() => {
                  const contactButton = document.querySelector('button[data-contact="true"]');
                  if (contactButton instanceof HTMLButtonElement) {
                    contactButton.click();
                  }
                }}
                className="bg-nexius-teal text-white px-6 py-3 rounded-lg hover:bg-nexius-teal/90 transition-colors flex items-center group font-display font-semibold tracking-wide uppercase text-sm"
              >
                Let's Talk <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="relative mt-16">
              <img
                src="/images/hero.png"
                alt="AI Executive Intelligence"
                className="rounded-xl shadow-2xl border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-nexius-navy mb-4 tracking-tight">
              BUSINESSES STRUGGLE TO ADOPT AI
            </h2>
            <p className="font-body text-nexius-charcoal max-w-2xl mx-auto leading-relaxed">
              Nexius simplifies AI adoption with tailored automation, expert consulting, and no-code solutions - helping businesses unlock efficiency, reduce costs, and scale seamlessly.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="group p-6 bg-white rounded-xl border border-nexius-gray hover:border-nexius-teal/30 hover:shadow-lg transition-all">
                <div className="relative inline-block">
                  <div className="absolute -inset-2 bg-nexius-teal/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <feature.icon className="relative h-12 w-12 text-nexius-teal mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-nexius-navy mb-2">{feature.title}</h3>
                <p className="text-nexius-charcoal">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-nexius-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-nexius-navy mb-4 tracking-tight">
              HOW AI CAN HELP YOUR BUSINESS?
            </h2>
            <p className="font-body text-nexius-charcoal max-w-2xl mx-auto leading-relaxed">
              Discover the transformative power of AI and how it can revolutionize your business operations,
              boost efficiency, and drive sustainable growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="benefit-card">
                <benefit.icon className="benefit-icon" />
                <h3 className="text-lg font-semibold text-nexius-navy mb-2">{benefit.title}</h3>
                <p className="text-sm text-nexius-charcoal">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-nexius-navy mb-4 tracking-tight">
              AI SOLUTIONS IN ACTION
            </h2>
            <p className="font-body text-nexius-charcoal max-w-2xl mx-auto leading-relaxed">
              Explore how our AI solutions are transforming different aspects of business operations
              and delivering measurable results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="group p-6 bg-white rounded-xl border border-nexius-gray hover:border-nexius-teal/30 hover:shadow-lg transition-all">
                <div className="relative inline-block">
                  <div className="absolute -inset-2 bg-nexius-teal/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <useCase.icon className="relative h-12 w-12 text-nexius-teal mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-nexius-navy mb-2">{useCase.title}</h3>
                <p className="text-nexius-charcoal mb-4">{useCase.description}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-nexius-teal/10 text-nexius-teal">
                  {useCase.metrics}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-nexius-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold text-nexius-navy mb-4 tracking-tight">
              Visionary Leaders Trust Nexius
            </h2>
            <p className="font-body text-nexius-charcoal max-w-2xl mx-auto leading-relaxed">
              Join forward-thinking executives who've transformed their decision-making
              process with NEXIUS Labs' intelligent insights.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="p-8 bg-white rounded-xl border border-nexius-gray hover:border-nexius-teal/30 transition-colors">
                <p className="text-nexius-charcoal mb-6 text-lg italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="ml-4">
                    <h4 className="text-nexius-navy font-semibold">{testimonial.author}</h4>
                    <p className="text-nexius-charcoal">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-nexius-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4 tracking-tight">
            Ready to adopt AI to grow your business?
          </h2>
          <p className="font-body text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join industry leaders who are already leveraging NEXIUS Labs to illuminate opportunities
            and drive unprecedented growth.
          </p>
          <a 
            href="https://tidycal.com/melverick/discovery-call-via-zoom-30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-nexius-teal text-white px-8 py-4 rounded-lg hover:bg-nexius-teal/90 transition-colors font-display font-semibold tracking-wide uppercase text-sm inline-flex items-center"
          >
            Schedule A Call <Clock className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <button
                onClick={scrollToTop}
                className="flex items-center text-white mb-4 group focus:outline-none"
              >
                <img
                  src="https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images/m04h4fs8wns-1739784195705.png"
                  alt="NEXIUS Labs"
                  className="h-6 w-6 object-contain group-hover:opacity-90 transition-opacity"
                />
                <span className="ml-2 text-lg font-bold group-hover:text-nexius-teal transition-colors">NEXIUS Labs</span>
              </button>
              <p className="text-sm">
                Empower Your Business With AI-Driven Automation
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/case-studies" className="hover:text-white transition-colors">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            © {new Date().getFullYear()} NEXIUS Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
import { useLocation } from 'react-router-dom';

export default function App() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  const shouldShowNav = location.pathname !== '/links';

  useEffect(() => {
    supabase.auth.getSession().then(() => {
      setAuthChecked(true);
    }).catch(error => {
      console.error('Auth check failed:', error);
      setAuthChecked(true);
    });
  }, []);

  if (!authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-nexius-teal animate-spin" />
      </div>
    );
  }

  return (
    <>
      {shouldShowNav && <Navigation onContactClick={() => setIsContactFormOpen(true)} />}
      <ContactForm isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/case-study/:id" element={<CaseStudy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/upload" element={<UploadLogo />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/links" element={<LinksPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Chat />
    </>
  );
}