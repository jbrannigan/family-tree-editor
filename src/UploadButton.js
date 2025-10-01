// UploadButton.js
import { useRef } from 'react';

export default function UploadButton({ onLoaded }) {
  const inputRef = useRef(null);

  const handlePick = () => inputRef.current?.click();

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onLoaded?.({ text, name: file.name });
    // allow picking the same file again
    e.target.value = '';
  };

  return (
    <>
      <button type="button" className="btn" onClick={handlePick} aria-label="Open file">
        Open
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.text,.md,.csv,.json,.yaml,.yml"
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
