import React, { useState } from 'react';

const CHORDS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 
                'Am', 'Em', 'Dm', 'Gm', 'Cm', 'Fm', 'Bm',
                'C7', 'G7', 'D7', 'A7', 'E7', 'Am7', 'Em7', 'Dm7'];

function SongForm({ song, onSave, onCancel }) {
  const [title, setTitle] = useState(song?.title || '');
  const [key, setKey] = useState(song?.key || 'C');
  const [tempo, setTempo] = useState(song?.tempo || '');
  const [lyrics, setLyrics] = useState(song?.lyrics_with_chords || '');
  const [showChords, setShowChords] = useState(false);
  const [songDate, setSongDate] = useState(song?.song_date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(song?.notes || '');
  const [activeTab, setActiveTab] = useState('edit');

  const insertChord = (chord) => {
    const textarea = document.getElementById('lyrics-textarea');
    if (!textarea) {
      setLyrics(lyrics + `[${chord}]`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = lyrics.substring(start, end);
    let newText;
    if (selectedText) {
      newText = lyrics.substring(0, start) + `[${chord}]${selectedText}` + lyrics.substring(end);
    } else {
      newText = lyrics.substring(0, start) + `[${chord}]` + lyrics.substring(end);
    }
    setLyrics(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + chord.length + 2;
    }, 10);
  };

  const insertNewLine = () => {
    const textarea = document.getElementById('lyrics-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const newText = lyrics.substring(0, start) + '\n' + lyrics.substring(start);
      setLyrics(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 10);
    } else {
      setLyrics(lyrics + '\n');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a song title');
      return;
    }
    onSave({ 
      id: song?.id, 
      title, 
      key, 
      tempo, 
      lyricsWithChords: lyrics,
      song_date: songDate,
      notes: notes
    });
  };

  const formatPreview = () => {
    if (!lyrics) return <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 40 }}>No lyrics to preview</p>;
    
    const lines = lyrics.split('\n');
    return lines.map((line, idx) => {
      const isHeader = /^(Verse|Chorus|Bridge|Intro|Outro|Tag)/i.test(line.trim());
      if (isHeader && line.trim().length < 30) {
        return (
          <div key={idx} style={{ marginTop: 16, marginBottom: 8 }}>
            <span style={{ 
              background: 'var(--primary-100)', 
              color: 'var(--primary-700)', 
              padding: '4px 16px', 
              borderRadius: 20, 
              fontSize: 11, 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
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
          parts.push(<span key={`t-${idx}-${last}`} style={{ color: 'var(--text-primary)' }}>{line.substring(last, match.index)}</span>);
        }
        parts.push(
          <span 
            key={`c-${idx}-${match.index}`} 
            style={{ 
              display: 'inline-block', 
              color: 'var(--primary-600)', 
              fontWeight: 'bold', 
              background: 'var(--primary-100)', 
              padding: '2px 8px', 
              borderRadius: 6, 
              marginRight: 6, 
              fontSize: 12,
              fontFamily: 'monospace'
            }}
          >
            {match[0]}
          </span>
        );
        last = match.index + match[0].length;
      }
      if (last < line.length) {
        parts.push(<span key={`t-${idx}-end`} style={{ color: 'var(--text-primary)' }}>{line.substring(last)}</span>);
      }
      if (parts.length) {
        return <div key={idx} style={{ marginBottom: 8, lineHeight: 1.7, fontSize: 13 }}>{parts}</div>;
      }
      if (line.trim()) {
        return <div key={idx} style={{ marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>{line}</div>;
      }
      return <div key={idx} style={{ marginBottom: 8 }}>&nbsp;</div>;
    });
  };

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  return (
    <div style={{
      background: 'var(--bg-primary)',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-light)'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-primary)',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{
          width: 48,
          height: 48,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24
        }}>
          {song ? '✏️' : '🎼'}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>
            {song ? 'Edit Song' : 'Add New Song'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85, color: 'white' }}>
            {song ? 'Update your song information' : 'Create a new worship song for your church'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '16px 24px 0 24px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'edit' ? 'var(--bg-secondary)' : 'transparent',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            color: activeTab === 'edit' ? 'var(--primary-600)' : 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: '12px 12px 0 0',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'preview' ? 'var(--bg-secondary)' : 'transparent',
            border: 'none',
            fontSize: 14,
            fontWeight: 600,
            color: activeTab === 'preview' ? 'var(--primary-600)' : 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: '12px 12px 0 0',
            transition: 'all 0.2s',
            position: 'relative'
          }}
        >
          👁️ Preview
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 24 }}>
        {activeTab === 'edit' ? (
          <>
            {/* Song Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                Song Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Way Maker, Amazing Grace" 
                required 
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 12,
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>

            {/* Key, Tempo, Date Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Musical Key</label>
                <select 
                  value={key} 
                  onChange={(e) => setKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 12,
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  {keys.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Tempo (BPM)</label>
                <input 
                  type="text" 
                  value={tempo} 
                  onChange={(e) => setTempo(e.target.value)} 
                  placeholder="e.g., 72"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 12,
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>📅 Date</label>
                <input 
                  type="date" 
                  value={songDate} 
                  onChange={(e) => setSongDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-primary)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 12,
                    fontSize: 14,
                    color: 'var(--text-primary)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                📝 Notes <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--text-tertiary)' }}>(optional)</span>
              </label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Add notes about this song (key change, arrangement, special instructions)..." 
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 12,
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Lyrics Section */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>Lyrics with Chords</label>
              
              <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: 12,
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                border: '1px solid var(--border-light)'
              }}>
                <button 
                  type="button" 
                  onClick={() => setShowChords(!showChords)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: showChords ? 'var(--gradient-primary)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: showChords ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>🎹</span>
                  <span>{showChords ? 'Hide Chords' : 'Show Chords'}</span>
                </button>
                <button 
                  type="button" 
                  onClick={insertNewLine}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>↵</span>
                  <span>New Line</span>
                </button>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>
                  💡 Tip: Select text then click a chord to wrap it
                </div>
              </div>

              {showChords && (
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 12,
                  marginBottom: 16,
                  border: '1px solid var(--border-light)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '10px 16px',
                    background: 'var(--bg-tertiary)',
                    borderBottom: '1px solid var(--border-light)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}>
                    🎵 Chord Library
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    padding: 16,
                    maxHeight: 160,
                    overflowY: 'auto'
                  }}>
                    {CHORDS.map(chord => (
                      <button 
                        key={chord} 
                        type="button" 
                        onClick={() => insertChord(chord)}
                        style={{
                          padding: '6px 14px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          color: 'var(--primary-600)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'var(--gradient-primary)';
                          e.target.style.color = 'white';
                          e.target.style.borderColor = 'transparent';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'var(--bg-primary)';
                          e.target.style.color = 'var(--primary-600)';
                          e.target.style.borderColor = 'var(--border-light)';
                        }}
                      >
                        {chord}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                id="lyrics-textarea"
                value={lyrics} 
                onChange={(e) => setLyrics(e.target.value)} 
                placeholder={`[Verse]\n[G]Great is Your [D]faithfulness oh [Em]God\n[C]You never [D]fail [G]me\n\n[Chorus]\n[Em]Morning by [C]morning new [G]mercies I [D]see`}
                rows={12}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 12,
                  fontSize: 13,
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-500)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
              
              <div style={{
                marginTop: 16,
                padding: '14px 16px',
                background: 'var(--primary-50)',
                borderRadius: 12,
                borderLeft: '4px solid var(--primary-500)'
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>📝 Format Guide</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-tertiary)', fontSize: 12 }}>
                  <li>Use <code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--primary-600)' }}>[Chord]</code> before the syllable - e.g., <code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--primary-600)' }}>[G]Great</code></li>
                  <li>Section headers: <code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--primary-600)' }}>[Verse]</code>, <code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--primary-600)' }}>[Chorus]</code>, <code style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--primary-600)' }}>[Bridge]</code></li>
                  <li>Select text and click a chord to wrap it automatically</li>
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            border: '1px solid var(--border-light)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-light)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}>
              <span>👁️ Live Preview</span>
              <span style={{
                background: 'var(--gradient-primary)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 11,
                color: 'white'
              }}>Key: {key}</span>
            </div>
            <div style={{
              padding: 20,
              minHeight: 300,
              maxHeight: 400,
              overflowY: 'auto',
              background: 'var(--bg-primary)'
            }}>
              {formatPreview()}
            </div>
            {notes && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: '#fef3c7',
                borderRadius: 12,
                borderLeft: '4px solid #f59e0b'
              }}>
                <strong style={{ color: '#92400e', fontSize: 12 }}>📝 Notes:</strong>
                <p style={{ marginTop: 8, color: '#78350f', fontSize: 13 }}>{notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 16,
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid var(--border-light)'
        }}>
          <button 
            type="button" 
            onClick={onCancel}
            style={{
              padding: '12px 28px',
              background: 'transparent',
              border: '2px solid var(--border-light)',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--bg-tertiary)';
              e.target.style.borderColor = 'var(--border-medium)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'var(--border-light)';
            }}
          >
            Cancel
          </button>
          {activeTab === 'edit' && (
            <button 
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 32px',
                background: 'var(--gradient-success)',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span>💾</span>
              {song ? 'Update Song' : 'Save Song'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SongForm;