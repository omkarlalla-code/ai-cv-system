import React, { useState, useRef, useEffect } from 'react';
import './AIBrainstorm.css';

const AIBrainstorm = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m here to help you brainstorm ideas for your portfolio website. What would you like to discuss?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    'Help me choose a color scheme for my portfolio',
    'What sections should I include?',
    'How can I make my portfolio stand out?',
    'Suggest layout ideas for a developer portfolio',
    'What content should I highlight?',
    'How to organize my projects section?'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    // Add user message
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Add AI response
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('AI Brainstorm error:', error);

      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestion = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Chat cleared. What would you like to discuss?',
          timestamp: new Date()
        }
      ]);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page-container brainstorm-page">
      <div className="page-header">
        <div>
          <h1>AI Brainstorm</h1>
          <p className="page-subtitle">Get ideas and suggestions for your portfolio website</p>
        </div>
        <button onClick={handleClearChat} className="btn btn-outline">
          Clear Chat
        </button>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message message-${message.role} ${message.error ? 'error' : ''}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? '◉' : '◆'}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message message-assistant loading-message">
              <div className="message-avatar">◉</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (show when chat is empty or only has initial message) */}
        {messages.length <= 1 && (
          <div className="suggestions-container">
            <p className="suggestions-label">Try asking:</p>
            <div className="suggestions-grid">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestion(suggestion)}
                  className="suggestion-btn"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question or describe what you need help with..."
            className="chat-input"
            rows="3"
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage()}
            className="send-btn"
            disabled={!input.trim() || loading}
          >
            {loading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIBrainstorm;
