import React, { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://tdhqodxptqzmkbfifmjl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ehZDndjyBFtODo-01cyVkg_Tte5C8Im';

// Chord transposition mapping (copied from SongViewer)
const chordMap = {
  'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11,
  'Cm':0,'C#m':1,'Dbm':1,'Dm':2,'D#m':3,'Ebm':3,'Em':4,'Fm':5,'F#m':6,'Gbm':6,'Gm':7,'G#m':8,'Abm':8,'Am':9,'A#m':10,'Bbm':10,'Bm':11,
  'C7':0,'C#7':1,'Db7':1,'D7':2,'D#7':3,'Eb7':3,'E7':4,'F7':5,'F#7':6,'Gb7':6,'G7':7,'G#7':8,'Ab7':8,'A7':9,'A#7':10,'Bb7':10,'B7':11,
  'Cmaj7':0,'C#maj7':1,'Dbmaj7':1,'Dmaj7':2,'D#maj7':3,'Ebmaj7':3,'Emaj7':4,'Fmaj7':5,'F#maj7':6,'Gbmaj7':6,'Gmaj7':7,'G#maj7':8,'Abmaj7':8,'Amaj7':9,'A#maj7':10,'Bbmaj7':10,'Bmaj7':11
};

const transposeChord = (chord, semitones) => {
  if (!chord) return chord;
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  let root = match[1], suffix = match[2];
  if (root === 'Db') root = 'C#';
  if (root === 'Eb') root = 'D#';
  if (root === 'Gb') root = 'F#';
  if (root === 'Ab') root = 'G#';
  if (root === 'Bb') root = 'A#';
  const val = chordMap[root];
  if (val === undefined) return chord;
  const newVal = (val + semitones + 12) % 12;
  let newRoot = Object.keys(chordMap).find(k => chordMap[k] === newVal && !k.includes('b'));
  if (!newRoot) newRoot = Object.keys(chordMap).find(k => chordMap[k] === newVal);
  return newRoot ? newRoot.replace(/[^A-G#b].*$/, '') + suffix : chord;
};

const transposeText = (text, semitones) => {
  if (!text || semitones === 0) return text;
  return text.replace(/\[([^\]]+)\]/g, (match, chord) => `[${transposeChord(chord.trim(), semitones)}]`);
};

function SetlistManager({ songs }) {
  const [setlists, setSetlists] = useState([]);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newSetlistName, setNewSetlistName] = useState('');
  const [newSetlistDate, setNewSetlistDate] = useState('');
  const [setlistSongs, setSetlistSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fullViewSong, setFullViewSong] = useState(null);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [transposeAmounts, setTransposeAmounts] = useState(() => {
    const saved = localStorage.getItem('mwcf_song_transposes');
    return saved ? JSON.parse(saved) : {};
  });

  // Save transposes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mwcf_song_transposes', JSON.stringify(transposeAmounts));
  }, [transposeAmounts]);

  useEffect(() => { loadSetlists(); }, []);
  useEffect(() => { if (selectedSetlist) loadSetlistSongs(); }, [selectedSetlist]);

  const loadSetlists = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/setlists?select=*&order=created_at.desc`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
      setSetlists(await res.json() || []);
    } catch (err) { console.error(err); }
  };

  const loadSetlistSongs = async () => {
    if (!selectedSetlist) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs?select=*,songs(*)&setlist_id=eq.${selectedSetlist.id}`, { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
      const data = await res.json();
      setSetlistSongs(data.map(item => item.songs).filter(s => s));
    } catch (err) { console.error(err); }
  };

  const createSetlist = async () => {
    if (!newSetlistName.trim()) return alert('Enter name');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/setlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'return=representation' },
        body: JSON.stringify({ name: newSetlistName, service_date: newSetlistDate || null })
      });
      const data = await res.json();
      if (res.ok) { setSetlists([data[0], ...setlists]); setShowCreate(false); setNewSetlistName(''); setNewSetlistDate(''); alert('✅ Setlist created!'); }
      else alert('Error');
    } catch (err) { alert(err.message); }
  };

  const deleteSetlist = async (id) => {
    if (!window.confirm('Delete this setlist?')) return;
    await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs?setlist_id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
    await fetch(`${SUPABASE_URL}/rest/v1/setlists?id=eq.${id}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
    loadSetlists();
    if (selectedSetlist?.id === id) setSelectedSetlist(null);
  };

  const addMultipleToSetlist = async () => {
    if (!selectedSetlist) return alert('Select setlist first');
    if (selectedSongs.length === 0) return alert('Select songs');
    let success = 0;
    for (const song of selectedSongs) {
      if (!setlistSongs.some(s => s.id === song.id)) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }, body: JSON.stringify({ setlist_id: selectedSetlist.id, song_id: song.id }) });
        if (res.ok) success++;
      }
    }
    await loadSetlistSongs();
    setSelectedSongs([]);
    alert(`✅ ${success} added!`);
  };

  const addToSetlist = async (song) => {
    if (!selectedSetlist) return alert('Select setlist first');
    if (setlistSongs.some(s => s.id === song.id)) return alert('Already in setlist');
    await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }, body: JSON.stringify({ setlist_id: selectedSetlist.id, song_id: song.id }) });
    await loadSetlistSongs();
    alert(`✅ "${song.title}" added!`);
  };

  const removeFromSetlist = async (songId, songTitle) => {
    if (!window.confirm(`Remove "${songTitle}"?`)) return;
    await fetch(`${SUPABASE_URL}/rest/v1/setlist_songs?setlist_id=eq.${selectedSetlist.id}&song_id=eq.${songId}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } });
    await loadSetlistSongs();
  };

  const moveSongUp = (idx) => { if (idx === 0) return; const newOrder = [...setlistSongs]; [newOrder[idx], newOrder[idx-1]] = [newOrder[idx-1], newOrder[idx]]; setSetlistSongs(newOrder); };
  const moveSongDown = (idx) => { if (idx === setlistSongs.length-1) return; const newOrder = [...setlistSongs]; [newOrder[idx], newOrder[idx+1]] = [newOrder[idx+1], newOrder[idx]]; setSetlistSongs(newOrder); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }) : 'No date';

  // Get transposed lyrics for a song
  const getTransposedLyrics = (song) => {
    const amount = transposeAmounts[song.id] || 0;
    return transposeText(song.lyrics_with_chords, amount);
  };

  const getCurrentKey = (song) => {
    const amount = transposeAmounts[song.id] || 0;
    if (amount === 0) return song.key;
    return transposeChord(song.key, amount);
  };

  const transposeSong = (songId, semitones) => {
    const current = transposeAmounts[songId] || 0;
    const newAmount = current + semitones;
    if (newAmount < -11 || newAmount > 11) return;
    setTransposeAmounts(prev => ({ ...prev, [songId]: newAmount }));
  };

  const resetTranspose = (songId) => {
    setTransposeAmounts(prev => {
      const newState = { ...prev };
      delete newState[songId];
      return newState;
    });
  };

  const formatLyricsFull = (song) => {
    const text = getTransposedLyrics(song);
    if (!text) return [];
    return text.split('\n').map((line, i) => {
      const isHeader = /^(Verse|Chorus|Bridge|Intro|Outro|Tag)/i.test(line.trim());
      if (isHeader && line.trim().length < 30) {
        return <div key={i} style={{ marginTop: 20, marginBottom: 8 }}><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{line.trim()}</span></div>;
      }
      const parts = []; let last = 0; const regex = /\[([^\]]+)\]/g; let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > last) parts.push(<span key={`t-${i}-${last}`}>{line.substring(last, match.index)}</span>);
        parts.push(<span key={`c-${i}-${match.index}`} style={{ display: 'inline-block', color: 'var(--primary-600)', fontWeight: 'bold', background: 'var(--primary-100)', padding: '2px 8px', borderRadius: 6, marginRight: 5, fontSize: 13 }}>{match[0]}</span>);
        last = match.index + match[0].length;
      }
      if (last < line.length) parts.push(<span key={`t-${i}-end`}>{line.substring(last)}</span>);
      if (parts.length) return <div key={i} style={{ marginBottom: 8, lineHeight: 1.7, fontSize: 14 }}>{parts}</div>;
      if (line.trim()) return <div key={i} style={{ marginBottom: 6, fontSize: 14 }}>{line}</div>;
      return <div key={i} style={{ marginBottom: 8 }}>&nbsp;</div>;
    });
  };

  const availableSongs = songs.filter(s => !setlistSongs.find(ss => ss.id === s.id));
  const filteredSongs = availableSongs.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.key.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleSelectSong = (song) => {
    if (selectedSongs.find(s => s.id === song.id)) setSelectedSongs(selectedSongs.filter(s => s.id !== song.id));
    else setSelectedSongs([...selectedSongs, song]);
  };
  const selectAll = () => { if (selectedSongs.length === filteredSongs.length) setSelectedSongs([]); else setSelectedSongs([...filteredSongs]); };

  return (
    <div className="setlist-container">
      <div className="setlist-sidebar">
        <button className="btn-primary" onClick={() => setShowCreate(true)}>📋 + New Setlist</button>
        {setlists.map(s => (
          <div key={s.id} className={`setlist-item ${selectedSetlist?.id === s.id ? 'active' : ''}`} onClick={() => setSelectedSetlist(s)}>
            <div><strong>{s.name}</strong><div style={{ fontSize: 10 }}>{formatDate(s.service_date)}</div></div>
            <button onClick={(e) => { e.stopPropagation(); deleteSetlist(s.id); }}>🗑️</button>
          </div>
        ))}
      </div>
      <div className="setlist-content">
        {selectedSetlist ? (
          <>
            <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--border-light)' }}><h2 style={{ margin: 0, fontSize: 18 }}>📋 {selectedSetlist.name}</h2>{selectedSetlist.service_date && <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-tertiary)' }}>🎯 {formatDate(selectedSetlist.service_date)}</p>}</div>
            <div style={{ marginBottom: 20 }}><h3 style={{ fontSize: 14, marginBottom: 10 }}>🎵 Songs ({setlistSongs.length})</h3>{setlistSongs.map((song, idx) => {
              const transAmount = transposeAmounts[song.id] || 0;
              const currentKey = getCurrentKey(song);
              return (
                <div key={song.id} className="setlist-song-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div className="song-number">{idx+1}</div>
                    <div>
                      <strong>{song.title}</strong>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        Key: {song.key} {transAmount !== 0 && <span style={{ color: 'var(--primary-600)' }}>→ {currentKey}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="song-actions">
                    <button onClick={() => moveSongUp(idx)}>⬆️</button>
                    <button onClick={() => moveSongDown(idx)}>⬇️</button>
                    <button onClick={() => setFullViewSong(song)}>View</button>
                    <button onClick={() => removeFromSetlist(song.id, song.title)}>Remove</button>
                  </div>
                </div>
              );
            })}</div>
            <div style={{ marginTop: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}><h3 style={{ fontSize: 14 }}>➕ Add Songs</h3><div><button onClick={selectAll} style={{ background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: 6, fontSize: 11, marginRight: 8 }}>Select All</button><button onClick={addMultipleToSetlist} disabled={selectedSongs.length===0} style={{ background: selectedSongs.length===0 ? 'var(--border-medium)' : 'var(--gradient-success)', color: 'white', padding: '4px 12px', borderRadius: 6, fontSize: 11 }}>Add ({selectedSongs.length})</button></div></div><input type="text" placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 8, marginBottom: 10, fontSize: 12 }} /><div className="songs-grid">{filteredSongs.map(song => (<div key={song.id} className="available-song-card" onClick={() => toggleSelectSong(song)} style={{ cursor: 'pointer', background: selectedSongs.find(s => s.id === song.id) ? 'var(--primary-100)' : 'var(--bg-secondary)' }}><div><input type="checkbox" checked={selectedSongs.find(s => s.id === song.id)} onChange={()=>{}} onClick={e=>e.stopPropagation()} style={{ marginRight: 6 }} /><strong>{song.title}</strong><div><small>Key: {song.key}</small></div></div><button onClick={(e)=>{e.stopPropagation(); addToSetlist(song);}} style={{ background: 'var(--gradient-success)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11 }}>+ Add</button></div>))}</div></div>
          </>
        ) : (<div style={{ textAlign: 'center', padding: 40 }}><div style={{ fontSize: 40 }}>📋</div><h3>No Setlist Selected</h3><button className="btn-primary" onClick={() => setShowCreate(true)} style={{ width: 'auto', marginTop: 12 }}>+ Create New</button></div>)}
      </div>

      {/* Full Page Modal for Viewing Song with Transpose Controls */}
      {fullViewSong && (
        <div className="modal" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }} onClick={() => setFullViewSong(null)}>
          <div className="modal-content" style={{ maxWidth: 800, width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: 24, borderRadius: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 24, color: 'var(--text-primary)' }}>{fullViewSong.title}</h2>
              <button onClick={() => setFullViewSong(null)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 12, cursor: 'pointer', fontSize: 14 }}>✖️ Close</button>
            </div>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: 'var(--bg-tertiary)', padding: 12, borderRadius: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>🎵 Original Key: {fullViewSong.key}</span>
                {fullViewSong.tempo && <span style={{ background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>🎚️ {fullViewSong.tempo} BPM</span>}
                {fullViewSong.song_date && <span style={{ background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: 20, fontSize: 13 }}>📅 {new Date(fullViewSong.song_date).toLocaleDateString()}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>🎼 Transpose:</span>
                <button onClick={() => transposeSong(fullViewSong.id, -1)} style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>-1</button>
                <button onClick={() => transposeSong(fullViewSong.id, 1)} style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>+1</button>
                {(transposeAmounts[fullViewSong.id] || 0) !== 0 && (
                  <button onClick={() => resetTranspose(fullViewSong.id)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}>Reset</button>
                )}
                <span style={{ background: 'var(--bg-primary)', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                  Current: {getCurrentKey(fullViewSong)}
                </span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: 24, borderRadius: 20, marginBottom: 16, maxHeight: '55vh', overflowY: 'auto' }}>
              {formatLyricsFull(fullViewSong)}
            </div>
            {fullViewSong.notes && (
              <div style={{ background: '#fef3c7', padding: 16, borderRadius: 16, borderLeft: '4px solid #f59e0b' }}>
                <strong style={{ color: '#92400e' }}>📝 Notes:</strong>
                <p style={{ marginTop: 8, color: '#78350f' }}>{fullViewSong.notes}</p>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
              <button onClick={() => window.print()} style={{ background: 'var(--gradient-success)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 40, cursor: 'pointer', fontWeight: 600 }}>🖨️ Print</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (<div className="modal" onClick={() => setShowCreate(false)}><div className="modal-content" onClick={e=>e.stopPropagation()}><h3>Create Setlist</h3><input type="text" placeholder="Name" value={newSetlistName} onChange={e=>setNewSetlistName(e.target.value)} autoFocus /><input type="date" value={newSetlistDate} onChange={e=>setNewSetlistDate(e.target.value)} /><div className="modal-buttons"><button onClick={createSetlist}>Create</button><button onClick={()=>setShowCreate(false)}>Cancel</button></div></div></div>)}
    </div>
  );
}

export default SetlistManager;