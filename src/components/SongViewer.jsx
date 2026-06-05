import React, { useState } from 'react';

const chordMap = {
  'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11,
  'Cm':0,'C#m':1,'Dbm':1,'Dm':2,'D#m':3,'Ebm':3,'Em':4,'Fm':5,'F#m':6,'Gbm':6,'Gm':7,'G#m':8,'Abm':8,'Am':9,'A#m':10,'Bbm':10,'Bm':11,
  'C7':0,'C#7':1,'Db7':1,'D7':2,'D#7':3,'Eb7':3,'E7':4,'F7':5,'F#7':6,'Gb7':6,'G7':7,'G#7':8,'Ab7':8,'A7':9,'A#7':10,'Bb7':10,'B7':11,
  'Cmaj7':0,'C#maj7':1,'Dbmaj7':1,'Dmaj7':2,'D#maj7':3,'Ebmaj7':3,'Emaj7':4,'Fmaj7':5,'F#maj7':6,'Gbmaj7':6,'Gmaj7':7,'G#maj7':8,'Abmaj7':8,'Amaj7':9,'A#maj7':10,'Bbmaj7':10,'Bmaj7':11
};

const transposeChord = (chord, s) => {
  if (!chord) return chord;
  let m = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!m) return chord;
  let root = m[1], suf = m[2];
  if (root === 'Db') root='C#'; if(root==='Eb') root='D#'; if(root==='Gb') root='F#'; if(root==='Ab') root='G#'; if(root==='Bb') root='A#';
  let val = chordMap[root];
  if (val === undefined) return chord;
  let nv = (val + s + 12) % 12;
  let nr = Object.keys(chordMap).find(k => chordMap[k] === nv && !k.includes('b'));
  if (!nr) nr = Object.keys(chordMap).find(k => chordMap[k] === nv);
  return nr ? nr.replace(/[^A-G#b].*$/, '') + suf : chord;
};

const transposeText = (text, s) => s === 0 ? text : text.replace(/\[([^\]]+)\]/g, (m, c) => `[${transposeChord(c.trim(), s)}]`);

