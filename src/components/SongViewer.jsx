import React, { useState } from 'react';

const chordMap = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
  'Cm': 0, 'C#m': 1, 'Dbm': 1, 'Dm': 2, 'D#m': 3, 'Ebm': 3, 'Em': 4, 'Fm': 5, 'F#m': 6, 'Gbm': 6, 'Gm': 7, 'G#m': 8, 'Abm': 8, 'Am': 9, 'A#m': 10, 'Bbm': 10, 'Bm': 11,
  'C7': 0, 'C#7': 1, 'Db7': 1, 'D7': 2, 'D#7': 3, 'Eb7': 3, 'E7': 4, 'F7': 5, 'F#7': 6, 'Gb7': 6, 'G7': 7, 'G#7': 8, 'Ab7': 8, 'A7': 9, 'A#7': 10, 'Bb7': 10, 'B7': 11,
  'Cmaj7': 0, 'C#maj7': 1, 'Dbmaj7': 1, 'Dmaj7': 2, 'D#maj7': 3, 'Ebmaj7': 3, 'Emaj7': 4, 'Fmaj7': 5, 'F#maj7': 6, 'Gbmaj7': 6, 'Gmaj7': 7, 'G#maj7': 8, 'Abmaj7': 8, 'Amaj7': 9, 'A#maj7': 10, 'Bbmaj7': 10, 'Bmaj7': 11,
  'Cadd9': 0, 'C#add9': 1, 'Dbadd9': 1, 'Dadd9': 2, 'D#add9': 3, 'Ebadd9': 3, 'Eadd9': 4, 'Fadd9': 5, 'F#add9': 6, 'Gbadd9': 6, 'Gadd9': 7, 'G#add9': 8, 'Abadd9': 8, 'Aadd9': 9, 'A#add9': 10, 'Badd9': 11, 'Bbadd9': 10
};

