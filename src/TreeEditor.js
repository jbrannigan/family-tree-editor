import React, { useRef, useState } from "react";
import "./TreeEditor.css";

export default function TreeEditor({ treeText, onTextChange }) {
  const [softWrap, setSoftWrap] = useState(true); // default on
  const gutterRef = useRef(null);
  const taRef = useRef(null);

  const lineCount = Math.max(1, (treeText.match(/\n/g) || []).length + 1);
  const gutterLines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  return (
    <div className="te-container">
      <div className="te-toolbar">
        <label>
          <input
            type="checkbox"
            checked={softWrap}
            onChange={(e) => setSoftWrap(e.target.checked)}
          />{" "}
          Soft wrap
        </label>
      </div>

      <div className="te-wrap">
        <div ref={gutterRef} className="te-gutter" aria-hidden="true">
          {gutterLines.map((n) => (
            <div key={n} className="te-line">
              {n}
            </div>
          ))}
        </div>

        <textarea
          ref={taRef}
          className={`te-textarea ${softWrap ? "wrap" : "nowrap"}`}
          aria-label="Family tree text editor"
          value={treeText}
          onChange={(e) => onTextChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
