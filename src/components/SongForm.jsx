import React, { useState } from 'react';

const CHORDS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Am', 'Em', 'Dm', 'Gm', 'Cm', 'Fm', 'Bm',
  'C7', 'G7', 'D7', 'A7', 'E7', 'Am7', 'Em7', 'Dm7'
];

function SongForm({ song, onSave, onCancel }) {
  const [title, setTitle] = useState(song?.title || '');
  const [key, setKey] = useState(song?.key || 'C');
  const [tempo, setTempo] = useState(song?.tempo || '');
  const [lyrics, setLyrics] = useState(song?.lyrics_with_chords || '');
  const [showChords, setShowChords] = useState(false);
  const [songDate, setSongDate] = useState(song?.song_date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(song?.notes || '');
  const [activeTab, setActiveTab] = useState('edit');

  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Insert chord at cursor position or at end
  const insertChord = (chord) => {
    const ta = document.getElementById('lyrics-textarea');
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = lyrics.substring(start, end);
      const newText = lyrics.substring(0, start) + (selected ? `[${chord}]${selected}` : `[${chord}]`) + lyrics.substring(end);
      setLyrics(newText);
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + chord.length + 2;
      }, 10);
    } else {
      setLyrics(prev => prev + `[${chord}]`);
    }
  };

  // Insert new line at cursor
  const insertNewLine = () => {
    const ta = document.getElementById('lyrics-textarea');
    if (ta) {
      const start = ta.selectionStart;
      const newText = lyrics.substring(0, start) + '\n' + lyrics.substring(start);
      setLyrics(newText);
      setTimeout(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + 1;
      }, 10);
    } else {
      setLyrics(prev => prev + '\n');
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
      notes
    });
  };

  // Preview renderer – same as how songs will appear in viewer
  const renderPreview = () => {
    if (!lyrics.trim()) {
      return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>No lyrics to preview</div>;
    }
    const lines = lyrics.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const isHeader = /^(Verse|Chorus|Bridge|Pre-Chorus|Intro|Outro|Tag)/i.test(trimmed);
      if (isHeader && trimmed.length < 30) {
        return (
          <div key={idx} style={{ marginTop: 16, marginBottom: 8 }}>
            <span style={{
              background: 'var(--primary-100)',
              color: 'var(--primary-700)',
              padding: '2px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>{trimmed}</span>
          </div>
        );
      }
      const parts = [];
      let lastIndex = 0;
      const regex = /\[([^\]]+)\]/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(<span key={`txt-${idx}-${lastIndex}`}>{line.substring(lastIndex, match.index)}</span>);
        }
        parts.push(
          <span
            key={`chord-${idx}-${match.index}`}
            style={{
              display: 'inline-block',
              background: 'var(--primary-100)',
              color: 'var(--primary-600)',
              fontWeight: 'bold',
              padding: '1px 6px',
              borderRadius: 6,
              marginRight: 4,
              fontSize: 11,
              fontFamily: 'monospace'
            }}
          >
            {match[0]}
          </span>
        );
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(<span key={`txt-${idx}-end`}>{line.substring(lastIndex)}</span>);
      }
      if (parts.length) {
        return <div key={idx} style={{ marginBottom: 8, lineHeight: 1.6, fontSize: 13 }}>{parts}</div>;
      }
      if (line.trim()) {
        return <div key={idx} style={{ marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>{line}</div>;
      }
      return <div key={idx} style={{ marginBottom: 8 }}>&nbsp;</div>;
    });
  };

  return (
    <div style={{
      background: 'var(--bg-primary)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--border-light)'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-primary)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 36,
          height: 36,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18
        }}>
          {song ? '✏️' : '🎼'}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white' }}>
            {song ? 'Edit Song' : 'Add New Song'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.85, color: 'white' }}>
            {song ? 'Update your song' : 'Create a worship song'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '8px 16px 0',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)'
      }}>
        <button
          onClick={() => setActiveTab('edit')}
          style={{
            padding: '6px 14px',
            background: activeTab === 'edit' ? 'var(--bg-secondary)' : 'transparent',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            color: activeTab === 'edit' ? 'var(--primary-600)' : 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: '10px 10px 0 0'
          }}
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '6px 14px',
            background: activeTab === 'preview' ? 'var(--bg-secondary)' : 'transparent',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            color: activeTab === 'preview' ? 'var(--primary-600)' : 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: '10px 10px 0 0'
          }}
        >
          👁️ Preview
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: 20 }}>
        {activeTab === 'edit' ? (
          <>
            {/* Title */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: 'block' }}>
                Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Song title"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 10,
                  fontSize: 13
                }}
              />
            </div>

            {/* Key, Tempo, Date */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Key</label>
                <select
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 10,
                    background: 'var(--bg-primary)'
                  }}
                >
                  {keys.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>Tempo (BPM)</label>
                <input
                  type="text"
                  value={tempo}
                  onChange={e => setTempo(e.target.value)}
                  placeholder="e.g., 72"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 10
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>📅 Date (for service)</label>
                <input
                  type="date"
                  value={songDate}
                  onChange={e => setSongDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 10
                  }}
                />
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>📝 Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this song (arrangement, key change, etc.)"
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid var(--border-light)',
                  borderRadius: 10,
                  fontSize: 12,
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Lyrics section */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block' }}>Lyrics with Chords</label>

              {/* Toolbar */}
              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 10,
                padding: 8,
                background: 'var(--bg-secondary)',
                borderRadius: 10
              }}>
                <button
                  type="button"
                  onClick={() => setShowChords(!showChords)}
                  style={{
                    background: showChords ? 'var(--gradient-primary)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 10,
                    cursor: 'pointer'
                  }}
                >
                  🎹 {showChords ? 'Hide' : 'Show'} Chord Helper
                </button>
                <button
                  type="button"
                  onClick={insertNewLine}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 10,
                    cursor: 'pointer'
                  }}
                >
                  ↵ New Line
                </button>
                <span style={{ fontSize: 9, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                  💡 Select text then click a chord to wrap it
                </span>
              </div>

              {/* Chord helper panel */}
              {showChords && (
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: 10,
                  marginBottom: 12,
                  maxHeight: 120,
                  overflowY: 'auto',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10 }}>
                    {CHORDS.map(chord => (
                      <button
                        key={chord}
                        type="button"
                        onClick={() => insertChord(chord)}
                        style={{
                          padding: '3px 10px',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: 6,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                      >
                        {chord}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lyrics textarea */}
              <textarea
                id="lyrics-textarea"
                value={lyrics}
                onChange={e => setLyrics(e.target.value)}
                placeholder={`Example:
[Verse]
[G]Great is Your [D]faithfulness oh [Em]God
[C]You never [D]fail [G]me

[Chorus]
[Em]Morning by [C]morning new [G]mercies I [D]see
[Em]All I have [C]needed Your [D]hand hath pro[G]vided`}
                rows={10}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--border-light)',
                  borderRadius: 10,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical'
                }}
              />

              {/* Format guide */}
              <div style={{
                marginTop: 10,
                padding: 8,
                background: 'var(--primary-50)',
                borderRadius: 8,
                fontSize: 10
              }}>
                <strong>📝 Format Guide:</strong> Use <code style={{ background: 'white', padding: '1px 4px', borderRadius: 4, fontSize: 9 }}>[Chord]</code> before the syllable, e.g. <code>[G]Great</code>. Use section headers like <code>[Verse]</code>, <code>[Chorus]</code>.
              </div>
            </div>
          </>
        ) : (
          // Preview tab
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            border: '1px solid var(--border-light)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '8px 12px',
              background: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-light)',
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>👁️ Live Preview</span>
              <span style={{
                background: 'var(--gradient-primary)',
                padding: '2px 8px',
                borderRadius: 12,
                fontSize: 9,
                color: 'white'
              }}>
                Key: {key}
              </span>
            </div>
            <div style={{
              padding: 16,
              maxHeight: 400,
              overflowY: 'auto',
              background: 'var(--bg-primary)'
            }}>
              {renderPreview()}
            </div>
            {notes && (
              <div style={{
                padding: 8,
                background: '#fef3c7',
                borderTop: '1px solid #fde68a',
                fontSize: 11
              }}>
                <strong>📝 Notes:</strong> {notes}
              </div>
            )}
          </div>
        )}

        {/* Form actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 20,
          paddingTop: 16,
          borderTop: '1px solid var(--border-light)'
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '6px 20px',
              background: 'transparent',
              border: '2px solid var(--border-light)',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          {activeTab === 'edit' && (
            <button
              type="submit"
              style={{
                padding: '6px 24px',
                background: 'var(--gradient-success)',
                border: 'none',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                color: 'white',
                cursor: 'pointer'
              }}
            >
              💾 {song ? 'Update Song' : 'Save Song'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SongForm;