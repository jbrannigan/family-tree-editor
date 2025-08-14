import { useRef, useState } from 'react';
import './TreeEditor.css';

export default function TreeEditor({ treeText, onTextChange }) {
  const [softWrap, setSoftWrap] = useState(true);
  const gutterRef = useRef(null);
  const taRef = useRef(null);

  const NL = '\n';

  const lineCount = Math.max(1, (treeText.match(/\n/g) || []).length + 1);
  const gutterLines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  const normalizeTextIndentation = (t) =>
    (t ?? '')
      .split('\n')
      .map((line) => {
        const m = line.match(/^[ \t]*/)?.[0] ?? '';
        const tabs = m.replace(/ {4}/g, '\t').replace(/ +(?=\t)/g, '');
        return tabs + line.slice(m.length);
      })
      .join('\n');

  const updateCursorLine = () => {
    const ta = taRef.current;
    if (!ta) return;
    const pos = typeof ta.selectionStart === 'number' ? ta.selectionStart : 0;
    const upto = treeText.slice(0, pos).split(NL).length;
    setCursorLine(upto);
  };

  const [cursorLine, setCursorLine] = useState(1);

  const handleKeyDown = (e) => {
    if (e.key !== 'Tab' || !taRef.current) return;
    e.preventDefault();

    const ta = taRef.current;
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;

    const text = treeText;
    const lineStart = text.lastIndexOf(NL, selStart - 1) + 1;
    const lineEnd = text.indexOf(NL, selEnd);
    const sliceEnd = lineEnd === -1 ? text.length : lineEnd;

    const before = text.slice(0, lineStart);
    const middle = text.slice(lineStart, sliceEnd);
    const after = text.slice(sliceEnd);

    if (e.shiftKey) {
      // outdent: remove one leading tab or up to 4 spaces per line
      const out = middle.replace(/^(?:\t| {1,4})/gm, '');
      onTextChange(before + out + after);
      requestAnimationFrame(() => {
        ta.setSelectionRange(Math.max(selStart - 1, lineStart), Math.max(selEnd - 1, lineStart));
      });
    } else {
      // indent: add one tab to each selected line
      const lines = (middle.match(/\n/g) || []).length + 1;
      const out = middle.replace(/^/gm, '\t');
      onTextChange(before + out + after);
      requestAnimationFrame(() => {
        ta.setSelectionRange(selStart + 1, selEnd + lines);
      });
    }
  };

  return (
    <div className="tree-editor">
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={softWrap}
            onChange={(e) => setSoftWrap(e.target.checked)}
            aria-label="Soft wrap"
          />
          <span>Soft wrap</span>
        </label>

        <button
          type="button"
          className="btn"
          onClick={() => {
            onTextChange(normalizeTextIndentation(treeText));
            requestAnimationFrame(() => taRef.current?.focus());
          }}
          aria-label="Normalize indentation"
          title="Convert leading 4-space groups to tabs"
        >
          Normalize indentation
        </button>
      </div>

      <div className="te-wrap">
        <div ref={gutterRef} className="te-gutter" aria-hidden="true">
          {gutterLines.map((n) => (
            <div key={n} className={`te-line ${n === cursorLine ? 'active' : ''}`}>
              {n}
            </div>
          ))}
        </div>

        <textarea
          ref={taRef}
          className={`te-textarea ${softWrap ? 'wrap' : 'nowrap'}`}
          aria-label="Family tree text editor"
          value={treeText}
          onChange={(e) => onTextChange(e.target.value)}
          onScroll={handleScroll}
          onClick={updateCursorLine}
          onKeyUp={updateCursorLine}
          onSelect={updateCursorLine}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
