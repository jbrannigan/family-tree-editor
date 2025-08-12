// DownloadButtons.js
import React from "react";

export default function DownloadButtons({ onDownloadHTML, onDownloadSVG, onDownloadJSON, onDownloadTXT }) {
  return (
    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button className="btn" onClick={onDownloadHTML}>Download HTML</button>
      <button className="btn" onClick={onDownloadSVG}>Download SVG</button>
      <button className="btn" onClick={onDownloadJSON}>Download JSON</button>
      <button className="btn" onClick={onDownloadTXT}>Save Edited Text</button>
    </div>
  );
}