const transposeChord = (chord, semitones) => {
  if (!chord || chord === '') return chord;
  let match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;
  let root = match[1];
  let suffix = match[2];
  if (root === 'Db') root = 'C#';
  if (root === 'Eb') root = 'D#';
  if (root === 'Gb') root = 'F#';
  if (root === 'Ab') root = 'G#';
  if (root === 'Bb') root = 'A#';
  let baseValue = chordMap[root];
  if (baseValue === undefined) return chord;
  let newValue = (baseValue + semitones + 12) % 12;
  let newRoot = Object.keys(chordMap).find(key => chordMap[key] === newValue && !key.includes('b'));
  if (!newRoot) newRoot = Object.keys(chordMap).find(key => chordMap[key] === newValue);
  if (newRoot) {
    newRoot = newRoot.replace(/[^A-G#b].*$/, '');
    return newRoot + suffix;
  }
  return chord;
};

const transposeText = (text, semitones) => {
  if (!text || semitones === 0) return text;
  return text.replace(/\[([^\]]+)\]/g, (match, chord) => {
    const transposed = transposeChord(chord.trim(), semitones);
    return `[${transposed}]`;
  });
};

function SongViewer({ song, onEdit, onDelete, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSong, setEditedSong] = useState(song);
  const [transposeAmount, setTransposeAmount] = useState(0);
  const [displayLyrics, setDisplayLyrics] = useState(song.lyrics_with_chords);
  const [currentKey, setCurrentKey] = useState(song.key);

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatLyrics = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      const isSection = /^(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Tag)/i.test(trimmed);
      if (isSection && trimmed.length < 30) {
        return <div key={i} style={{ marginTop: 24, marginBottom: 12 }}><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 20px', borderRadius: 30, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{trimmed}</span></div>;
      }
      const parts = [];
      let last = 0;
      const regex = /\[([^\]]+)\]/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > last) parts.push(<span key={`t-${i}-${last}`}>{line.substring(last, match.index)}</span>);
        parts.push(<span key={`c-${i}-${match.index}`} style={{ display: 'inline-block', color: 'var(--primary-600)', fontWeight: 'bold', background: 'var(--primary-100)', padding: '2px 8px', borderRadius: 6, marginRight: 6, fontSize: 12, fontFamily: 'monospace' }}>{match[0]}</span>);
        last = match.index + match[0].length;
      }
      if (last < line.length) parts.push(<span key={`t-${i}-end`}>{line.substring(last)}</span>);
      if (parts.length) return <div key={i} style={{ marginBottom: 10, lineHeight: 1.7, fontSize: 14 }}>{parts}</div>;
      if (line.trim()) return <div key={i} style={{ marginBottom: 8, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{line}</div>;
      return <div key={i} style={{ marginBottom: 8 }}>&nbsp;</div>;
    });
  };

  const transpose = (semitones) => {
    const newAmount = transposeAmount + semitones;
    if (newAmount < -11 || newAmount > 11) return;
    setTransposeAmount(newAmount);
    setDisplayLyrics(transposeText(song.lyrics_with_chords, newAmount));
    setCurrentKey(transposeChord(currentKey, semitones));
  };

  const resetTranspose = () => {
    setTransposeAmount(0);
    setDisplayLyrics(song.lyrics_with_chords);
    setCurrentKey(song.key);
  };

  const handleSaveEdit = () => {
    if (!editedSong.title.trim()) return alert('Enter a title');
    onEdit(editedSong);
    setIsEditing(false);
  };

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  if (isEditing) {
    return (
      <div className="song-form-wrapper">
        <div className="form-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <h2 className="form-title">✏️ Editing: {song.title}</h2>
          <p className="form-subtitle">Make changes to your song</p>
        </div>
        <div className="song-form" style={{ padding: 24 }}>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={editedSong.title} onChange={e => setEditedSong({...editedSong, title: e.target.value})} /></div>
          <div className="form-row"><div className="form-group"><label className="form-label">Key</label><select className="form-select" value={editedSong.key} onChange={e => setEditedSong({...editedSong, key: e.target.value})}>{keys.map(k => <option key={k}>{k}</option>)}</select></div><div className="form-group"><label className="form-label">Tempo</label><input className="form-input" value={editedSong.tempo || ''} onChange={e => setEditedSong({...editedSong, tempo: e.target.value})} /></div></div>
          <div className="form-group"><label className="form-label">Lyrics</label><textarea className="form-textarea form-textarea-large" value={editedSong.lyrics_with_chords} onChange={e => setEditedSong({...editedSong, lyrics_with_chords: e.target.value})} rows={12} /></div>
          <div className="form-actions"><button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button><button className="btn-submit" onClick={handleSaveEdit}>💾 Save</button></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: 'var(--bg-primary)', borderRadius: 24, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
      <div style={{ background: 'var(--gradient-primary)', padding: '24px 28px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 24 }}>{song.title}</h2>
            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>🎵 Original: {song.key}</span>
              {transposeAmount !== 0 && <span style={{ background: '#ffc107', color: '#333', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>➡️ Current: {currentKey}</span>}
              {song.tempo && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>🎚️ {song.tempo} BPM</span>}
              {song.song_date && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>📅 {formatDate(song.song_date)}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}><button onClick={() => setIsEditing(true)} style={{ background: 'white', color: 'var(--primary-600)', border: 'none', padding: '8px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>✏️ Edit</button><button onClick={onDelete} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️ Delete</button><button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>✖️ Close</button></div>
        </div>
      </div>
      <div style={{ padding: '16px 28px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontWeight: 600 }}>🎼 Transpose:</span><button onClick={() => transpose(-1)} style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 20, cursor: 'pointer' }}>-1 (♭)</button><button onClick={() => transpose(1)} style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 20, cursor: 'pointer' }}>+1 (♯)</button>{transposeAmount !== 0 && <><button onClick={resetTranspose} style={{ background: 'var(--gray-500)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 20, cursor: 'pointer' }}>Reset</button><span style={{ background: 'var(--bg-tertiary)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>{transposeAmount > 0 ? `+${transposeAmount}` : transposeAmount} semitone</span></>}</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>💡 Tip: Transpose to match singer's vocal range</div>
      </div>
      <div style={{ padding: 28 }}>
        <div style={{ background: 'var(--bg-secondary)', padding: 28, borderRadius: 20, maxHeight: 500, overflowY: 'auto' }}>{formatLyrics(displayLyrics)}</div>
        {song.notes && <div style={{ marginTop: 20, padding: 16, background: '#fef3c7', borderRadius: 16, borderLeft: '4px solid #f59e0b' }}><strong style={{ color: '#92400e' }}>📝 Notes:</strong><p style={{ marginTop: 8, color: '#78350f' }}>{song.notes}</p></div>}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}><button onClick={() => window.print()} style={{ background: 'var(--gradient-success)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 40, cursor: 'pointer', fontWeight: 600 }}>🖨️ Print Chord Chart</button></div>
      </div>
    </div>
  );
}

export default SongViewer;