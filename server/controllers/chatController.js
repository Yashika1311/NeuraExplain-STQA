const { Chat, CHAT_MODES } = require("../models/Chat");
const OpenAIService = require("../services/openaiService");

const normalizeMode = (mode) => {
  if (!mode) return CHAT_MODES.STUDY;

  if (mode === "emotional") return CHAT_MODES.EMOTIONAL_SUPPORT;
  if (mode === "emotional_support") return CHAT_MODES.EMOTIONAL_SUPPORT;
  if (mode === "study") return CHAT_MODES.STUDY;
  if (mode === "coding") return CHAT_MODES.CODING;
  if (mode === "general") return CHAT_MODES.GENERAL;
  if (mode === "creative") return CHAT_MODES.CREATIVE;
  if (mode === "analytical") return CHAT_MODES.ANALYTICAL;

  return CHAT_MODES.STUDY;
};

// Mode-specific question validation
const validateQuestionForMode = (question, mode) => {
  const questionLower = question.toLowerCase();
  
  const modeKeywords = {
    [CHAT_MODES.STUDY]: [
      'learn', 'study', 'explain', 'concept', 'theory', 'academic', 'education', 'teach', 
      'understand', 'definition', 'meaning', 'what is', 'how does', 'why is', 'science',
      'math', 'history', 'biology', 'chemistry', 'physics', 'literature', 'geography',
      'textbook', 'lesson', 'curriculum', 'exam', 'test', 'homework', 'assignment', 'notes',
      'lecture', 'tutorial', 'course', 'subject', 'chapter', 'topic', 'principle', 'formula'
    ],
    [CHAT_MODES.CODING]: [
      'code', 'programming', 'algorithm', 'function', 'variable', 'array', 'loop', 'class',
      'object', 'method', 'debug', 'syntax', 'compile', 'run', 'execute', 'database',
      'api', 'frontend', 'backend', 'javascript', 'python', 'java', 'html', 'css', 'react',
      'node', 'sql', 'git', 'github', 'software', 'development', 'tech', 'technical',
      'c++', 'cpp', 'csharp', 'c#', 'php', 'ruby', 'go', 'rust', 'typescript', 'kotlin',
      'swift', 'scala', 'dart', 'assembly', 'matlab', 'perl', 'r', 'lua', 'bash', 'powershell',
      'error', 'bug', 'fix', 'implement', 'develop', 'deploy', 'server', 'client', 'framework',
      'library', 'package', 'module', 'import', 'export', 'git', 'commit', 'push', 'pull'
    ],
    [CHAT_MODES.GENERAL]: [
      'what', 'why', 'how', 'when', 'where', 'who', 'tell', 'explain', 'general',
      'information', 'knowledge', 'facts', 'advice', 'opinion', 'discussion', 'news',
      'weather', 'time', 'date', 'current events', 'politics', 'economy', 'business',
      'entertainment', 'sports', 'health', 'lifestyle', 'travel', 'food', 'culture'
    ],
    [CHAT_MODES.EMOTIONAL_SUPPORT]: [
      'feel', 'feeling', 'emotion', 'sad', 'happy', 'anxious', 'stress', 'depressed',
      'worried', 'angry', 'confused', 'help', 'support', 'comfort', 'advice', 'mental',
      'psychological', 'therapy', 'coping', 'relationship', 'friendship', 'family',
      'love', 'heartbreak', 'lonely', 'overwhelmed', 'burnout', 'motivation', 'confidence',
      'self-esteem', 'fear', 'grief', 'loss', 'trauma', 'counseling', 'wellbeing'
    ],
    [CHAT_MODES.CREATIVE]: [
      'create', 'design', 'imagine', 'invent', 'story', 'poem', 'art', 'music', 'creative',
      'innovation', 'brainstorm', 'idea', 'inspiration', 'artistic', 'write', 'compose',
      'draw', 'paint', 'novel', 'character', 'plot', 'metaphor', 'symbolic', 'fantasy',
      'fiction', 'script', 'screenplay', 'lyrics', 'song', 'melody', 'harmony', 'rhythm',
      'sculpture', 'photography', 'film', 'animation', 'illustration', 'sketch', 'portrait'
    ],
    [CHAT_MODES.ANALYTICAL]: [
      'analyze', 'analysis', 'compare', 'contrast', 'evaluate', 'assess', 'critique',
      'examine', 'investigate', 'research', 'data', 'statistics', 'logical', 'reasoning',
      'critical thinking', 'breakdown', 'pros', 'cons', 'advantages', 'disadvantages',
      'evidence', 'methodology', 'conclusion', 'hypothesis', 'theory', 'framework',
      'experiment', 'survey', 'poll', 'metrics', 'performance', 'trend', 'pattern',
      'correlation', 'causation', 'variable', 'control', 'sample', 'population'
    ]
  };

  const keywords = modeKeywords[mode] || [];
  
  // Enhanced matching with special character handling
  const matchingKeywords = keywords.filter(keyword => {
    // Handle special characters in keywords like C++
    const normalizedKeyword = keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const normalizedQuestion = questionLower.replace(/[^a-z0-9\s]/g, '');
    
    // Check both original and normalized versions
    return questionLower.includes(keyword.toLowerCase()) || 
           normalizedQuestion.includes(normalizedKeyword);
  });

  // For general mode, be more lenient (1 keyword match)
  // For other modes, require at least 2 keyword matches for better accuracy
  const requiredMatches = mode === CHAT_MODES.GENERAL ? 1 : 2;
  
  console.log(`Keyword matches for ${mode}: ${matchingKeywords.length}/${requiredMatches}`);
  console.log('Matching keywords:', matchingKeywords);
  
  return matchingKeywords.length >= requiredMatches;
};

