import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  MessageCircle, 
  Users, 
  Star, 
  ArrowRight, 
  Menu, 
  X, 
  ChevronDown, 
  Brain, 
  Lightbulb, 
  Target, 
  Shield, 
  Rocket,
  Play,
  Pause,
  Volume2,
  Image,
  Languages,
  Gamepad2,
  Palette,
  Crown,
  Check
} from 'lucide-react';

// Custom hook for counting animation
const useCountUp = (target, duration = 2000, delay = 0) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (target === 0 || hasAnimated.current) return;
    
    const timer = setTimeout(() => {
      hasAnimated.current = true;
      startTimeRef.current = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        countRef.current = Math.floor(easeOutQuart * target);
        
        setCount(countRef.current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return count;
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [subscriptionVisible, setSubscriptionVisible] = useState(false);
  const audioRef = useState(null);
  const navigate = useNavigate();

  // Counting animations for community stats
  const usersCount = useCountUp(communityVisible ? 10000 : 0, 2000, 0);
  const questionsCount = useCountUp(communityVisible ? 50000 : 0, 2500, 200);
  const answersCount = useCountUp(communityVisible ? 100000 : 0, 3000, 400);

  const toggleVoiceNote = () => {
    console.log('=== TOGGLE VOICE NOTE CALLED ===');
    console.log('Current isPlaying:', isPlaying);
    
    if (isPlaying) {
      // Stop speaking
      console.log('Stopping speech synthesis');
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }
    
    console.log('Starting speech synthesis...');
    
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
      alert('Speech synthesis is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    
    // Cancel any existing speech first
    window.speechSynthesis.cancel();
    
    // Mark user interaction for future auto-play
    setUserHasInteracted(true);
    
    // Start speaking using text-to-speech with female voice
    const text = "Hello there! I'm Neura, your friendly AI learning companion! I'm so excited to help you learn smarter, not harder. With my advanced AI capabilities, I can assist you with explanations, answer your questions, and provide personalized guidance. Together, we'll make your learning journey amazing and fun! Let's get started!";
    
    console.log('Available voices count:', window.speechSynthesis.getVoices().length);
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length === 0) {
      console.warn('No voices available, forcing a retry...');
      // Force voice loading
      setTimeout(() => {
        const retryVoices = window.speechSynthesis.getVoices();
        console.log('Retry - voices available:', retryVoices.length);
        if (retryVoices.length > 0) {
          createAndSpeak(retryVoices, text);
        } else {
          alert('No voices are available on your system. Please check your browser settings and refresh the page.');
        }
      }, 200);
      return;
    }
    
    createAndSpeak(voices, text);
  };

  const createAndSpeak = (voices, text) => {
    console.log('=== CREATE AND SPEAK ===');
    console.log('Voices available:', voices.length);
    console.log('All voices:', voices.map(v => ({ name: v.name, lang: v.lang, gender: v.gender })));
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for softer delivery
    utterance.pitch = 1.4; // Higher pitch for more feminine sound
    utterance.volume = 0.8; // Softer volume for gentler sound
    
    // Priority order for female voices (softest first)
    const femaleVoicePriority = [
      'Samantha',    // macOS - soft, natural female voice
      'Karen',       // macOS - gentle female voice  
      'Moira',       // macOS - soft Scottish female voice
      'Tessa',       // macOS - soft female voice
      'Nicky',       // macOS - gentle female voice
      'Allison',     // macOS - soft female voice
      'Ava',         // macOS - gentle female voice
      'Susan',       // Windows - soft female voice
      'Zira',        // Windows - gentle female voice
      'Microsoft Hazel', // Windows - soft female voice
      'Google US English Female', // Chrome - soft female voice
      'English United States', // Some systems - soft female
      'Female'       // Generic female
    ];
    
    let selectedVoice = null;
    
    // Try to find female voice by priority list
    for (const femaleName of femaleVoicePriority) {
      const voice = voices.find(v => v.name.includes(femaleName));
      if (voice) {
        selectedVoice = voice;
        console.log('Found female voice by priority:', voice.name);
        break;
      }
    }
    
    // If not found by priority, search for any voice with female indicators
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('girl') ||
        voice.gender === 'female'
      );
      console.log('Found female voice by indicators:', selectedVoice?.name);
    }
    
    // Avoid obviously male voices
    if (!selectedVoice) {
      const maleVoices = ['alex', 'daniel', 'david', 'fred', 'mark', 'robert', 'thomas', 'aaron', 'ben', 'charlie', 'damon', 'eric', 'frank', 'george', 'henry', 'ian', 'jason', 'kevin', 'liam', 'matt', 'noah', 'oliver', 'paul', 'quinn', 'ryan', 'sam', 'tom', 'victor', 'will', 'xavier', 'yannick', 'zach'];
      selectedVoice = voices.find(voice => 
        !maleVoices.some(maleName => voice.name.toLowerCase().includes(maleName))
      );
      console.log('Found non-male voice:', selectedVoice?.name);
    }
    
    // Final fallback to first available voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
      console.log('Using first available voice as fallback:', selectedVoice.name);
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('✅ Selected soft female voice:', selectedVoice.name, 'Language:', selectedVoice.lang, 'Gender:', selectedVoice.gender || 'unknown');
      console.log('🎤 Voice settings - Rate: 0.9 (slower), Pitch: 1.4 (higher), Volume: 0.8 (softer)');
    } else {
      console.warn('❌ No voices available');
      alert('No voices are available on your system. Please check your browser settings.');
      return;
    }
    
    // Set up event handlers for better debugging
    utterance.onstart = () => {
      console.log('🎤 Speech started');
      setIsPlaying(true);
    };
    
    utterance.onend = () => {
      console.log('🏁 Speech ended');
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    utterance.onerror = (event) => {
      console.error('❌ Speech error:', event.error);
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Handle specific errors gracefully
      if (event.error === 'network') {
        console.log('🌐 Network error - some browsers need internet for voice synthesis');
      } else if (event.error === 'not-allowed') {
        console.log('🔒 Permission denied - user may need to enable voice synthesis');
      }
    };
    
    console.log('Calling speechSynthesis.speak()...');
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('❌ Error calling speak():', error);
      setIsPlaying(false);
    }
  };

  // Intersection Observer for all sections animation and voice
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          console.log('Intersection Observer - Section:', id, 'isIntersecting:', entry.isIntersecting, 'isPlaying:', isPlaying, 'userHasInteracted:', userHasInteracted);
          
          // Handle animations - only trigger when section is visible
          if (entry.isIntersecting) {
            if (id === 'community') setCommunityVisible(true);
            if (id === 'hero') setHeroVisible(true);
            if (id === 'features') setFeaturesVisible(true);
            if (id === 'about') setAboutVisible(true);
            if (id === 'subscription') setSubscriptionVisible(true);
          }
          
          // Handle voice auto-play for About section
          if (id === 'about') {
            if (entry.isIntersecting && !isPlaying && userHasInteracted) {
              // Section is visible and not playing - start voice from beginning
              console.log('🎯 About section entered - starting voice from beginning');
              // Cancel any existing speech first
              window.speechSynthesis.cancel();
              setIsPlaying(false);
              setCurrentTime(0);
              // Start fresh voice after a small delay
              setTimeout(() => {
                if (!isPlaying) { // Double check we're not already playing
                  toggleVoiceNote();
                }
              }, 500);
            } else if (!entry.isIntersecting && isPlaying) {
              // Section is not visible and currently playing - stop voice
              console.log('🚪 About section exited - stopping voice');
              window.speechSynthesis.cancel();
              setIsPlaying(false);
              setCurrentTime(0);
            } else if (entry.isIntersecting && !userHasInteracted) {
              // Section is visible but user hasn't interacted yet - just log
              console.log('👀 About section visible but waiting for user interaction');
            }
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of the section is visible
        rootMargin: '0px'
      }
    );

    // Observe all sections
    const sections = ['community', 'hero', 'features', 'about', 'subscription'];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
        console.log(`✅ Intersection Observer attached to ${sectionId} section`);
      } else {
        console.warn(`❌ ${sectionId} section not found`);
      }
    });

    return () => {
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          observer.unobserve(element);
        }
      });
      console.log('🧹 Intersection Observer cleaned up');
    };
  }, [isPlaying, userHasInteracted]);

  // Track user interaction for auto-play permissions
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!userHasInteracted) {
        setUserHasInteracted(true);
        console.log('User interaction detected - auto-play now allowed');
        // Show a brief toast or indicator that voice is now ready
        console.log('🎤 Voice is now ready! Scroll to About section to hear Neura.');
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'keydown', 'touchstart', 'mousedown', 'pointerdown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: false });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [userHasInteracted]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Load voices when component mounts
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    // Initial load
    loadVoices();
    
    // Listen for voices changed event (some browsers load voices asynchronously)
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Smart AI Modes",
      description: "Choose from multiple AI modes tailored for different learning styles and needs",
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Interactive Chat",
      description: "Engage in meaningful conversations with our advanced AI assistant",
      gradient: "from-cyan-400 to-blue-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Learning",
      description: "Connect with learners, share knowledge, and grow together",
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Search",
      description: "Find exactly what you need with intelligent search capabilities",
      gradient: "from-sky-400 to-blue-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safe & Secure",
      description: "Your data and privacy are protected with enterprise-grade security",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Experience blazing-fast responses and seamless interactions",
      gradient: "from-cyan-500 to-blue-600"
    }
  ];

  const modes = [
    {
      name: "Learning Mode",
      description: "Perfect for students and educational content",
      color: "bg-blue-500",
      icon: <Brain className="w-6 h-6" />
    },
    {
      name: "Creative Mode", 
      description: "Unleash your creativity with AI assistance",
      color: "bg-cyan-500",
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      name: "Professional Mode",
      description: "Optimized for business and professional tasks",
      color: "bg-indigo-500",
      icon: <Target className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/src/assets/bglanding.png")' }}
        />
        
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/30 via-cyan-800/20 to-indigo-900/30" />
        
        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-blue-900/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-cyan-400" />
                <span className="text-2xl font-bold text-white">
                  Neura
                </span>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-white/90 hover:text-white transition-colors">Features</a>
                <a href="#about" className="text-white/90 hover:text-white transition-colors">About</a>
                <a href="#modes" className="text-white/90 hover:text-white transition-colors">Modes</a>
                <a href="#community" className="text-white/90 hover:text-white transition-colors">Community</a>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>

              <button 
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black/50 backdrop-blur-md border-t border-white/20">
              <div className="px-4 py-2 space-y-2">
                <a href="#features" className="block py-2 text-white">Features</a>
                <a href="#about" className="block py-2 text-white">About</a>
                <a href="#modes" className="block py-2 text-white">Modes</a>
                <a href="#community" className="block py-2 text-white">Community</a>
                <Link to="/login" className="block py-2 text-white">Login</Link>
                <Link to="/register" className="block py-2 text-white">Sign Up</Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Content */}
        <div id="hero" className="relative z-10 text-center px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className={`inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full mb-6 border border-cyan-400/30 transition-all duration-1000 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <Sparkles className="w-4 h-4 text-cyan-300 mr-2" />
                <span className="text-cyan-200 text-sm font-medium">Powered by Advanced AI</span>
              </div>
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-1000 delay-200 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <span className="text-white">
                  Learn Smarter,
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
                  Not Harder
                </span>
              </h1>
              <p className={`text-xl text-white/80 mb-8 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                Experience the future of learning with Neura. Choose your mode, ask anything, 
                and get instant answers from our intelligent AI assistant.
              </p>
              <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${
                heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-cyan-400/30 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center text-white">
                  Watch Demo
                  <Star className="ml-2 w-5 h-5 text-cyan-400" />
                </button>
              </div>
            </div>

            <div className="mt-16">
              <ChevronDown className="w-8 h-8 text-white/60 mx-auto animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${
            featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-4xl font-bold mb-4 text-white">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
                {" "}Succeed
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Powerful features designed to enhance your learning experience and boost productivity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`group relative p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2 ${
                  featuresVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-12'
                }`}
                style={{
                  transitionDelay: featuresVisible ? `${index * 150}ms` : '0ms'
                }}
              >
                <div className={`inline-flex p-3 rounded-xl bg-linear-to-r ${feature.gradient} text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Neura Section */}
      <section id="about" className="py-20 bg-linear-to-br from-slate-900 via-blue-900/50 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`order-2 lg:order-1 transition-all duration-1000 ${
              aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <img
                      src="/src/assets/Neura.png"
                      alt="Neura Robot"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-center text-white/70 italic mb-6">
                  Meet Neura - Your friendly AI learning companion!
                </p>
                
                {/* Voice Note Player */}
                <div className="bg-linear-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-6 border-2 border-cyan-400/30 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-5 h-5 text-cyan-300" />
                      <span className="text-base font-medium text-white">Voice Message from Neura</span>
                    </div>
                    <span className="text-sm text-cyan-200 font-medium">{currentTime}s / {duration}s</span>
                  </div>
                  
                  {!userHasInteracted && (
                    <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                      <p className="text-xs text-yellow-200 text-center">
                        💡 Click anywhere on the page to enable voice, then scroll here!
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={toggleVoiceNote}
                      className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>{userHasInteracted ? "Play Message" : "Enable & Play"}</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-white/60">
                      {isPlaying ? "🎵 Neura is speaking..." : userHasInteracted ? "🎧 Click to hear Neura's greeting!" : "🎧 Click anywhere on page first, then here to play!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`order-1 lg:order-2 transition-all duration-1000 delay-300 ${
              aboutVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
              <h2 className="text-4xl font-bold mb-6 text-white">
                About
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
                  {" "}Neura
                </span>
              </h2>
              <p className="text-lg text-white/70 mb-6">
                Neura is your intelligent AI learning companion, designed to make education more accessible, 
                engaging, and effective. Powered by advanced artificial intelligence, Neura understands your 
                learning style and adapts to your needs.
              </p>
              <p className="text-lg text-white/70 mb-8">
                Whether you're studying for exams, learning new skills, or exploring complex topics, 
                Neura provides personalized guidance, instant answers, and comprehensive explanations 
                to help you achieve your learning goals.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">24/7</div>
                  <div className="text-sm text-white/70">Availability</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-blue-400 mb-1">AI-Powered</div>
                  <div className="text-sm text-white/70">Intelligence</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-indigo-400 mb-1">Personalized</div>
                  <div className="text-sm text-white/70">Learning</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-purple-400 mb-1">Expert</div>
                  <div className="text-sm text-white/70">Guidance</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all">
                  Learn More
                </button>
                <button 
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  View Features
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modes Section */}
      <section id="modes" className="py-20 bg-linear-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Choose Your
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                {" "}Learning Mode
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Different modes for different needs. Switch seamlessly between learning styles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {modes.map((mode, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-3"
              >
                <div className={`inline-flex p-4 rounded-xl ${mode.color} text-white mb-6`}>
                  {mode.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{mode.name}</h3>
                <p className="text-white/70 mb-6">{mode.description}</p>
                <button 
                  onClick={() => {
                    const modeMap = {
                      "Learning Mode": "study",
                      "Creative Mode": "creative", 
                      "Professional Mode": "analytical"
                    };
                    const selectedMode = modeMap[mode.name];
                    navigate(`/login?mode=${selectedMode}&redirect=chat`);
                  }}
                  className="w-full py-3 border-2 border-white/30 rounded-lg hover:border-white/50 hover:bg-white/10 transition-all font-medium text-white"
                >
                  Try {mode.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-linear-to-br from-indigo-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-white">
                Join Our
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400">
                  {" "}Community
                </span>
              </h2>
              <p className="text-xl text-white/70 mb-8">
                Connect with thousands of learners, share your knowledge, and grow together in our vibrant community.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-cyan-400 mr-3" />
                  <span className="text-lg text-white">10,000+ Active Learners</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-lg text-white">24/7 Discussion Forums</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-cyan-300 mr-3" />
                  <span className="text-lg text-white">Expert-Led Sessions</span>
                </div>
              </div>
              <Link 
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Join Community
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-cyan-400">
                    {usersCount > 0 ? `${usersCount.toLocaleString()}+` : '0+'}
                  </div>
                  <div className="text-sm text-white/70">Users</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-blue-400">
                    {questionsCount > 0 ? `${questionsCount.toLocaleString()}+` : '0+'}
                  </div>
                  <div className="text-sm text-white/70">Questions</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-indigo-400">
                    {answersCount > 0 ? `${answersCount.toLocaleString()}+` : '0+'}
                  </div>
                  <div className="text-sm text-white/70">Answers</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold text-cyan-300">
                    24/7
                  </div>
                  <div className="text-sm text-white/70">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Model Section */}
      <section id="subscription" className={`py-20 bg-linear-to-br from-purple-900 via-indigo-900 to-purple-900 relative overflow-hidden transition-all duration-1000 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-purple-400 to-pink-400 rounded-full mb-6 transition-all duration-700 ${subscriptionVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-700 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Neura <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Premium</span> Coming Soon
            </h2>
            <p className={`text-xl text-purple-200 max-w-3xl mx-auto transition-all duration-700 delay-100 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              Unlock the full potential of AI-powered learning with our premium subscription. 
              Experience advanced features designed to make your learning journey extraordinary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Image Generation */}
            <div className={`bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-700 transform hover:scale-105 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '200ms'}}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-linear-to-r from-pink-400 to-purple-400 rounded-xl flex items-center justify-center mb-6">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">AI Image Generation</h3>
                <p className="text-purple-200">
                  Create stunning images with AI. Generate custom visuals for your projects, presentations, and creative work.
                </p>
              </div>
            </div>

            {/* Multi-Language Search */}
            <div className={`bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-700 transform hover:scale-105 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '300ms'}}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-linear-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mb-6">
                  <Languages className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Multi-Language Search</h3>
                <p className="text-purple-200">
                  Search and learn in your preferred language. Access knowledge in over 50 languages with accurate translations.
                </p>
              </div>
            </div>

            {/* Multi-Language Voice Search */}
            <div className={`bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-700 transform hover:scale-105 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '400ms'}}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-linear-to-r from-green-400 to-teal-400 rounded-xl flex items-center justify-center mb-6">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Voice Search Any Language</h3>
                <p className="text-purple-200">
                  Speak your questions in any language and get instant answers. Perfect for hands-free learning on the go.
                </p>
              </div>
            </div>

            {/* Credit Games */}
            <div className={`bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-700 transform hover:scale-105 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{transitionDelay: '500ms'}}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-linear-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center mb-6">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Learn & Earn Credits</h3>
                <p className="text-purple-200">
                  Play educational games to earn credits. Challenge yourself while reinforcing your knowledge.
                </p>
              </div>
            </div>
          </div>

          <div className={`text-center transition-all duration-700 delay-600 ${subscriptionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-linear-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md p-8 rounded-2xl border border-purple-400/30">
              <h3 className="text-2xl font-bold text-white mb-4">Be the First to Experience Premium</h3>
              <p className="text-purple-200 mb-6">
                Join our waitlist and get exclusive early access to Neura Premium features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  className="px-8 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
                  onClick={() => navigate('/register')}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Join Waitlist
                </button>
                <div className="flex items-center text-purple-200">
                  <Check className="w-5 h-5 mr-2 text-green-400" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of students and professionals who are already learning smarter with Neura
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Start Free Trial
            </button>
            <Link 
              to="/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
                <span className="text-xl font-bold">Neura</span>
              </div>
              <p className="text-white/70">
                Making learning smarter, faster, and more enjoyable for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#modes" className="hover:text-white transition-colors">Modes</a></li>
                <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/credits" className="hover:text-white transition-colors">About</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/70">
            <p>&copy; 2024 Neura. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
