import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import SongList from './components/SongList';
import SongForm from './components/SongForm';
import SongViewer from './components/SongViewer';
import SetlistManager from './components/SetlistManager';
import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showSetlists, setShowSetlists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('mwcf-theme');
    return saved === 'dark';
  });

  // Theme Management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('mwcf-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mwcf-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Auth Management
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          await loadSongs();
        }
      } catch (err) {
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await loadSongs();
      } else {
        setSongs([]);
        setSelectedSong(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSongs(data || []);
    } catch (err) {
      console.error('Error loading songs:', err);
    }
  };

  const addSong = async (newSong) => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .insert([{
          title: newSong.title,
          key: newSong.key,
          tempo: newSong.tempo || '',
          lyrics_with_chords: newSong.lyricsWithChords,
          song_date: newSong.song_date || null,
          notes: newSong.notes || ''
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setSongs([data[0], ...songs]);
        setShowForm(false);
        alert('✅ Song saved successfully!');
      }
    } catch (err) {
      console.error('Error adding song:', err);
      alert('Error adding song: ' + err.message);
    }
  };

  const updateSong = async (updatedSong) => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({
          title: updatedSong.title,
          key: updatedSong.key,
          tempo: updatedSong.tempo,
          lyrics_with_chords: updatedSong.lyrics_with_chords,
          song_date: updatedSong.song_date,
          notes: updatedSong.notes
        })
        .eq('id', updatedSong.id);

      if (error) throw error;
      
      setSongs(songs.map(s => s.id === updatedSong.id ? updatedSong : s));
      setSelectedSong(null);
      alert('✅ Song updated successfully!');
    } catch (err) {
      console.error('Error updating song:', err);
      alert('Error updating song: ' + err.message);
    }
  };

  const deleteSong = async (id) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSongs(songs.filter(s => s.id !== id));
      if (selectedSong?.id === id) setSelectedSong(null);
      alert('✅ Song deleted successfully!');
    } catch (err) {
      console.error('Error deleting song:', err);
      alert('Error deleting song: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setSongs([]);
      setSelectedSong(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">🎵 MWCF Chords 🎵</div>
        <div className="loading-subtext">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app">
      <button onClick={toggleTheme} className="theme-toggle-global" aria-label="Toggle theme">
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <header className="header">
        <div className="header-content">
          <img src="/mwcfchords.png" alt="MWCF" className="logo" />
          <div>
            <h1>🎵 MWCF CHORDS</h1>
            <p className="subtitle">Mighty Warrior Christian Fellowship</p>
          </div>
          <div className="header-right">
            <span className="user-email">👤 {session.user.email?.split('@')[0]}</span>
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="nav-tabs">
        <button 
          className={!showSetlists ? 'active' : ''} 
          onClick={() => {
            setShowSetlists(false);
            setSelectedSong(null);
            setShowForm(false);
          }}
        >
          🎵 Songs
        </button>
        <button 
          className={showSetlists ? 'active' : ''} 
          onClick={() => {
            setShowSetlists(true);
            setSelectedSong(null);
            setShowForm(false);
          }}
        >
          📋 Setlists
        </button>
      </div>

      <div className="main-container">
        {!showSetlists ? (
          <>
            <aside className="sidebar">
              <button className="btn-primary" onClick={() => {
                setShowForm(true);
                setSelectedSong(null);
              }}>
                ➕ Add New Song
              </button>
              <SongList 
                songs={songs} 
                onSelectSong={(song) => {
                  setSelectedSong(song);
                  setShowForm(false);
                }} 
                onDeleteSong={deleteSong}
              />
            </aside>
            <main className="content">
              {showForm && (
                <SongForm 
                  onSave={addSong}
                  onCancel={() => setShowForm(false)}
                />
              )}
              
              {selectedSong && !showForm && (
                <SongViewer 
                  song={selectedSong}
                  onEdit={updateSong}
                  onDelete={() => deleteSong(selectedSong.id)}
                  onClose={() => setSelectedSong(null)}
                />
              )}

              {!selectedSong && !showForm && (
                <div className="welcome">
                  <img src="/mwcfchords.png" alt="MWCF" className="welcome-logo" />
                  <h2>Welcome, {session.user.email?.split('@')[0]}! 🙌</h2>
                  <p>You have {songs.length} song{songs.length !== 1 ? 's' : ''} in your library</p>
                  {songs.length === 0 && (
                    <button 
                      className="btn-primary" 
                      onClick={() => setShowForm(true)}
                      style={{ marginTop: '20px', width: 'auto', padding: '12px 24px' }}
                    >
                      ➕ Add Your First Song
                    </button>
                  )}
                </div>
              )}
            </main>
          </>
        ) : (
          <SetlistManager songs={songs} />
        )}
      </div>
    </div>
  );
}

export default App;