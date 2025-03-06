import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HeroAnimation } from '../components/HeroAnimation';
import {
  Globe,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Youtube,
  X as XIcon,
  Instagram,
  Facebook,
  Github,
  Calendar, 
  UserPlus,
} from 'lucide-react';

interface SocialLink {
  id: string;
  title: string;
  url: string;
  type: 'social' | 'external' | 'calendar';
  icon: string;
}

interface Founder {
  name: string;
  title: string;
  image: string;
  phone: string;
  email: string;
  linkedin: string;
}

const socialIcons = {
  website: Globe,
  linkedin: Linkedin,
  youtube: Youtube,
  twitter: XIcon,
  instagram: Instagram,
  facebook: Facebook,
  github: Github,
  calendar: Calendar,
  external: ExternalLink,
};

const founders: Founder[] = [
  {
    name: 'Melverick Ng',
    title: 'Co-Founder',
    image: 'https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images/darryl-1740396262527.jpeg',
    phone: '+65 8900-2130',
    email: 'melverick@nexiuslabs.com',
    linkedin: 'https://www.linkedin.com/in/melverick/',
  },
  {
    name: 'Darryl Wong',
    title: 'Co-Founder',
    image: 'https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images/darryl-1740395556131.jpeg',
    phone: '+65 8102-5863',
    email: 'darryl@nexiuslabs.com',
    linkedin: 'https://www.linkedin.com/in/darrylwongdq/',
  },
];

const links: SocialLink[] = [
  {
    id: '1',
    title: 'Book a Discovery Call',
    url: 'https://tidycal.com/melverick/discovery-call-via-zoom-30min',
    type: 'calendar',
    icon: 'calendar',
  },
  {
    id: '2',
    title: 'Visit Our Website',
    url: 'https://nexiuslabs.com',
    type: 'external',
    icon: 'website',
  },
  {
    id: '3',
    title: 'Follow Us on LinkedIn',
    url: 'https://www.linkedin.com/company/nexius-labs',
    type: 'social',
    icon: 'linkedin',
  },
  {
    id: '5',
    title: 'Follow Us on Twitter',
    url: 'https://x.com/nexiuslabs',
    type: 'social',
    icon: 'twitter',
  },
];

export function LinksPage() {
  const [clickCount, setClickCount] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load click counts from Supabase
    const loadClickCounts = async () => {
      const { data, error } = await supabase
        .from('link_clicks')
        .select('link_id, count');

      if (!error && data) {
        const counts = data.reduce((acc, curr) => ({
          ...acc,
          [curr.link_id]: curr.count,
        }), {});
        setClickCount(counts);
      }
    };

    loadClickCounts();
  }, []);

  const handleLinkClick = async (linkId: string) => {
    // Update click count in state
    setClickCount(prev => ({
      ...prev,
      [linkId]: (prev[linkId] || 0) + 1,
    }));

    // Update click count in Supabase
    await supabase.rpc('increment_link_click', {
      link_id: linkId,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-nexius-navy to-nexius-navy/95">
      <HeroAnimation />
      {/* Header */}
      <header className="pt-12 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="text-center">
          <a href="/" className="inline-flex items-center group">
            <img
              src="https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images/m04h4fs8wns-1739784195705.png"
              alt="NEXIUS Labs"
              className="relative h-12 w-12 object-contain group-hover:opacity-90 transition-opacity mb-3"
            />
            <h1 className="relative text-xl font-display font-bold text-white group-hover:text-nexius-teal transition-colors">
              NEXIUS Labs
            </h1>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mt-16 mb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <img
            src="/images/hero.png"
            alt="NEXIUS Labs Cover"
            className="relative w-full h-[200px] object-cover rounded-xl shadow-2xl mb-8"
          />
          <p className="relative text-xl text-white/90 max-w-2xl mx-auto">
            Empowering businesses with AI-driven automation and intelligent insights
          </p>
        </div>
      </section>

      {/* Links Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-4">
          <div className="relative">
          {links.map((link) => {
            const Icon = socialIcons[link.icon as keyof typeof socialIcons];
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
                className="block bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg group"
              >
                <div className="flex items-center">
                  <Icon className="h-6 w-6 text-nexius-teal mr-4" />
                  <span className="flex-1 text-white font-medium">{link.title}</span>
                  <ExternalLink className="h-5 w-5 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </a>
            );
          })}
          </div>
        </div>
      </section>

      {/* Co-Founders Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-display font-bold text-white text-center mb-12">
          <span className="relative">Meet Our Co-Founders</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="bg-white/10 border border-white/20 rounded-xl p-8 text-center"
            >
              <img
                src={founder.image}
                alt={founder.name}
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                crossOrigin="anonymous"
              />
              <h3 className="text-xl font-display font-bold text-white mb-2">
                {founder.name}
              </h3>
              <p className="text-white/80 mb-6">Co-Founder</p>
              <div className="space-y-4">
                <a
                  href={`tel:${founder.phone}`}
                  className="flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {founder.phone}
                </a>
                <a
                  href={`mailto:${founder.email}`}
                  className="flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  {founder.email}
                </a>
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90 transition-colors"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  Connect on LinkedIn
                </a>
                <a
                  href={`data:text/vcard;charset=UTF-8,BEGIN:VCARD%0AVERSION:3.0%0AFN:${founder.name}%0ATITLE:${founder.title} at NEXIUS Labs%0ATEL:${founder.phone}%0AEMAIL:${founder.email}%0AURL:${founder.linkedin}%0AEND:VCARD`}
                  download={`${founder.name.replace(' ', '_')}.vcf`}
                  className="inline-flex items-center justify-center px-4 py-2 mt-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Add to Contacts
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="text-white/60">
          © {new Date().getFullYear()} NEXIUS Labs. All rights reserved.
        </p>
      </footer>
    </div>
  );
}