const Features = () => {
  const features = [
    {
      icon: "📋",
      title: "Digital Credentials",
      description: "Manage and verify your digital credentials securely"
    },
    {
      icon: "🔍",
      title: "Instant Verification",
      description: "Verify credentials in real-time with one click"
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Track your credential usage and analytics"
    },
    {
      icon: "🤝",
      title: "Integration Ready",
      description: "Easy API integration with your systems"
    },
    {
      icon: "🌍",
      title: "Global Access",
      description: "Access your credentials from anywhere"
    },
    {
      icon: "🛡️",
      title: "Enterprise Security",
      description: "Bank-level encryption and security"
    }
  ];

  return (
    <section id="features" className="py-20 bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-8 hover:border-blue-500/50 transition group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;