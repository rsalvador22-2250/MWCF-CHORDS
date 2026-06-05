import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let result;
      if (isLogin) result = await supabase.auth.signInWithPassword({ email, password });
      else result = await supabase.auth.signUp({ email, password, options: { data: { church: 'MWCF' } } });
      const { error } = result;
      if (error) setMessage(error.message);
      else if (!isLogin) setMessage('✅ Check your email for confirmation!');
    } catch (err) { setMessage('Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <img src="/mwcfchords.png" alt="MWCF" className="auth-logo" />
        <h1>MWCF CHORDS</h1>
        <p>Mighty Warrior Christian Fellowship</p>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}</button>
          <button type="button" className="toggle-btn" onClick={() => { setIsLogin(!isLogin); setMessage(''); }}>{isLogin ? 'Create New Account' : 'Back to Sign In'}</button>
        </form>
      </div>
    </div>
  );
}

export default Auth;