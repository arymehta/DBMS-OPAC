import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Zap } from 'lucide-react';

const Landing = () => {
  const announcements = [
    {
      id: 1,
      title: 'Registration Now Open',
      description: 'Candidate registration is now live for the 2025 batch.',
      date: 'Oct 26, 2025'
    },
    {
      id: 2,
      title: 'Important Deadline',
      description: 'Last date to submit applications is November 15, 2025.',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
            OPAC
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your gateway to exceptional opportunities
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/candidate-auth?mode=signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition flex items-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </Link>
            <Link
              to="/candidate-auth?mode=login"
              className="border-2 border-blue-600 hover:bg-blue-50 text-blue-600 font-semibold px-8 py-3 rounded-lg transition"
            >
              Candidate Login
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition"
            >
              <feature.icon className="text-blue-600 mb-4" size={32} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div id="announcements" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Announcements</h2>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{announcement.description}</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                    {announcement.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-600 rounded-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of candidates already registered on OPAC
          </p>
          <Link
            to="/candidate-auth?mode=signup"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition"
          >
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;