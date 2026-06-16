import { useState, useEffect, useContext, useMemo, useRef } from "react";
import API from "../api";
import ModeSelector from "../components/ModeSelector";
import ExplanationPanel from "../components/ExplanationPanel";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Sparkles, Plus, RefreshCw, Mic, MicOff } from "lucide-react";
import "./Chat.css";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("study");
  const [chats, setChats] = useState([]);
  const [sessionChats, setSessionChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activePanel, setActivePanel] = useState("chats");
  const [selectedHistoryMode, setSelectedHistoryMode] = useState("all"); // New state for history mode filter
  const [refreshingHistory, setRefreshingHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const messagesEndRef = useRef(null);

  const { logout, user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Mode definitions for history filtering
  const modeOptions = [
    { value: 'all', label: '📚 All Chats', icon: '💬', color: 'gray' },
    { value: 'study', label: '📘 Study Mode', icon: '📖', color: 'blue' },
    { value: 'coding', label: '💻 Technical Mode', icon: '💻', color: 'green' },
    { value: 'general', label: '💬 General Mode', icon: '💭', color: 'purple' },
    { value: 'emotional_support', label: '💙 Emotional Support', icon: '💝', color: 'pink' },
    { value: 'creative', label: '🎨 Creative Mode', icon: '🎨', color: 'yellow' },
    { value: 'analytical', label: '🧠 Analytical Mode', icon: '🧠', color: 'indigo' }
  ];

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        console.log('📚 Loading chat history...');
        const params = {};
        if (selectedHistoryMode !== 'all') params.mode = selectedHistoryMode;
        const res = await API.get("/chat/history", { params });
        console.log(`✅ Loaded ${res.data.length} chats from MongoDB`);
        setChats(res.data);
      } catch (err) {
        console.error('❌ Error loading chat history:', err);
        // Show user-friendly error
        if (err.response?.status === 401) {
          console.log('🔐 User not authenticated, redirecting to login...');
        } else {
          console.log('📡 Network error, chat history will load when connection is restored');
        }
      }
    };
    
    // Only load history if user is available
    if (user) {
      loadHistory();
    }
  }, [user, selectedHistoryMode]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        console.log('🎤 Voice result:', transcript);
        setQuestion(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access to use voice search.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else {
          alert('Voice recognition error. Please try again.');
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.log('🎤 Speech recognition not supported');
    }
  }, []);

  // Manual refresh function
  const refreshHistory = async () => {
    setRefreshingHistory(true);
    try {
      console.log('🔄 Manually refreshing chat history...');
      const params = {};
      if (selectedHistoryMode !== 'all') params.mode = selectedHistoryMode;
      const res = await API.get("/chat/history", { params });
      console.log(`✅ Refreshed ${res.data.length} chats from MongoDB`);
      setChats(res.data);
    } catch (err) {
      console.error('❌ Error refreshing chat history:', err);
      alert('Failed to refresh chat history. Please try again.');
    } finally {
      setRefreshingHistory(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chats, sessionChats, activeChatId, activePanel, loading]);

  const modeLabel = useMemo(() => {
    switch (mode) {
      case "study":
        return "Study Mode";
      case "coding":
        return "Technical Mode";
      case "general":
        return "General Mode";
      case "emotional_support":
        return "Emotional Support";
      case "creative":
        return "Creative Mode";
      case "analytical":
        return "Analytical Mode";
      default:
        return "Mode";
    }
  }, [mode]);

  const displayedChats = useMemo(() => {
    if (activeChatId) {
      const selected = chats.find((c) => c._id === activeChatId);
      return selected ? [selected] : [];
    }
    if (sessionChats.length > 0) return sessionChats;
    return [];
  }, [activeChatId, activePanel, chats, sessionChats]);

  const filteredHistory = useMemo(() => {
    if (!chats.length) return {};
    
    let filtered = chats;
    
    // Apply mode filter
    if (selectedHistoryMode !== 'all') {
      filtered = filtered.filter((chat) => chat.mode === selectedHistoryMode);
    }
    
    // Group by mode
    const grouped = {};
    filtered.forEach((chat) => {
      if (!grouped[chat.mode]) {
        grouped[chat.mode] = [];
      }
      grouped[chat.mode].push(chat);
    });
    
    return grouped;
  }, [chats, selectedHistoryMode]);

  const handleNewChat = () => {
    setActivePanel("chats");
    setActiveChatId(null);
    setSessionChats([]);
    setQuestion("");
  };

  const handleSelectHistory = (id) => {
    setActivePanel("chats");
    setActiveChatId(id);
    setSessionChats([]);
  };

  const sendMessage = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      console.log('📤 Sending message to backend...', { question, mode });
      const res = await API.post("/chat/send", { question, mode });
      console.log('✅ Message saved to MongoDB, response received');
      console.log('🔍 Response data:', { 
        domain: res.data.explanation?.domain, 
        suggested_modes: res.data.suggested_modes,
        isImageGeneration: res.data.isImageGeneration 
      });
      
      // Check if this is a mode mismatch response (but not for image generation suggestions)
      if (res.data.explanation?.domain === "mode-validation" && res.data.suggested_modes?.length > 0) {
        console.log('🔄 Mode validation detected, suggesting mode switch');
        // Show mode suggestions to user
        const suggestedMode = res.data.best_mode || res.data.suggested_modes[0];
        const suggestedModeInfo = res.data.suggested_modes.find(m => m.value === suggestedMode) || 
          { label: suggestedMode.replace('_', ' '), description: 'Better suited for your question' };
        
        // Create a more informative confirmation dialog
        const shouldSwitch = window.confirm(
          `❌ Mode Mismatch!\n\n` +
          `Your question doesn't fit the current "${modeLabel}".\n\n` +
          `💡 Recommended: ${suggestedModeInfo.label}\n` +
          `${suggestedModeInfo.description}\n\n` +
          `Would you like to switch to ${suggestedModeInfo.label} and ask again?`
        );
        
        if (shouldSwitch) {
          setMode(suggestedMode);
          // Automatically send the question with the new mode
          setTimeout(() => {
            sendMessage();
          }, 100);
          return;
        }
      }
      
      // Check if this is an image generation mode suggestion
      if (res.data.explanation?.domain === "mode-suggestion" && res.data.suggested_modes?.length > 0) {
        console.log('🎨 Image generation mode suggestion detected');
        // Show mode suggestions to user for image generation
        const suggestedMode = res.data.best_mode || res.data.suggested_modes[0];
        
        // Ask user if they want to switch to Creative Mode
        const shouldSwitch = window.confirm(
          `Image generation is available in Creative Mode! Would you like to switch to Creative Mode and generate your image?`
        );
        
        if (shouldSwitch) {
          setMode(suggestedMode);
          // Automatically send the question with the new mode
          setTimeout(() => {
            sendMessage();
          }, 100);
          return;
        }
      }
      
      // Check if this is an actual image generation response
      if (res.data.isImageGeneration) {
        console.log('🎨 Image generation response received!');
      }
      
      // Update both local state and MongoDB data
      setChats((prev) => [...prev, res.data]);
      setSessionChats((prev) => [...prev, res.data]);
      setQuestion("");
      console.log('💾 Chat history updated locally and in MongoDB');
    } catch (err) {
      console.error('❌ Error sending message:', err);
      if (err.response?.status === 401) {
        alert('Please login again to continue chatting');
      } else {
        alert('Failed to send message. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Voice search functions
  const startListening = () => {
    if (recognition) {
      recognition.start();
    } else {
      alert('Voice recognition is not supported in your browser. Please try Chrome or Edge.');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Background image mapping for different modes
  const getBackgroundImage = useMemo(() => {
    switch (mode) {
      case "study":
        return 'url("/studymode.jpg")';
      case "coding":
        return 'url("/technical bg.jpg")';
      case "general":
        return 'url("/bg2.jpg")';
      case "emotional_support":
        return 'url("/emotional bg.jpg")';
      case "creative":
        return 'url("/creative bg.jpg")';
      case "analytical":
        return 'url("/analytical bg.jpg")';
      default:
        return 'url("/bg2.jpg")';
    }
  }, [mode]);

  return (
    <div className={`chatPage ${theme === "dark" ? "dark" : ""}`}>
      <div className="chatShell">
        <div className="chatHeader">
          <div className="chatHeaderTitle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
                <img
                  src="/Neura.png"
                  alt="Neura Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1>Neura</h1>
                <p>Your AI learning companion — ask anything, anytime.</p>
              </div>
            </div>
          </div>

          <div className="chatHeaderActions">
            <span className="chatPill">
              <Sparkles size={14} />
              {modeLabel}
            </span>

            <button onClick={handleLogout} className="chatLogoutButton" type="button">
              <span className="inline-flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </span>
            </button>
          </div>
        </div>

        <div className="chatBody">
          <div className="chatLayout">
            <aside className="chatSidebar">
              <div className="chatSidebarInner">
                <div className="chatSidebarActions">
                  <button
                    type="button"
                    className={`chatActionButton ${location.pathname === "/chat" ? "chatActionButtonPrimary" : ""}`}
                    onClick={() => {
                      setActivePanel("chats");
                      setActiveChatId(null);
                      navigate("/chat");
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      💬 Chat
                    </span>
                    <span />
                  </button>

                  <button
                    type="button"
                    className={`chatActionButton ${location.pathname === "/community" ? "chatActionButtonPrimary" : ""}`}
                    onClick={() => navigate("/community")}
                  >
                    <span className="inline-flex items-center gap-2">
                      👥 Community
                    </span>
                    <span />
                  </button>

                  <button
                    type="button"
                    className={`chatActionButton ${location.pathname === "/credits" ? "chatActionButtonPrimary" : ""}`}
                    onClick={() => navigate("/credits")}
                  >
                    <span className="inline-flex items-center gap-2">
                      ⭐ Credits
                    </span>
                    <span />
                  </button>
                </div>

                <div className="chatSidebarActions">
                  <button
                    type="button"
                    className="chatActionButton chatActionButtonPrimary"
                    onClick={handleNewChat}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Plus size={18} />
                      New chat
                    </span>
                    <span />
                  </button>
                </div>

                {/* Mode Filter for History */}
                <div className="mb-3">
                  <select
                    value={selectedHistoryMode}
                    onChange={(e) => setSelectedHistoryMode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {modeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="chatHistoryHeader">
                  <div className="chatHistoryTitle">
                    {modeOptions.find(m => m.value === selectedHistoryMode)?.label || 'Chats'}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500">
                      {Object.values(filteredHistory).reduce((acc, chats) => acc + chats.length, 0)} chats
                      <span className="ml-1 text-green-500">💾</span>
                    </div>
                    <button
                      onClick={refreshHistory}
                      disabled={refreshingHistory}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                      title="Refresh chat history"
                    >
                      <RefreshCw size={14} className={refreshingHistory ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                <div className="chatHistoryList">
                  {Object.entries(filteredHistory).length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                      No chats in this mode yet
                    </div>
                  ) : (
                    Object.entries(filteredHistory).map(([mode, modeChats]) => {
                      const modeInfo = modeOptions.find(m => m.value === mode);
                      
                      return (
                        <div key={mode} className="mb-4">
                          {/* Mode Header */}
                          {selectedHistoryMode === 'all' && (
                            <div className={`mode-header mode-section-${mode} px-3 py-2 text-xs font-semibold rounded-t-lg`}>
                              {modeInfo?.icon} {modeInfo?.label}
                              <span className="ml-2 text-xs opacity-75">({modeChats.length})</span>
                            </div>
                          )}
                          
                          {/* Chat Items for this mode */}
                          <div className={selectedHistoryMode === 'all' ? `mode-content mode-section-${mode} rounded-b-lg` : ''}>
                            {modeChats.map((c) => (
                              <button
                                key={c._id}
                                type="button"
                                className={`chatHistoryItem ${
                                  activeChatId === c._id ? "chatHistoryItemActive" : ""
                                }`}
                                onClick={() => handleSelectHistory(c._id)}
                              >
                                <div className="chatHistoryQuestion">{c.question || "(No question)"}</div>
                                <div className="chatHistoryMeta">
                                  {c.answer ? c.answer.substring(0, 100) + (c.answer.length > 100 ? "..." : "") : ""}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {new Date(c.createdAt).toLocaleDateString()}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="chatProfileCard">
                  <div className="chatProfileAvatar">
                    {String(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="chatProfileMeta">
                    <div className="chatProfileName">{user?.name || "Profile"}</div>
                    <div className="chatProfileEmail">{user?.email || ""}</div>
                  </div>
                  <div className="ml-auto">
                    <span aria-hidden>👤</span>
                  </div>
                </div>
              </div>
            </aside>

            <section 
              className="chatMain"
              style={{
                backgroundImage: getBackgroundImage,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="chatMessages">
                {displayedChats.length === 0 ? (
                  <div className="chatEmptyState">
                    <h2>Start a conversation</h2>
                    <p>
                      Click <b>New chat</b> or pick a previous chat on the left. Then choose a mode and ask your
                      first question.
                    </p>
                  </div>
                ) : (
                  displayedChats.map((chat, i) => (
                    <div key={chat._id || i} className="flex flex-col gap-3">
                      <div className="chatRow user">
                        <div className="chatBubble user">
                          <div className="chatBubbleHeader">
                            <div className="chatBubbleLabel">
                              <span className="chatAvatar user">Y</span>
                              You
                            </div>
                            <span className="chatBubbleTime">{modeLabel}</span>
                          </div>
                          <div className="chatBubbleText">{chat.question}</div>
                        </div>
                      </div>

                      <div className="chatRow ai">
                        <div className="chatBubble">
                          <div className="chatBubbleHeader">
                            <div className="chatBubbleLabel">
                              <span className="chatAvatar ai">N</span>
                              AI
                            </div>
                          </div>
                          <div className="chatBubbleText">{chat.answer}</div>
                          <ExplanationPanel explanation={chat.explanation} />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {loading ? <div className="chatTyping">AI is typing...</div> : null}
                <div ref={messagesEndRef} />
              </div>

              <div className="chatComposer">
                  <ModeSelector mode={mode} setMode={setMode} className="chatSelect" />

                  <div className="chatInputContainer">
                    <input
                      className="chatInput"
                      placeholder={isListening ? "Listening..." : "Ask something..."}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                      }}
                      disabled={loading}
                    />
                    
                    <button
                      onClick={toggleListening}
                      className={`chatVoiceButton ${isListening ? 'chatVoiceButtonActive' : ''}`}
                      type="button"
                      disabled={loading}
                      title={isListening ? "Stop recording" : "Start voice search"}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  </div>

                  <button
                    onClick={sendMessage}
                    className="chatSendButton"
                    type="button"
                    disabled={loading || !question.trim()}
                  >
                    Send
                  </button>
                </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
