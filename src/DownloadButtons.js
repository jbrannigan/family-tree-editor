// DownloadButtons.js
import React from "react";

export default function DownloadButtons({
  onDownloadHTML,
  onDownloadSVG,
  onDownloadJSON,
}) {
  return (
    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={onDownloadHTML}>Download HTML</button>
      <button onClick={onDownloadSVG}>Download SVG</button>
      <button onClick={onDownloadJSON}>Download JSON</button>
      <button className="btn" onClick={handleDownloadTXT}>Save Edited Text</button>
    </div>
  );
}
