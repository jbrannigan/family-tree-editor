// TreeView.js
import React, { useState } from "react";
import "./TreeView.css";

function Row({ children, level }) {
  return (
    <div
      className="tree-row"
      style={{ marginLeft: level * 18 }} // indentation
    >
      {children}
    </div>
  );
}

function Toggle({ visible, expanded, onClick }) {
  if (!visible) return <span className="tree-toggle-spacer" />;
  return (
    <button
      type="button"
      className="tree-toggle"
      aria-label={expanded ? "Collapse" : "Expand"}
      aria-expanded={expanded}
      onClick={onClick}
    >
      {expanded ? "▾" : "▸"}
    </button>
  );
}

function TreeNode({ node, level, onFocus, focusedNodeId }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const isFocused = focusedNodeId === node.id;

  return (
    <li className="tree-node">
      <Row level={level}>
        <Toggle
          visible={hasChildren}
          expanded={expanded}
          onClick={() => setExpanded((e) => !e)}
        />

        <span className={`tree-node-name ${isFocused ? "focused" : ""}`}>
          {node.name || "(unnamed)"}
        </span>

        {/* de-emphasized focus control */}
        {!isFocused && (
          <button
            type="button"
            className="tree-focus-btn"
            title="Focus"
            aria-label={`Focus on ${node.name || "unnamed node"}` }
            onClick={() => onFocus(node)}
          >
            🔍
          </button>
        )}
      </Row>

      {hasChildren && expanded && (
        <ul className="tree-children">
          {node.children.map((child, i) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onFocus={onFocus}
              focusedNodeId={focusedNodeId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeView({ tree, onFocus, focusedNodeId }) {
  if (!tree) return <div>No tree data available</div>;
  const nodes = Array.isArray(tree) ? tree : [tree];

  return (
    <div className="tree-view">
      <ul className="tree-root">
        {nodes.map((n, i) => (
          <TreeNode
            key={n.id}
            node={n}
            level={0}
            onFocus={onFocus}
            focusedNodeId={focusedNodeId}
          />
        ))}
      </ul>
    </div>
  );
}
