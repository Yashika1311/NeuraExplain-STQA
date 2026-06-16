import { useState, useEffect, useRef } from 'react';
import { Brain, Code, Heart, BookOpen, Zap, MessageCircle, Cpu } from 'lucide-react';

export default function ModeSelector({ mode, setMode, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modes = [
    { 
      value: 'study', 
      label: '📘 Study Mode', 
      icon: BookOpen, 
      description: 'Educational explanations and learning',
      color: 'blue'
    },
    { 
      value: 'coding', 
      label: '💻 Technical Mode', 
      icon: Code, 
      description: 'Programming and technical solutions',
      color: 'green'
    },
    { 
      value: 'general', 
      label: '💬 General Mode', 
      icon: MessageCircle, 
      description: 'Balanced general knowledge',
      color: 'purple'
    },
    { 
      value: 'emotional_support', 
      label: '💙 Emotional Support', 
      icon: Heart, 
      description: 'Empathetic and supportive responses',
      color: 'pink'
    },
    { 
      value: 'creative', 
      label: '🎨 Creative Mode', 
      icon: Zap, 
      description: 'Innovative and imaginative answers',
      color: 'yellow'
    },
    { 
      value: 'analytical', 
      label: '🧠 Analytical Mode', 
      icon: Brain, 
      description: 'Deep analysis and critical thinking',
      color: 'indigo'
    }
  ];

  const selectedMode = modes.find(m => m.value === mode) || modes[0];

  const handleModeSelect = (modeValue) => {
    setMode(modeValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Custom dropdown button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg font-medium transition-colors bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          className || ''
        }`}
      >
        <selectedMode.icon size={18} />
        <span className="truncate">{selectedMode.label}</span>
        <Cpu size={16} className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[9999] max-h-80 overflow-y-auto min-w-[280px] max-w-[320px]">
          {modes.map((modeOption) => {
            const Icon = modeOption.icon;
            const isSelected = modeOption.value === mode;
            
            return (
              <button
                key={modeOption.value}
                type="button"
                onClick={() => handleModeSelect(modeOption.value)}
                className={`w-full flex items-start gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  isSelected ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm whitespace-nowrap ${
                    isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {modeOption.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {modeOption.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
