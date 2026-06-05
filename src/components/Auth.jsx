import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Auth.css';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('mwcf-theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('mwcf-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Validation
    if (!email || !validateEmail(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({ 
          email: email.toLowerCase(), 
          password 
        });
      } else {
        result = await supabase.auth.signUp({ 
          email: email.toLowerCase(), 
          password,
          options: {
            data: {
              church: 'Mighty Warrior Christian Fellowship'
            }
          }
        });
      }

      if (result.error) {
        setMessage(result.error.message || 'Authentication failed');
        setMessageType('error');
      } else if (!isLogin) {
        setMessage('✅ Check your email for confirmation!');
        setMessageType('success');
        // Clear form
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setMessage(err.message || 'Something went wrong. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-wrapper">
      <button className="theme-toggle" onClick={toggleMode} aria-label="Toggle theme">
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className="auth-container">
        <div className="auth-card">
          {/* Decorative chord lines */}
          <div className="chord-accent"></div>
          <div className="chord-accent chord-accent-2"></div>

          {/* Logo & Branding */}
          <div className="auth-header">
            <div className="logo-wrapper">
              <span className="logo-icon">🎵</span>
            </div>
            <h1 className="auth-title">MWCF CHORDS</h1>
            <p className="auth-subtitle">Mighty Warrior Christian Fellowship</p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete={isLogin ? 'email' : 'off'}
                required
              />
              <div className="input-underline"></div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
              <div className="input-underline"></div>
            </div>

            {message && (
              <div className={`message-box message-${messageType}`}>
                <span className="message-icon">
                  {messageType === 'success' ? '✓' : '⚠️'}
                </span>
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Sign In' : 'Sign Up'
              )}
            </button>

            <div className="form-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={switchMode}
              disabled={loading}
            >
              {isLogin ? 'Create New Account' : 'Back to Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>Connect • Worship • Grow</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
