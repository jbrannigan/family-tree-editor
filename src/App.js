// App.js - Fixed build cache issues
import { useEffect, useMemo, useRef, useState } from 'react';
import TreeEditor from './TreeEditor';
import TreeView from './TreeView';
import GraphView from './GraphView';
import UserGuide from './UserGuide';
import About from './About';
import { parseTree } from './utils/parseTree';
import { generateHTML } from './utils/generateHTML';
import { buildPedigreeTree } from './utils/buildPedigree';
import { treeToText } from './utils/treeToText';
import './App.css';

// Version 2: Changed localStorage keys to force fresh start for existing users
const LS_TEXT = 'fte:v2:lastTreeText';
const LS_REMEMBER = 'fte:v2:rememberUpload';

// Clean up old v1 localStorage on mount
const cleanupOldStorage = () => {
  localStorage.removeItem('fte:lastTreeText');
  localStorage.removeItem('fte:rememberUpload');
};

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
  const [exportFocused, setExportFocused] = useState(true); // Default to focused tree
  const [showPedigree, setShowPedigree] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [exportFormats, setExportFormats] = useState({
    html: true,
    json: false,
    txt: false,
    svg: false,
  });

  // Editor / data state
  const [treeText, setTreeText] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [fileName, setFileName] = useState('family-tree.txt');
  const fileHandleRef = useRef(null); // for showSaveFilePicker
  const [activeTab, setActiveTab] = useState('editor');

  // Restore remember flag + last text once on mount
  useEffect(() => {
    // Clean up old localStorage keys from v1
    cleanupOldStorage();

    const savedRemember = localStorage.getItem(LS_REMEMBER);
    setRememberUpload(savedRemember === null ? true : savedRemember === 'true');

    const savedText = localStorage.getItem(LS_TEXT);
    if (savedText != null) {
      setTreeText(savedText);
    } else {
      // Show guide if no saved text (first time user or upgraded from v1)
      setShowUserGuide(true);
    }
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

  // Enable/disable export buttons
  // Can export if we have a full tree, OR if focused mode is on AND we have a focused tree
  const canExport = Array.isArray(fullTree) && fullTree.length > 0;

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
  // If focused export is requested but nothing is focused, fall back to full tree
  const exportTree = exportFocused && focusExportTree ? focusExportTree : fullTree;
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
      exportFocused && Array.isArray(focusExportTree)
        ? treeToText(focusExportTree)
        : (treeText ?? '');
    downloadAs('txt', content, 'text/plain');
  };

  const graphHostRef = useRef(null);

  const tabs = [
    { id: 'editor', label: 'Edit' },
    { id: 'tree', label: 'List' },
    { id: 'graph', label: 'Diagram' },
  ];

  // Handle export with selected formats
  const handleExport = () => {
    if (exportFormats.html) handleDownloadHTML();
    if (exportFormats.json) handleDownloadJSON();
    if (exportFormats.txt) handleDownloadTXT();
    if (exportFormats.svg) handleDownloadSVG();
  };

  const toggleFormat = (format) => {
    setExportFormats((prev) => ({ ...prev, [format]: !prev[format] }));
  };

  const hasSelectedFormat = Object.values(exportFormats).some((v) => v);

  // Load McGinty Clan Tree from secret gist
  const handleLoadClanTree = async () => {
    // eslint-disable-next-line no-undef
    const clanTreeUrl = process.env.REACT_APP_CLAN_TREE_URL;
    if (!clanTreeUrl) {
      console.error('CLAN_TREE_URL not configured');
      return;
    }

    console.log('Loading clan tree from:', clanTreeUrl);

    try {
      // eslint-disable-next-line no-undef
      const response = await fetch(clanTreeUrl);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('Loaded tree data, length:', text.length);

      setTreeText(text);
      if (rememberUpload) {
        localStorage.setItem(LS_TEXT, text);
      }

      console.log('Successfully loaded clan tree');
    } catch (error) {
      console.error('Error loading clan tree:', error);
      alert(`Failed to load McGinty Clan Tree. Error: ${error.message}`);
    }
  };

  // Check if clan tree URL is available
  // eslint-disable-next-line no-undef
  const clanTreeAvailable = Boolean(process.env.REACT_APP_CLAN_TREE_URL);

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
      {/* User Guide Modal */}
      {showUserGuide && (
        <UserGuide
          onClose={() => setShowUserGuide(false)}
          onLoadClanTree={clanTreeAvailable ? handleLoadClanTree : null}
        />
      )}

      {/* About Modal */}
      {showAbout && <About onClose={() => setShowAbout(false)} />}

      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* App Header */}
      <header>
        <h1>Family Tree Editor</h1>
      </header>

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
        {/* LEFT: help & about */}
        <div
          role="group"
          aria-label="Help and information"
          style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <button
            className="btn"
            onClick={() => setShowUserGuide(true)}
            aria-label="Show user guide"
          >
            Help
          </button>
          <button className="btn" onClick={() => setShowAbout(true)} aria-label="About this app">
            About
          </button>
        </div>

        {/* RIGHT: export controls */}
        <div
          className="export-panel"
          role="group"
          aria-label="Export operations"
          style={{
            marginLeft: 'auto',
          }}
        >
          <div className="export-panel-content">
            {/* Export format checkboxes */}
            <div className="export-formats">
              <span className="export-label">Format:</span>
              <label
                style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}
                title="Export as interactive HTML page"
              >
                <input
                  type="checkbox"
                  checked={exportFormats.html}
                  onChange={() => toggleFormat('html')}
                  aria-label="Include HTML format"
                />
                HTML
              </label>
              <label
                style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}
                title="Export as JSON data"
              >
                <input
                  type="checkbox"
                  checked={exportFormats.json}
                  onChange={() => toggleFormat('json')}
                  aria-label="Include JSON format"
                />
                JSON
              </label>
              <label
                style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}
                title="Export as TreeDown text file"
              >
                <input
                  type="checkbox"
                  checked={exportFormats.txt}
                  onChange={() => toggleFormat('txt')}
                  aria-label="Include TXT format"
                />
                TXT
              </label>
              <label
                style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}
                title="Export as SVG diagram"
              >
                <input
                  type="checkbox"
                  checked={exportFormats.svg}
                  onChange={() => toggleFormat('svg')}
                  aria-label="Include SVG format"
                />
                SVG
              </label>
            </div>

            {/* Export scope options */}
            <div className="export-scope">
              <span className="export-label">Scope:</span>
              <div className="export-scope-options">
                <label
                  style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                  title="Export only the currently focused branch"
                >
                  <input
                    type="radio"
                    name="export-scope"
                    checked={exportFocused}
                    onChange={() => setExportFocused(true)}
                    aria-label="Export focused tree"
                  />
                  Focused tree
                </label>
                <label
                  style={{ display: 'flex', gap: 6, alignItems: 'center' }}
                  title="Export the entire family tree"
                >
                  <input
                    type="radio"
                    name="export-scope"
                    checked={!exportFocused}
                    onChange={() => setExportFocused(false)}
                    aria-label="Export full tree"
                  />
                  Full tree
                </label>
              </div>
            </div>

            {/* Single export button */}
            <button
              className="btn btn-primary"
              onClick={handleExport}
              disabled={!canExport || !hasSelectedFormat}
              aria-label={
                !canExport
                  ? 'Export (no data available)'
                  : !hasSelectedFormat
                    ? 'Export (select at least one format)'
                    : 'Export selected formats'
              }
              title={
                !canExport
                  ? 'No data to export'
                  : !hasSelectedFormat
                    ? 'Select at least one format to export'
                    : 'Download selected format(s)'
              }
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-panel">
        {activeTab === 'editor' && (
          <div className="pane">
            <TreeEditor
              treeText={treeText}
              onTextChange={handleTextChange}
              rememberUpload={rememberUpload}
              onRememberChange={setRememberUpload}
              onSave={handleSaveEdited}
              onOpen={handleFileLoaded}
            />
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="pane">
            <TreeView
              tree={displayedTree}
              onFocus={(node) => setFocusedNode(node)}
              onUnfocus={handleUnfocus}
              focusedNodeId={focusedNode ? focusedNode.id : null}
              isFocused={isFocused}
            />
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="pane" ref={graphHostRef}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <label
                style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}
                title="Show only direct ancestors (pedigree chart) when a person is focused"
              >
                <input
                  type="checkbox"
                  checked={showPedigree}
                  onChange={(e) => setShowPedigree(e.target.checked)}
                  disabled={!focusedNode}
                  aria-label="Show pedigree (ancestors only)"
                />
                Show pedigree
              </label>
            </div>
            <GraphView tree={graphTree} />
          </div>
        )}
      </div>
    </div>
  );
}
