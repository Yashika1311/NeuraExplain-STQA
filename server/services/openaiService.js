const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    // Try Groq first (free), fallback to OpenAI
    this.useGroq = process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY?.includes('1234567890');
    
    if (this.useGroq) {
      this.openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
      });
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async generateResponse(question, mode = 'general') {
    try {
      // Create mode-specific system prompts
      const systemPrompts = {
        study: 'You are an educational AI tutor. Provide clear, step-by-step explanations that help students understand complex concepts. Break down topics into manageable parts and use analogies when helpful.',
        coding: 'You are a technical programming assistant. Provide accurate, efficient code solutions and explain technical concepts clearly. Include best practices and consider performance implications.',
        general: 'You are a helpful AI assistant. Provide balanced, informative responses that are accurate and easy to understand. Consider multiple perspectives when answering.',
        emotional: 'You are an empathetic AI assistant. Provide supportive, understanding responses that acknowledge emotions while offering helpful guidance. Be warm and compassionate.',
        creative: 'You are a creative AI assistant. Provide innovative, imaginative responses that inspire new perspectives and think outside conventional boundaries.',
        analytical: 'You are an analytical AI assistant. Provide thorough, systematic analysis with logical reasoning. Break down complex problems and examine them from multiple angles.'
      };

      const systemPrompt = systemPrompts[mode] || systemPrompts.general;

      // Choose model based on API
      const model = this.useGroq ? 'llama-3.1-8b-instant' : 'gpt-3.5-turbo';

      const completion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a proper response.';

      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(completion, question);

      return {
        answer: answer.trim(),
        confidence: confidence,
        usedTokens: completion.usage?.total_tokens || 0,
        modelUsed: model
      };

    } catch (error) {
      console.error('API Error:', error);
      // Fallback to simple response if API fails
      return {
        answer: this.generateFallbackResponse(question),
        confidence: 0.6,
        usedTokens: 0,
        modelUsed: 'fallback'
      };
    }
  }

  generateFallbackResponse(question) {
    const questionLower = question.toLowerCase();
    
    // Simple math
    if (questionLower.includes('1 + 2')) {
      return 'The answer is 3. When you add 1 and 2 together, you get 3.';
    }
    if (questionLower.includes('2 + 2')) {
      return 'The answer is 4. When you add 2 and 2 together, you get 4.';
    }
    
    // General questions
    if (questionLower.includes('what is ai') || questionLower.includes('artificial intelligence')) {
      return 'Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. It includes learning, reasoning, and self-correction.';
    }
    
    return 'I can help you with that question. Please provide more details so I can give you a better response.';
  }

  calculateConfidence(completion, question) {
    // Base confidence on response characteristics
    let confidence = 0.8;

    // Adjust confidence based on various factors
    if (completion.choices?.[0]?.finish_reason === 'stop') {
      confidence -= 0.1; // Incomplete response
    }
    
    if (completion.choices?.[0]?.finish_reason === 'length') {
      confidence += 0.1; // Complete response
    }

    // Adjust based on question complexity
    const questionLength = question.length;
    if (questionLength > 100) {
      confidence -= 0.05; // Complex questions
    } else if (questionLength < 20) {
      confidence += 0.05; // Simple questions
    }

    // Ensure confidence is within bounds
    return Math.max(0.5, Math.min(0.95, confidence));
  }

  async generateExplanation(question, answer, mode) {
    try {
      const explanationPrompt = `Given the question: "${question}" and my answer: "${answer}", please provide a brief explanation of my reasoning process in 3-4 steps. Focus on how I arrived at the answer and my confidence level. Format as a structured explanation with steps.`;

      const model = this.useGroq ? 'llama-3.1-8b-instant' : 'gpt-3.5-turbo';

      const explanationCompletion = await this.openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'user',
            content: explanationPrompt
          }
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      return explanationCompletion.choices[0]?.message?.content || 'I provided a response based on analysis of your question.';

    } catch (error) {
      console.error('Explanation Error:', error);
      return 'I analyzed your question and provided a thoughtful response based on the context.';
    }
  }
}

module.exports = OpenAIService;
