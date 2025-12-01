import React, { use } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Zap, Library, Bell, Calendar } from 'lucide-react';
import {IssuerDetails} from '../components/IssuerDetails';
import { BACKEND_URL } from "../config"; 

const Landing = () => {


  const announcements = [
    {
      id: 1,
      title: 'Library Undergoing Expansion',
      description: 'Our main library will be closed for renovations from November 1 to November 15, 2025.',
      date: 'Oct 26, 2025'
    },
    {
      id: 2,
      title: 'All issuers are to collect membership cards',
      description: 'Last date to collect is November 15, 2025.',
      date: 'Oct 26, 2025'
    },
    {
      id: 3,
      title: 'System Maintenance',
      description: 'The system will undergo maintenance on October 28, 2025.',
      date: 'Oct 26, 2025'
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Seamless Registration',
      description: 'Easy and quick registration process for candidates'
    },
    {
      icon: Users,
      title: 'Secure Access',
      description: 'OTP-based verification for maximum security'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Instant account verification and activation'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30 mb-6">
            <Library className="text-white" size={40} />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent mb-4">
            OPAC
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your gateway to exceptional opportunities
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/candidate-auth?mode=signup"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/candidate-auth?mode=login"
              className="border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200"
            >
              Candidate Login
            </Link>
          </div>
        </div>

        <IssuerDetails/>
        
        {/* Announcements Section */}
        <div id="announcements" className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-100 rounded-xl">
              <Bell className="text-indigo-600" size={22} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Announcements</h2>
          </div>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{announcement.description}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500 whitespace-nowrap ml-4 bg-gray-100 px-3 py-1 rounded-full">
                    <Calendar size={14} />
                    {announcement.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-xl shadow-indigo-500/30">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Join thousands of candidates already registered on OPAC
          </p>
          <Link
            to="/candidate-auth?mode=signup"
            className="inline-block bg-white text-indigo-600 hover:bg-gray-50 font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;