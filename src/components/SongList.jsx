import React from 'react';

function SongList({ songs, onSelectSong, onDeleteSong }) {
  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>
        📚 All Songs ({songs.length})
      </h3>
      {songs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>No songs yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Click "Add New Song" to get started</p>
        </div>
      ) : (
        songs.map(song => (
          <div 
            key={song.id} 
            className="song-item"
            onClick={() => onSelectSong(song)}
          >
            <div>
              <strong>{song.title}</strong>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>🎵 Key: {song.key}</span>
                {song.song_date && (
                  <span style={{ color: 'var(--text-tertiary)' }}>📅 {formatDate(song.song_date)}</span>
                )}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDeleteSong(song.id); }}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default SongList;