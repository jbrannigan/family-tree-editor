// App.js
import React, { useState, useEffect, useRef } from "react";
import TreeEditor from "./TreeEditor";
import TreeView from "./TreeView";
import GraphView from "./GraphView";
import UploadButton from "./UploadButton";
import DownloadButtons from "./DownloadButtons";
import { parseTree } from "./utils/parseTree";
import { generateHTML } from "./utils/generateHTML";
import "./App.css";

const App = () => {
  const [treeText, setTreeText] = useState("");
  const [treeData, setTreeData] = useState([]);           // full parsed tree (array)
  const [focusedNode, setFocusedNode] = useState(null);   // node object when focused

// Width of the left (editor) pane in pixels. Starts at 50%.
const containerRef = useRef(null);
const [leftWidth, setLeftWidth] = useState(0); // 0 means "compute 50% on mount"
const [dragging, setDragging] = useState(false);

useEffect(() => {
  // Initialize leftWidth to half of the container width on first render
  if (leftWidth === 0 && containerRef.current) {
    const w = containerRef.current.clientWidth;
    setLeftWidth(Math.round(w * 0.5));
  }
}, [leftWidth]);

useEffect(() => {
  const onMove = (e) => {
    if (!dragging || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    // Clamp to [min, max] so panes can’t collapse or overlap
    const min = 220;                          // min editor width
    const max = bounds.width - 220;           // min tree width
    const x = Math.min(max, Math.max(min, e.clientX - bounds.left));
    setLeftWidth(x);
  };

  const onUp = () => setDragging(false);

  if (dragging) {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }
  return () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  };
}, [dragging]); 
  // Parse text -> tree
  useEffect(() => {
    try {
      const parsed = parseTree(treeText) || [];
      setTreeData(parsed);
    } catch (err) {
      console.error("Error parsing tree:", err);
      setTreeData([]);
    }
  }, [treeText]);

  // Helper: returns like "-05AUG2025-2310"
  const tsSuffix = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const mmm = months[d.getMonth()];
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `-${dd}${mmm}${yyyy}-${hh}${mm}`;
  };

  // File + editor handlers
  const handleFileLoad = (text) => setTreeText(text);
  const handleTextChange = (text) => setTreeText(text);

  // Focus handlers
  const handleFocus = (node) => setFocusedNode(node);
  const handleUnfocus = () => setFocusedNode(null);

  // What to render (focused sub-tree vs full tree)
  const displayedTree = focusedNode ? [focusedNode] : treeData;

  // Downloads
  const handleDownloadHTML = () => {
    // Use treeData for HTML export of whole source text doc; 
    // change to displayedTree if you want export to respect focus
    // const html = generateHTML(treeData); // <-Full Tree
    const html = generateHTML(displayedTree); // <-Foces Tree
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family_tree${tsSuffix()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
// NEW: save edited text as .txt
  const handleDownloadTXT = () => {
    const blob = new Blob([treeText ?? ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family_tree_text${tsSuffix()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDownloadJSON = () => {
    // Use treeData for JSON export of whole source text doc; 
    // change to displayedTree if you want export to respect focus
    //const json = JSON.stringify(treeData, null, 2); //<-Full Tree
    const json = JSON.stringify(displayedTree, null, 2); //<-Focues Tree
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family_tree${tsSuffix()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSVG = () => {
    // Assumes GraphView sets id="graph-svg" on the <svg>. No-op if not present.
    const svgEl = document.getElementById("graph-svg");
    if (!svgEl) {
      console.warn("SVG element not found for download.");
      return;
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family_tree${tsSuffix()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container" style={{ padding: "1rem" }}>
      {/* Header / toolbar */}
      <div className="top-bar">

        <UploadButton className= "btn btn-primary" onLoad={handleFileLoad} />

        <button className="btn" onClick={handleDownloadTXT} aria-label="Save Edited Text">
          Save Edited Text
       </button>
      
        <button className="btn" onClick={handleDownloadHTML} aria-label="Download HTML">
          Download HTML
        </button>

        <button className="btn" onClick={handleDownloadSVG} aria-label="Download SVG">
          Download SVG
        </button>

        <button className="btn" onClick={handleDownloadJSON} aria-label="Download JSON">
          Download JSON
        </button>

  {/* push Unfocus to the right (optional) */}
  <div className="spacer" />

  {focusedNode && (
    <button
      className="btn btn-ghost"
      onClick={handleUnfocus}
      aria-label="Unfocus"
      title="Unfocus"
    >
      Unfocus
    </button>
  )}
  </div>

{/* Top split: editor + tree with resizer */}
<div
  className="split"
  ref={containerRef}
  style={{ minHeight: 300 }}
>
  <div
    className="pane left-pane"
    style={{ width: leftWidth || "50%" }}
  >
    <h3 style={{ marginTop: 0 }}>Tree Text Editor</h3>
    <TreeEditor treeText={treeText} onTextChange={handleTextChange} />
  </div>

  <div
    className={`resizer ${dragging ? "dragging" : ""}`}
    role="separator"
    aria-label="Resize editor and tree panes"
    aria-orientation="vertical"
    tabIndex={0}
    onMouseDown={() => setDragging(true)}
    onKeyDown={(e) => {
      // keyboard nudges for accessibility
      if (e.key === "ArrowLeft") setLeftWidth((w) => Math.max(220, w - 16));
      if (e.key === "ArrowRight" && containerRef.current) {
        const max = containerRef.current.clientWidth - 220;
        setLeftWidth((w) => Math.min(max, w + 16));
      }
    }}
  />

  <div className="pane right-pane">
    <h3 style={{ marginTop: 0 }}>Tree View</h3>
    <p>Click on 🔍 to focus on a part of the tree</p>
    <li>This will then be reflected in the SVG Tree Diagram, below</li>
    <li>When the Tree View is focused, the downloaded file(s) will also reflect the focused view</li>
    <li>Afterwards, use the "Unfocus" button to restore the full view</li>
    <br></br>
    <TreeView
      tree={displayedTree}
      onFocus={handleFocus}
      onUnfocus={handleUnfocus}
      focusedNodeId={focusedNode ? focusedNode.id : null}
    />
  </div>
</div>

      {/* Bottom: SVG view */}
      <div style={{ marginTop: 16 }}>
        <GraphView tree={displayedTree} />
      </div>
    </div>
  );
};

export default App;
