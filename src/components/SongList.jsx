import React from 'react';

function SongList({ songs, onSelectSong, onDeleteSong }) {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <h3 style={{
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 12,
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span>📚</span> All Songs <span style={{ fontSize: 11, fontWeight: 'normal' }}>({songs.length})</span>
      </h3>

      {songs.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '30px 16px',
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '1px solid var(--border-light)'
        }}>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 4 }}>No songs yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Click "Add New Song" to start</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {songs.map(song => (
            <div
              key={song.id}
              className="song-item"
              onClick={() => onSelectSong(song)} // Diretsong pindot, agad nagpapalit
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid transparent',
                gap: 8
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'block',
                  marginBottom: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {song.title}
                </strong>
                <div style={{ display: 'flex', gap: 10, fontSize: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>🎵 {song.key}</span>
                  {song.tempo && <span style={{ color: 'var(--text-tertiary)' }}>🎚️ {song.tempo}</span>}
                  {song.song_date && <span style={{ color: 'var(--text-tertiary)' }}>📅 {formatDate(song.song_date)}</span>}
                  {song.notes && (
                    <span style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span>📝</span>
                      <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {song.notes.length > 20 ? song.notes.substring(0, 20) + '…' : song.notes}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSong(song.id);
                }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  color: 'var(--danger)',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--danger)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                  e.currentTarget.style.color = 'var(--danger)';
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SongList;