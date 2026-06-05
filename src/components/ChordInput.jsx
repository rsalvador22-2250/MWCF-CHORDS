import React, { useState } from 'react';

const CHORD_CATEGORIES = {
  'Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'Sharp': ['C#', 'D#', 'F#', 'G#', 'A#'],
  'Minor': ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'],
  'Seventh': ['C7', 'D7', 'E7', 'G7', 'A7'],
  'Minor 7': ['Am7', 'Dm7', 'Em7'],
};

function ChordInput({ value, onChange }) {
  const [showChordHelper, setShowChordHelper] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Major');
  const [characterCount, setCharacterCount] = useState(value?.length || 0);

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCharacterCount(newValue.length);
  };

  const insertChord = (chord) => {
    const textarea = document.getElementById('chord-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText;
    if (selectedText) {
      newText = value.substring(0, start) + `[${chord}]${selectedText}` + value.substring(end);
    } else {
      newText = value.substring(0, start) + `[${chord}]` + value.substring(end);
    }
    
    onChange(newText);
    setCharacterCount(newText.length);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + chord.length + 2;
    }, 0);
  };

  const insertNewLine = () => {
    const textarea = document.getElementById('chord-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + '\n' + value.substring(start);
    onChange(newText);
    setCharacterCount(newText.length);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      textarea.focus();
    }, 0);
  };

  const clearText = () => {
    if (window.confirm('Clear all text? This cannot be undone.')) {
      onChange('');
      setCharacterCount(0);
      const textarea = document.getElementById('chord-textarea');
      if (textarea) textarea.focus();
    }
  };

  return (
    <div className="chord-input-wrapper">
      {/* Toolbar */}
      <div className="chord-toolbar">
        <div className="toolbar-left">
          <button 
            type="button" 
            className={`btn-toolbar btn-helper ${showChordHelper ? 'active' : ''}`}
            onClick={() => setShowChordHelper(!showChordHelper)}
            title="Toggle chord helper"
          >
            <span className="btn-icon">🎹</span>
            <span className="btn-label">Chords</span>
          </button>
          <button 
            type="button" 
            className="btn-toolbar btn-action"
            onClick={insertNewLine}
            title="Insert new line"
          >
            <span className="btn-icon">↵</span>
            <span className="btn-label">New Line</span>
          </button>
        </div>

        <div className="toolbar-right">
          <div className="char-counter">
            <span className="count-label">Characters:</span>
            <span className="count-number">{characterCount}</span>
          </div>
          <button 
            type="button" 
            className="btn-toolbar btn-danger"
            onClick={clearText}
            title="Clear all text"
          >
            <span className="btn-icon">🗑️</span>
          </button>
        </div>
      </div>

      {/* Chord Helper Panel */}
      {showChordHelper && (
        <div className="chord-helper-panel">
          <div className="chord-categories">
            {Object.keys(CHORD_CATEGORIES).map(category => (
              <button
                key={category}
                type="button"
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="chord-grid">
            {CHORD_CATEGORIES[activeCategory].map(chord => (
              <button
                key={chord}
                type="button"
                className="chord-btn"
                onClick={() => insertChord(chord)}
                title={`Insert ${chord} chord`}
              >
                {chord}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        id="chord-textarea"
        className="chord-textarea"
        value={value}
        onChange={handleTextChange}
        placeholder={`Example:
[Verse]
[G]Great is Your [D]faithfulness oh [Em]God
[C]You never [D]fail [G]me

[Chorus]
[Em]Morning by [C]morning new [G]mercies I [D]see
[Em]All I have [C]needed Your [D]hand hath pro[G]vided

Tips:
• Use [Chord] format to insert chord markers
• Select text and click a chord to wrap it
• Press "New Line" or just use Enter`}
        spellCheck="false"
        autoCapitalize="off"
        autoCorrect="off"
      />

      {/* Footer Info */}
      <div className="chord-footer">
        <p>💡 Tip: Select lyrics and click a chord to mark it</p>
      </div>
    </div>
  );
}

export default ChordInput;