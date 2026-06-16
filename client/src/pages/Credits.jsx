import react from 'react'
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Credits = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const credits = [
    {
      title: 'Development',
      items: [
        { name: 'NeuraExplain Team', role: 'Core Development', icon: '👥' },
        { name: 'React', role: 'Frontend Framework', icon: '⚛️' },
        { name: 'Express.js', role: 'Backend Framework', icon: '🚀' },
        { name: 'MongoDB', role: 'Database', icon: '🍃' },
      ]
    },
    {
      title: 'Design & UI',
      items: [
        { name: 'Tailwind CSS', role: 'Styling Framework', icon: '🎨' },
        { name: 'Lucide Icons', role: 'Icon Library', icon: '✨' },
        { name: 'Navy Theme', role: 'Color Scheme', icon: '🌙' },
      ]
    },
    {
      title: 'Special Thanks',
      items: [
        { name: 'Open Source Community', role: 'Inspiration & Support', icon: '💝' },
        { name: 'Beta Testers', role: 'Feedback & Testing', icon: '🧪' },
        { name: 'You', role: 'Amazing User', icon: '🌟' },
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className={`px-4 py-2 rounded-lg border border-slate-700 ${location.pathname === '/chat' ? 'bg-blue-800 text-white' : 'bg-slate-950 text-slate-200 hover:bg-slate-900'}`}
          >
            💬 Chat
          </button>
          <button
            type="button"
            onClick={() => navigate('/community')}
            className={`px-4 py-2 rounded-lg border border-slate-700 ${location.pathname === '/community' ? 'bg-blue-800 text-white' : 'bg-slate-950 text-slate-200 hover:bg-slate-900'}`}
          >
            👥 Community
          </button>
          <button
            type="button"
            onClick={() => navigate('/credits')}
            className={`px-4 py-2 rounded-lg border border-slate-700 ${location.pathname === '/credits' ? 'bg-blue-800 text-white' : 'bg-slate-950 text-slate-200 hover:bg-slate-900'}`}
          >
            ⭐ Credits
          </button>
        </div>

        <h1 className={`text-4xl font-bold text-center mb-12 ${theme === 'dark' ? 'text-blue-200' : 'text-slate-900'}`}>
          🌟 Credits
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {credits.map((section, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-slate-900 bg-opacity-40' : 'bg-blue-50'}`}
            >
              <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                        {item.name}
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-12 p-6 rounded-xl text-center ${theme === 'dark' ? 'bg-slate-900 bg-opacity-50' : 'bg-blue-50'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-blue-200' : 'text-slate-900'}`}>
            Made with 💜
          </h2>
          <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            Thank you for being part of the NeuraExplain journey!
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <span className="text-3xl">🧠</span>
            <span className="text-3xl">💬</span>
            <span className="text-3xl">🌙</span>
            <span className="text-3xl">⭐</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;