function SongViewer({ song, onEdit, onDelete, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSong, setEditedSong] = useState(song);
  const [transposeAmt, setTransposeAmt] = useState(0);
  const [displayLyrics, setDisplayLyrics] = useState(song.lyrics_with_chords);
  const [currentKey, setCurrentKey] = useState(song.key);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' }) : null;
  const formatLyrics = (text) => {
    if (!text) return [];
    return text.split('\n').map((line, i) => {
      const isHeader = /^(Verse|Chorus|Bridge|Intro|Outro|Tag)/i.test(line.trim());
      if (isHeader && line.trim().length < 30) return <div key={i} style={{ marginTop: 12, marginBottom: 6 }}><span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '2px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600 }}>{line.trim()}</span></div>;
      const parts = []; let last = 0; const regex = /\[([^\]]+)\]/g; let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > last) parts.push(<span key={`t-${i}-${last}`}>{line.substring(last, match.index)}</span>);
        parts.push(<span key={`c-${i}-${match.index}`} style={{ display: 'inline-block', color: 'var(--primary-600)', fontWeight: 'bold', background: 'var(--primary-100)', padding: '1px 6px', borderRadius: 4, marginRight: 3, fontSize: 11 }}>{match[0]}</span>);
        last = match.index + match[0].length;
      }
      if (last < line.length) parts.push(<span key={`t-${i}-end`}>{line.substring(last)}</span>);
      if (parts.length) return <div key={i} style={{ marginBottom: 6, lineHeight: 1.5, fontSize: 13 }}>{parts}</div>;
      if (line.trim()) return <div key={i} style={{ marginBottom: 4, color: 'var(--text-secondary)', fontSize: 13 }}>{line}</div>;
      return <div key={i} style={{ marginBottom: 4 }}>&nbsp;</div>;
    });
  };
  const transpose = (s) => { const na = transposeAmt + s; if (na < -11 || na > 11) return; setTransposeAmt(na); setDisplayLyrics(transposeText(song.lyrics_with_chords, na)); setCurrentKey(transposeChord(currentKey, s)); };
  const resetTranspose = () => { setTransposeAmt(0); setDisplayLyrics(song.lyrics_with_chords); setCurrentKey(song.key); };
  const handleSaveEdit = () => { if (!editedSong.title.trim()) return alert('Enter title'); onEdit(editedSong); setIsEditing(false); };
  const keys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  if (isEditing) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'var(--bg-primary)', borderRadius: 20, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', padding: '12px 20px' }}><h2 style={{ margin: 0, fontSize: 18, color: 'white' }}>✏️ Editing: {song.title}</h2></div>
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600 }}>Title</label><input value={editedSong.title} onChange={e => setEditedSong({...editedSong, title:e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '2px solid var(--border-light)', borderRadius: 10, marginTop: 6 }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}><div><label style={{ fontSize: 12, fontWeight: 600 }}>Key</label><select value={editedSong.key} onChange={e => setEditedSong({...editedSong, key:e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '2px solid var(--border-light)', borderRadius: 10 }}>{keys.map(k => <option key={k}>{k}</option>)}</select></div><div><label style={{ fontSize: 12, fontWeight: 600 }}>Tempo</label><input value={editedSong.tempo||''} onChange={e => setEditedSong({...editedSong, tempo:e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '2px solid var(--border-light)', borderRadius: 10 }} /></div></div>
          <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600 }}>Lyrics</label><textarea value={editedSong.lyrics_with_chords} onChange={e => setEditedSong({...editedSong, lyrics_with_chords:e.target.value})} rows={10} style={{ width: '100%', padding: '10px', border: '2px solid var(--border-light)', borderRadius: 10, fontFamily: 'monospace', fontSize: 12 }} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}><button onClick={() => setIsEditing(false)} style={{ padding: '6px 20px', background: 'transparent', border: '2px solid var(--border-light)', borderRadius: 10 }}>Cancel</button><button onClick={handleSaveEdit} style={{ padding: '6px 24px', background: 'var(--gradient-success)', border: 'none', borderRadius: 10, color: 'white' }}>Save</button></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: 'var(--bg-primary)', borderRadius: 20, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
      <div style={{ background: 'var(--gradient-primary)', padding: '12px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div><h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>{song.title}</h2><div style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}><span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>🎵 {song.key}</span>{transposeAmt!==0 && <span style={{ background: '#ffc107', color: '#333', padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>➡️ {currentKey}</span>}{song.tempo && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>🎚️ {song.tempo}</span>}{song.song_date && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>📅 {formatDate(song.song_date)}</span>}</div></div>
          <div style={{ display: 'flex', gap: 8 }}><button onClick={() => setIsEditing(true)} style={{ background: 'white', color: 'var(--primary-600)', border: 'none', padding: '5px 12px', borderRadius: 10, fontSize: 11, cursor: 'pointer' }}>Edit</button><button onClick={onDelete} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 10, fontSize: 11, cursor: 'pointer' }}>Delete</button><button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 10, fontSize: 11, cursor: 'pointer' }}>Close</button></div>
        </div>
      </div>
      <div style={{ padding: '6px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600 }}>🎼 Transpose:</span>
        <button onClick={() => transpose(-1)} style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '3px 10px', borderRadius: 16, fontSize: 10, cursor: 'pointer' }}>-1</button>
        <button onClick={() => transpose(1)} style={{ background: 'var(--primary-600)', color: 'white', border: 'none', padding: '3px 10px', borderRadius: 16, fontSize: 10, cursor: 'pointer' }}>+1</button>
        {transposeAmt !== 0 && <button onClick={resetTranspose} style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '3px 10px', borderRadius: 16, fontSize: 10, cursor: 'pointer' }}>Reset</button>}
        {transposeAmt !== 0 && <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>{transposeAmt > 0 ? `+${transposeAmt}` : transposeAmt}</span>}
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, maxHeight: 450, overflowY: 'auto' }}>{formatLyrics(displayLyrics)}</div>
        {song.notes && <div style={{ marginTop: 12, padding: 8, background: '#fef3c7', borderRadius: 10, borderLeft: '3px solid #f59e0b', fontSize: 11 }}><strong>📝 Notes:</strong> {song.notes}</div>}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}><button onClick={() => window.print()} style={{ background: 'var(--gradient-success)', color: 'white', border: 'none', padding: '6px 20px', borderRadius: 20, fontSize: 11, cursor: 'pointer' }}>🖨️ Print</button></div>
      </div>
    </div>
  );
}

export default SongViewer;