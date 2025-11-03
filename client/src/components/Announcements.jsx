import { Bell } from 'lucide-react';
import { BACKEND_URL } from "../config"; 


const Announcements = () => {
  const announcements = [
    {
      id: 1,
      title: "System Maintenance",
      description: "Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM UTC",
      date: "2024-12-15",
      priority: "high"
    },
    {
      id: 2,
      title: "New Feature Released",
      description: "Bulk credential upload feature is now available",
      date: "2024-12-10",
      priority: "medium"
    },
    {
      id: 3,
      title: "Security Update",
      description: "Important security patches have been deployed",
      date: "2024-12-08",
      priority: "high"
    }
  ];

  return (
    <section id="announcements" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-white mb-12">Announcements</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${announcement.priority === 'high' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                <Bell size={24} className={announcement.priority === 'high' ? 'text-red-400' : 'text-blue-400'} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{announcement.title}</h3>
                <p className="text-slate-400 mb-3">{announcement.description}</p>
                <span className="text-sm text-slate-500">{announcement.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Announcements;