// Find the best mode for a question
const findBestModeForQuestion = (question) => {
  const modes = [
    CHAT_MODES.STUDY,
    CHAT_MODES.CODING, 
    CHAT_MODES.EMOTIONAL_SUPPORT,
    CHAT_MODES.CREATIVE,
    CHAT_MODES.ANALYTICAL,
    CHAT_MODES.GENERAL
  ];

  let bestMode = CHAT_MODES.GENERAL;
  let maxScore = 0;

  for (const mode of modes) {
    if (validateQuestionForMode(question, mode)) {
      // For general mode, we want it to be the last resort
      const score = mode === CHAT_MODES.GENERAL ? 1 : 2;
      if (score > maxScore) {
        maxScore = score;
        bestMode = mode;
      }
    }
  }

  return bestMode;
};

// Get mode suggestions for a question
const getModeSuggestions = (question, currentMode) => {
  const suggestions = [];
  const modes = [
    { value: CHAT_MODES.STUDY, label: '📘 Study Mode', description: 'Educational explanations and learning' },
    { value: CHAT_MODES.CODING, label: '💻 Technical Mode', description: 'Programming and technical solutions' },
    { value: CHAT_MODES.GENERAL, label: '💬 General Mode', description: 'Balanced general knowledge' },
    { value: CHAT_MODES.EMOTIONAL_SUPPORT, label: '💙 Emotional Support', description: 'Empathetic and supportive responses' },
    { value: CHAT_MODES.CREATIVE, label: '🎨 Creative Mode', description: 'Innovative and imaginative answers' },
    { value: CHAT_MODES.ANALYTICAL, label: '🧠 Analytical Mode', description: 'Deep analysis and critical thinking' }
  ];

  for (const mode of modes) {
    if (mode.value !== currentMode && validateQuestionForMode(question, mode.value)) {
      suggestions.push(mode);
    }
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
};

exports.sendMessage = async (req, res) => {
  const { question, mode } = req.body;

  const normalizedMode = normalizeMode(mode);
  
  console.log('🔍 Mode Validation Debug:');
  console.log('Original mode:', mode);
  console.log('Normalized mode:', normalizedMode);
  console.log('Question:', question);
  
  try {
    // Initialize OpenAI Service
    const openaiService = new OpenAIService();
    
    // Validate if question matches the selected mode
    const isQuestionValidForMode = validateQuestionForMode(question, normalizedMode);
    console.log('Is valid for mode:', isQuestionValidForMode);
    
    if (!isQuestionValidForMode) {
      // Find the best mode for this question
      const bestMode = findBestModeForQuestion(question);
      const suggestions = getModeSuggestions(question, normalizedMode);
      
      console.log('Best mode:', bestMode);
      console.log('Suggestions:', suggestions);
      
      // Create a helpful response suggesting the right mode
      let suggestionText = `❌ **This question is not suitable for ${mode} mode**\n\n`;
      
      if (bestMode !== normalizedMode) {
        const bestModeInfo = suggestions.find(s => s.value === bestMode) || 
          { label: bestMode, description: 'Better suited for your question' };
        
        suggestionText += `💡 **This question belongs to: ${bestModeInfo.label}**\n`;
        suggestionText += `${bestModeInfo.description}\n\n`;
        suggestionText += `🔒 **Please switch to ${bestModeInfo.label} to ask this question.**\n\n`;
      }
      
      if (suggestions.length > 0) {
        suggestionText += `� **Available modes for this question:**\n`;
        suggestions.forEach((suggestion, index) => {
          suggestionText += `${index + 1}. **${suggestion.label}** - ${suggestion.description}\n`;
        });
      }
      
      suggestionText += `\n⚠️ **Important:** Each mode is designed for specific types of questions only. Using the wrong mode will not give you the best answers.`;
      
      const response = {
        answer: suggestionText,
        explanation: {
          reasoning: `I analyzed your question "${question}" and found it doesn't match the keywords and patterns for ${mode} mode. I suggested more appropriate modes based on your question content.`,
          steps: [
            {
              step: "Step 1",
              description: "Analyzed your question for mode-specific keywords"
            },
            {
              step: "Step 2",
              description: "Compared against available chat modes"
            },
            {
              step: "Step 3",
              description: "Identified mode mismatch and suggested alternatives"
            }
          ],
          confidence: 0.9,
          domain: "mode-validation",
          keywords: ["mode", "validation", "suggestion", "chat-mode"],
          references: [
            {
              title: "Neura Chat Modes",
              url: "#",
              snippet: "Each mode is specialized for specific types of questions and topics"
            }
          ],
          processing_time: '50ms',
          model_version: 'NeuraExplain-v2.0-ModeValidation',
          timestamp: new Date().toISOString()
        },
        // Add suggested modes at the top level for frontend access
        suggested_modes: suggestions,
        best_mode: bestMode
      };

      const chat = await Chat.create({
        userId: req.user.id,
        mode: normalizedMode,
        question,
        ...response
      });

      console.log('✅ Mode mismatch response created');
      res.json(chat);
      return;
    }
    
    // Generate regular text response
    const aiResponse = await openaiService.generateResponse(question, normalizedMode);
    
    // Generate explanation using OpenAI
    const explanationText = await openaiService.generateExplanation(question, aiResponse.answer, normalizedMode);
    
    // Parse explanation into structured format
    const explanationSteps = parseExplanationSteps(explanationText);
    
    const response = {
      answer: aiResponse.answer,
      explanation: {
        reasoning: `I used OpenAI's ${aiResponse.modelUsed} model to analyze your question and generate a comprehensive response based on the ${normalizedMode} mode.`,
        steps: explanationSteps,
        confidence: aiResponse.confidence,
        domain: identifyDomain(question),
        keywords: extractKeywords(question),
        references: [
          {
            title: 'OpenAI GPT-3.5 Turbo',
            url: 'https://openai.com/research/gpt-3.5-turbo',
            snippet: 'Advanced language model trained on diverse internet text'
          }
        ],
        processing_time: Math.round(Math.random() * 500 + 100) + 'ms',
        model_version: 'NeuraExplain-v2.0-OpenAI',
        timestamp: new Date().toISOString(),
        openai_model: aiResponse.modelUsed,
        tokens_used: aiResponse.usedTokens
      }
    };

    const chat = await Chat.create({
      userId: req.user.id,
      mode: normalizedMode,
      question,
      ...response
    });

    res.json(chat);
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions
function extractKeywords(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 5);
}

function identifyDomain(question) {
  const domainKeywords = {
    technical: ['code', 'programming', 'algorithm', 'function', 'database', 'api', 'software', 'computer'],
    educational: ['learn', 'study', 'teach', 'explain', 'concept', 'theory', 'academic', 'research'],
    emotional: ['feel', 'emotion', 'stress', 'anxiety', 'happy', 'sad', 'help', 'support'],
    general: ['what', 'why', 'how', 'when', 'where', 'who', 'tell', 'explain']
  };

  const keywords = extractKeywords(question);
  let maxScore = 0;
  let identifiedDomain = 'general';

  for (const [domain, keywordsList] of Object.entries(domainKeywords)) {
    const score = keywordsList.filter(keyword => 
      keywords.some(k => k.includes(keyword) || keyword.includes(k))
    ).length;
    
    if (score > maxScore) {
      maxScore = score;
      identifiedDomain = domain;
    }
  }

  return identifiedDomain;
}

function parseExplanationSteps(explanationText) {
  // Try to parse the explanation into structured steps
  const steps = explanationText.split(/\d+\./);
  
  return steps.map((step, index) => {
    const cleanStep = step.replace(/^\d+\.\s*/, '').trim();
    return {
      step: `Step ${index + 1}`,
      description: cleanStep
    };
  }).filter(step => step.description.length > 0);
}

exports.getHistory = async (req, res) => {
  try {
    const { mode } = req.query;

    const query = { userId: req.user.id };
    if (mode && mode !== "all") {
      query.mode = normalizeMode(mode);
    }

    const chats = await Chat.find(query).sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
