import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://tdhqodxptqzmkbfifmjl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ehZDndjyBFtODo-01cyVkg_Tte5C8Im';

function SetlistManager({ songs }) {
  const [setlists, setSetlists] = useState([]);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newSetlistName, setNewSetlistName] = useState('');
  const [newSetlistDate, setNewSetlistDate] = useState('');
  const [setlistSongs, setSetlistSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingSong, setViewingSong] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);

  useEffect(() => { 
    loadSetlists(); 
  }, []);

  useEffect(() => { 
    if (selectedSetlist) {
      loadSetlistSongs(); 
    }
  }, [selectedSetlist]);

  const loadSetlists = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/setlists?select=*&order=created_at.desc`, { 
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } 
      });
      const data = await res.json();
      setSetlists(data || []);
    } catch (err) { 
      console.error(err); 
    }
  };

  const loadSetlistSongs = async () => {
    if (!selectedSetlist) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs?select=*,songs(*)&setlist_id=eq.${selectedSetlist.id}`, { 
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } 
      });
      const data = await res.json();
      setSetlistSongs(data.map(item => item.songs).filter(s => s));
    } catch (err) { 
      console.error(err); 
    }
  };

  const createSetlist = async () => {
    if (!newSetlistName.trim()) return alert('Enter a name');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/setlists`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'apikey': SUPABASE_KEY, 
          'Authorization': `Bearer ${SUPABASE_KEY}`, 
          'Prefer': 'return=representation' 
        },
        body: JSON.stringify({ name: newSetlistName, service_date: newSetlistDate || null })
      });
      const data = await res.json();
      if (res.ok) {
        setSetlists([data[0], ...setlists]);
        setShowCreate(false);
        setNewSetlistName('');
        setNewSetlistDate('');
        alert('✅ Setlist created!');
      } else alert('Error: ' + JSON.stringify(data));
    } catch (err) { 
      alert(err.message); 
    }
  };

  const deleteSetlist = async (id) => {
    if (!window.confirm('Delete this setlist?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs?setlist_id=eq.${id}`, { 
      method: 'DELETE', 
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } 
    });
    await fetch(`${SUPABASE_URL}/rest/v1/setlists?id=eq.${id}`, { 
      method: 'DELETE', 
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } 
    });
    loadSetlists();
    if (selectedSetlist?.id === id) setSelectedSetlist(null);
  };

  const addMultipleToSetlist = async () => {
    if (!selectedSetlist) return alert('Select a setlist first');
    if (selectedSongs.length === 0) return alert('Select at least one song');
    let success = 0;
    for (const song of selectedSongs) {
      if (!setlistSongs.some(s => s.id === song.id)) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'apikey': SUPABASE_KEY, 
            'Authorization': `Bearer ${SUPABASE_KEY}` 
          },
          body: JSON.stringify({ setlist_id: selectedSetlist.id, song_id: song.id })
        });
        if (res.ok) success++;
      }
    }
    await loadSetlistSongs();
    setSelectedSongs([]);
    alert(`✅ ${success} songs added!`);
  };

  const addToSetlist = async (song) => {
    if (!selectedSetlist) return alert('Select a setlist first');
    if (setlistSongs.some(s => s.id === song.id)) return alert('Already in setlist');
    await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'apikey': SUPABASE_KEY, 
        'Authorization': `Bearer ${SUPABASE_KEY}` 
      },
      body: JSON.stringify({ setlist_id: selectedSetlist.id, song_id: song.id })
    });
    await loadSetlistSongs();
    alert(`✅ "${song.title}" added!`);
  };

  const removeFromSetlist = async (songId, songTitle) => {
    if (!window.confirm(`Remove "${songTitle}"?`)) return;
    await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs?setlist_id=eq.${selectedSetlist.id}&song_id=eq.${songId}`, { 
      method: 'DELETE', 
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } 
    });
    await loadSetlistSongs();
  };

  const moveSongUp = (index) => {
    if (index === 0) return;
    const newOrder = [...setlistSongs];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setSetlistSongs(newOrder);
  };

  const moveSongDown = (index) => {
    if (index === setlistSongs.length - 1) return;
    const newOrder = [...setlistSongs];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSetlistSongs(newOrder);
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-PH', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  }) : 'No date';

  const formatLyrics = (text) => {
    if (!text) return [];
    return text.split('\n').map((line, i) => {
      const isHeader = /^(Verse|Chorus|Bridge|Intro|Outro|Tag)/i.test(line.trim());
      if (isHeader && line.trim().length < 30) {
        return (
          <div key={i} style={{ marginTop: 20, marginBottom: 12 }}>
            <span style={{ 
              background: 'var(--primary-100)', 
              color: 'var(--primary-700)', 
              padding: '4px 20px', 
              borderRadius: 30, 
              fontSize: 12, 
              fontWeight: 600 
            }}>
              {line.trim()}
            </span>
          </div>
        );
      }
      const parts = [];
      let last = 0;
      const regex = /\[([^\]]+)\]/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > last) {
          parts.push(<span key={`t-${i}-${last}`}>{line.substring(last, match.index)}</span>);
        }
        parts.push(
          <span 
            key={`c-${i}-${match.index}`} 
            style={{ 
              display: 'inline-block', 
              color: 'var(--primary-600)', 
              fontWeight: 'bold', 
              background: 'var(--primary-100)', 
              padding: '2px 8px', 
              borderRadius: 6, 
              marginRight: 6, 
              fontSize: 12 
            }}
          >
            {match[0]}
          </span>
        );
        last = match.index + match[0].length;
      }
      if (last < line.length) {
        parts.push(<span key={`t-${i}-end`}>{line.substring(last)}</span>);
      }
      if (parts.length) {
        return <div key={i} style={{ marginBottom: 10, lineHeight: 1.7, fontSize: 14 }}>{parts}</div>;
      }
      if (line.trim()) {
        return <div key={i} style={{ marginBottom: 8, color: 'var(--text-secondary)' }}>{line}</div>;
      }
      return <div key={i} style={{ marginBottom: 8 }}>&nbsp;</div>;
    });
  };

  const availableSongs = songs.filter(s => !setlistSongs.find(ss => ss.id === s.id));
  const filteredSongs = availableSongs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectSong = (song) => {
    if (selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs(selectedSongs.filter(s => s.id !== song.id));
    } else {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const selectAll = () => {
    if (selectedSongs.length === filteredSongs.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs([...filteredSongs]);
    }
  };

  return (
    <div className="setlist-container">
      <div className="setlist-sidebar">
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          📋 + New Setlist
        </button>
        {setlists.map(s => (
          <div 
            key={s.id} 
            className={`setlist-item ${selectedSetlist?.id === s.id ? 'active' : ''}`} 
            onClick={() => setSelectedSetlist(s)}
          >
            <div>
              <strong>{s.name}</strong>
              <div style={{ fontSize: 11 }}>{formatDate(s.service_date)}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteSetlist(s.id); }}>
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="setlist-content">
        {selectedSetlist ? (
          <>
            <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--border-light)' }}>
              <h2 style={{ margin: 0 }}>📋 {selectedSetlist.name}</h2>
              {selectedSetlist.service_date && (
                <p style={{ marginTop: 5, color: 'var(--text-tertiary)', fontSize: 13 }}>
                  🎯 {formatDate(selectedSetlist.service_date)}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3>🎵 Songs ({setlistSongs.length})</h3>
              {setlistSongs.map((song, idx) => (
                <div key={song.id} className="setlist-song-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div className="song-number">{idx + 1}</div>
                    <div>
                      <strong>{song.title}</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Key: {song.key}</div>
                    </div>
                  </div>
                  <div className="song-actions">
                    <button onClick={() => moveSongUp(idx)}>⬆️</button>
                    <button onClick={() => moveSongDown(idx)}>⬇️</button>
                    <button onClick={() => setViewingSong(song)}>View</button>
                    <button onClick={() => removeFromSetlist(song.id, song.title)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {viewingSong && (
              <div style={{ 
                marginTop: 24, 
                padding: 20, 
                background: 'var(--bg-secondary)', 
                borderRadius: 16, 
                border: '1px solid var(--border-light)' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3>{viewingSong.title}</h3>
                  <button 
                    onClick={() => setViewingSong(null)} 
                    style={{ 
                      background: 'var(--danger)', 
                      color: 'white', 
                      border: 'none', 
                      padding: '6px 12px', 
                      borderRadius: 8, 
                      cursor: 'pointer' 
                    }}
                  >
                    Close
                  </button>
                </div>
                <div style={{ 
                  background: 'var(--bg-primary)', 
                  padding: 20, 
                  borderRadius: 12, 
                  maxHeight: 400, 
                  overflowY: 'auto' 
                }}>
                  {formatLyrics(viewingSong.lyrics_with_chords)}
                </div>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 12, 
                flexWrap: 'wrap', 
                gap: 8 
              }}>
                <h3>➕ Add Songs</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    onClick={selectAll} 
                    style={{ 
                      background: 'var(--bg-tertiary)', 
                      padding: '6px 12px', 
                      borderRadius: 8, 
                      fontSize: 12 
                    }}
                  >
                    Select All
                  </button>
                  <button 
                    onClick={addMultipleToSetlist} 
                    disabled={selectedSongs.length === 0} 
                    style={{ 
                      background: selectedSongs.length === 0 ? 'var(--border-medium)' : 'var(--gradient-success)', 
                      color: 'white', 
                      padding: '6px 16px', 
                      borderRadius: 8, 
                      fontSize: 12, 
                      cursor: selectedSongs.length === 0 ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    Add ({selectedSongs.length})
                  </button>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="🔍 Search songs..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  border: '1px solid var(--border-light)', 
                  borderRadius: 12, 
                  marginBottom: 12, 
                  background: 'var(--bg-primary)', 
                  color: 'var(--text-primary)' 
                }}
              />
              <div className="songs-grid">
                {filteredSongs.map(song => (
                  <div 
                    key={song.id} 
                    className="available-song-card" 
                    onClick={() => toggleSelectSong(song)} 
                    style={{ 
                      cursor: 'pointer', 
                      background: selectedSongs.find(s => s.id === song.id) ? 'var(--primary-100)' : 'var(--bg-secondary)' 
                    }}
                  >
                    <div>
                      <input 
                        type="checkbox" 
                        checked={selectedSongs.find(s => s.id === song.id)} 
                        onChange={() => {}} 
                        onClick={e => e.stopPropagation()} 
                        style={{ marginRight: 8 }} 
                      />
                      <strong>{song.title}</strong>
                      <div><small>Key: {song.key}</small></div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToSetlist(song); }} 
                      style={{ 
                        background: 'var(--gradient-success)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '6px 14px', 
                        borderRadius: 8, 
                        cursor: 'pointer', 
                        fontSize: 12 
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <h2>No Setlist Selected</h2>
            <p>Select or create a setlist</p>
            <button 
              className="btn-primary" 
              onClick={() => setShowCreate(true)} 
              style={{ width: 'auto' }}
            >
              + Create New
            </button>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create Setlist</h3>
            <input 
              type="text" 
              placeholder="Setlist name" 
              value={newSetlistName} 
              onChange={e => setNewSetlistName(e.target.value)} 
              autoFocus 
            />
            <input 
              type="date" 
              value={newSetlistDate} 
              onChange={e => setNewSetlistDate(e.target.value)} 
            />
            <div className="modal-buttons">
              <button onClick={createSetlist}>Create</button>
              <button onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SetlistManager;