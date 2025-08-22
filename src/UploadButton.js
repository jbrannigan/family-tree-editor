// UploadButton.js
import { useRef } from 'react';

export default function UploadButton({ onLoad, className }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof onLoad === 'function') onLoad(String(reader.result || ''));
      // reset so picking the same file again still fires change
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <button type="button" className={className} onClick={openPicker}>
        Choose File
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
