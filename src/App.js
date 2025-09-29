// App.js
import { useEffect, useMemo, useRef, useState } from 'react';
import TreeEditor from './TreeEditor';
import TreeView from './TreeView';
import GraphView from './GraphView';
import UploadButton from './UploadButton';
import { parseTree } from './utils/parseTree';
import { generateHTML } from './utils/generateHTML';
import { buildPedigreeTree } from './utils/buildPedigree';
import { treeToText } from './utils/treeToText';
import './App.css';

const LS_TEXT = 'fte:lastTreeText';
const LS_REMEMBER = 'fte:rememberUpload';

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
    d.getHours(),
  )}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

export default function App() {
  // Top bar state
  const [rememberUpload, setRememberUpload] = useState(true);
  const [exportFocused, setExportFocused] = useState(false);
  const [showPedigree, setShowPedigree] = useState(false);

  // Editor / data state
  const [treeText, setTreeText] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [fileName, setFileName] = useState('family-tree.txt');
  const fileHandleRef = useRef(null); // for showSaveFilePicker

  // Restore remember flag + last text once on mount
  useEffect(() => {
    const savedRemember = localStorage.getItem(LS_REMEMBER);
    setRememberUpload(savedRemember === null ? true : savedRemember === 'true');

    const savedText = localStorage.getItem(LS_TEXT);
    if (savedText != null) setTreeText(savedText);
  }, []);

  // Keep localStorage in sync (if enabled)
  useEffect(() => {
    localStorage.setItem(LS_REMEMBER, String(rememberUpload));
    if (rememberUpload) {
      localStorage.setItem(LS_TEXT, treeText ?? '');
    } else {
      localStorage.removeItem(LS_TEXT);
    }
  }, [rememberUpload, treeText]);

  // Parse into tree model
  const fullTree = useMemo(() => {
    try {
      return parseTree(treeText || '');
    } catch (e) {
      console.error('Parse error:', e);
      return [];
    }
  }, [treeText]);

  // Focus handling (for Unfocus + export focused)
  const [focusedNode, setFocusedNode] = useState(null);
  const isFocused = Boolean(focusedNode);
  const displayedTree = isFocused ? [focusedNode] : fullTree;
  const pedigreeTree = useMemo(() => {
    if (!showPedigree || !focusedNode) return null;
    const pedigree = buildPedigreeTree(fullTree, focusedNode.id);
    return pedigree && pedigree.length > 0 ? pedigree : null;
  }, [showPedigree, focusedNode, fullTree]);
  const focusExportTree = useMemo(() => {
    if (!focusedNode) return null;
    if (showPedigree && Array.isArray(pedigreeTree) && pedigreeTree.length > 0) {
      return pedigreeTree;
    }
    return [focusedNode];
  }, [focusedNode, showPedigree, pedigreeTree]);
  const handleUnfocus = () => setFocusedNode(null);

  // Editor text change
  const handleTextChange = (next) => setTreeText(next);

  // After file open
  // eslint-disable-next-line no-unused-vars
  const handleFileLoaded = async ({ text, name, handle }) => {
    setTreeText(text ?? '');
    if (name) setFileName(name);
    fileHandleRef.current = handle || null;
    if (rememberUpload) localStorage.setItem(LS_TEXT, text ?? '');
  };

  //  Save Edited Text — prefer system dialog; if user cancels, do nothing.
  //  Fall back to timestamped download only on non-cancel errors or when picker is unavailable.
  // eslint-disable-next-line no-unused-vars
  const handleSaveEdited = async () => {
    const base = (fileName && fileName.replace(/\.(txt|text|md|json|html)$/i, '')) || 'family-tree';
    const defaultTxt = `${base}-${nowStamp()}.txt`;

    const doDownload = () => {
      const blob = new Blob([treeText ?? ''], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = defaultTxt;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    };

    try {
      if ('showSaveFilePicker' in window) {
        const handle =
          fileHandleRef.current ||
          (await window.showSaveFilePicker({
            suggestedName: defaultTxt,
            types: [{ description: 'Plain text', accept: { 'text/plain': ['.txt'] } }],
          }));

        const writable = await handle.createWritable();
        await writable.write(treeText ?? '');
        await writable.close();

        fileHandleRef.current = handle;
        try {
          const fhName = handle.name || defaultTxt;
          setFileName(fhName);
        } catch {
          /* no-op */
        }
        return;
      }
      // No picker support → download
      doDownload();
    } catch (err) {
      // If user canceled the picker, just return silently.
      if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) return;
      console.warn('Save via picker failed, falling back to download:', err);
      doDownload();
    }
  };

  // Generic download helper
  const downloadAs = (ext, content, mime) => {
    const base = (fileName || 'family-tree').replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: mime }));
    a.download = `${base}-${nowStamp()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  // Choose which tree to export based on "Export focused view"
  const graphTree = focusExportTree || displayedTree;
  const hasFocusedExport = Array.isArray(focusExportTree) && focusExportTree.length > 0;
  const shouldExportFocusedTree =
    hasFocusedExport && (exportFocused || (isFocused && showPedigree));
  const exportTree = shouldExportFocusedTree ? focusExportTree : fullTree;
  const hasExport = shouldExportFocusedTree
    ? true
    : exportFocused
      ? false
      : Array.isArray(fullTree) && fullTree.length > 0;

  const handleDownloadHTML = () => {
    const html = generateHTML(exportTree ?? []);
    downloadAs('html', html, 'text/html');
  };
  const handleDownloadJSON = () => {
    const data = exportTree ?? [];
    downloadAs('json', JSON.stringify(data, null, 2), 'application/json');
  };
  const handleDownloadTXT = () => {
    const content =
      shouldExportFocusedTree && Array.isArray(focusExportTree)
        ? treeToText(focusExportTree)
        : (treeText ?? '');
    downloadAs('txt', content, 'text/plain');
  };

  const graphHostRef = useRef(null);

  const handleDownloadSVG = () => {
    // Find the SVG drawn by GraphView
    const host = graphHostRef.current;
    const svg =
      host?.querySelector('svg') || document.querySelector('#graph-view svg, .graph-view svg, svg');

    if (!svg) {
      alert('No SVG diagram found.');
      return;
    }
    const clone = svg.cloneNode(true);
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` + new XMLSerializer().serializeToString(clone);

    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    const a = document.createElement('a');
    a.href = url;
    a.download = `tree-diagram-${stamp}.svg`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  };

  return (
    <div className="app">
      {/* Top toolbar */}
      <div
        className="top-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        {/* LEFT: file/open/save */}
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <UploadButton onLoaded={handleFileLoaded} />

          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={rememberUpload}
              onChange={(e) => setRememberUpload(e.target.checked)}
            />
            Remember last upload
          </label>

          <button className="btn" onClick={handleSaveEdited}>
            Save edited text
          </button>
        </div>

        {/* RIGHT: export + downloads */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={exportFocused}
              onChange={(e) => setExportFocused(e.target.checked)}
            />
            Export focused view
          </label>

          <button className="btn" onClick={handleDownloadHTML} disabled={!hasExport}>
            Download HTML
          </button>
          <button className="btn" onClick={handleDownloadJSON} disabled={!hasExport}>
            Download JSON
          </button>
          <button className="btn" onClick={handleDownloadTXT} disabled={!hasExport}>
            Download TXT
          </button>
          <button className="btn" onClick={handleDownloadSVG} disabled={!hasExport}>
            Download SVG
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="pane left-pane">
        <h3 style={{ marginTop: 0 }}>Tree Text Editor</h3>
        <TreeEditor treeText={treeText} onTextChange={handleTextChange} />
      </div>

      {/* Tree View */}
      <div className="pane right-pane">
        <h3 style={{ marginTop: 0 }}>Tree View</h3>

        <TreeView
          tree={displayedTree}
          onFocus={(node) => setFocusedNode(node)}
          onUnfocus={handleUnfocus}
          focusedNodeId={focusedNode ? focusedNode.id : null}
          isFocused={isFocused}
        />
      </div>

      {/* Graph */}
      <div className="pane">
        <h3>Graph View</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={showPedigree}
              onChange={(e) => setShowPedigree(e.target.checked)}
              disabled={!focusedNode}
            />
            Show pedigree when focused
          </label>
        </div>
        <GraphView tree={graphTree} />
      </div>
    </div>
  );
}
