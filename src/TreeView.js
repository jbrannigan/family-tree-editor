// TreeView.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./TreeView.css";

function ensureArray(tree) {
  if (!tree) return [];
  return Array.isArray(tree) ? tree : [tree];
}

function flattenVisible(nodes, expandedSet) {
  const out = [];
  const walk = (node, level, parentId = null) => {
    out.push({ node, level, parentId });
    if (node && node.children && node.children.length && expandedSet.has(node.id)) {
      for (const child of node.children) walk(child, level + 1, node.id);
    }
  };
  for (const n of nodes) walk(n, 0, null);
  return out;
}

export default function TreeView({
  tree,
  onFocus,
  focusedNodeId,
  onUnfocus,          // handler to clear focus
  isFocused,          // boolean to control Unfocus enabled + hide guides
}) {
  const roots = ensureArray(tree);

  const allIds = useMemo(() => {
    const ids = new Set();
    const walk = (n) => { if (!n) return; ids.add(n.id); (n.children || []).forEach(walk); };
    roots.forEach(walk);
    return ids;
  }, [roots]);

  // Expanded: default expand all on mount/when data changes
  const [expanded, setExpanded] = useState(() => new Set(allIds));
  useEffect(() => { setExpanded(new Set(allIds)); }, [allIds]);

  // Roving focus (keyboard) — keep one "active" treeitem
  const [activeId, setActiveId] = useState(null);
  useEffect(() => {
    if (focusedNodeId && allIds.has(focusedNodeId)) {
      setActiveId(focusedNodeId);
    } else if (!activeId) {
      const first = roots[0]?.id ?? null;
      if (first) setActiveId(first);
    }
  }, [focusedNodeId, allIds, roots, activeId]);

  const visible = useMemo(() => flattenVisible(roots, expanded), [roots, expanded]);

  const indexById = useMemo(() => {
    const map = new Map();
    visible.forEach((row, i) => map.set(row.node.id, i));
    return map;
  }, [visible]);

  const containerRef = useRef(null);

  const toggleNode = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(allIds));
  const collapseAll = () => {
    const next = new Set();
    roots.forEach((r) => next.add(r.id)); // show just top level
    setExpanded(next);
  };

  const onKeyDown = (e) => {
    if (!activeId) return;
    const idx = indexById.get(activeId);
    if (idx == null) return;

    const row = visible[idx];
    const { node, level } = row;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const next = visible[Math.min(idx + 1, visible.length - 1)];
        if (next) setActiveId(next.node.id);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prev = visible[Math.max(idx - 1, 0)];
        if (prev) setActiveId(prev.node.id);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (hasChildren && !isExpanded) {
          toggleNode(node.id);
        } else if (hasChildren && isExpanded) {
          const next = visible[idx + 1];
          if (next) setActiveId(next.node.id);
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (hasChildren && isExpanded) {
          toggleNode(node.id);
        } else {
          const parent = visible.slice(0, idx).reverse().find((r) => r.level === level - 1);
          if (parent) setActiveId(parent.node.id);
        }
        break;
      }
      case "Enter":
      case " ": {
        if (hasChildren) {
          e.preventDefault();
          toggleNode(node.id);
        } else if (onFocus) {
          e.preventDefault();
          onFocus(node);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const first = visible[0];
        if (first) setActiveId(first.node.id);
        break;
      }
      case "End": {
        e.preventDefault();
        const last = visible[visible.length - 1];
        if (last) setActiveId(last.node.id);
        break;
      }
      default:
        break;
    }
  };

  // Scroll the active item into view when it changes
  useEffect(() => {
    if (!activeId) return;
    const el = containerRef.current?.querySelector(`[data-treeitem-id="${activeId}"]`);
    if (el && "scrollIntoView" in el) {
      el.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [activeId]);

  return (
    <div className={`tree-view${isFocused ? " is-focused" : ""}`}>
      <div className="tree-toolbar" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <button type="button" className="btn" onClick={expandAll} aria-label="Expand all">Expand all</button>
        <button type="button" className="btn" onClick={collapseAll} aria-label="Collapse all">Collapse all</button>
        <button
          type="button"
          className="btn"
          onClick={() => onUnfocus?.()}
          disabled={!isFocused}
          aria-disabled={!isFocused}
          title={isFocused ? "Restore full view" : "Nothing is focused"}
          style={{ marginLeft: 4 }}
        >
          Unfocus
        </button>
      </div>

      <div
        ref={containerRef}
        className="tree-container"
        role="tree"
        aria-label="Family tree"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <ul className="tree-root">
          {visible.map(({ node, level }) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expanded.has(node.id);
            const isActive = node.id === activeId;
            const isFocusedRow = focusedNodeId && node.id === focusedNodeId;

            return (
              <li
                key={node.id}
                role="treeitem"
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-level={level + 1}
                aria-selected={isActive}
                data-treeitem-id={node.id}
                tabIndex={isActive ? 0 : -1}
                className={`tree-row${isActive ? " is-active" : ""}${isFocusedRow ? " is-focused" : ""}`}
                style={{ display: "flex", width: "max-content", alignItems: "center", marginLeft: level * 18 }}
                onClick={() => setActiveId(node.id)}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    className="tree-toggle"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    aria-expanded={isExpanded}
                    onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                  >
                    {isExpanded ? "▾" : "▸"}
                  </button>
                ) : (
                  <span style={{ display: "inline-block", width: 22, height: 22, marginRight: 6 }} />
                )}

                <span className="tree-node-label" style={{ flex: "0 1 auto" }}>{node.name}</span>

                <button
                  type="button"
                  className="tree-focus-btn"
                  title="Focus"
                  aria-label={`Focus on ${node.name || "unnamed node"}`}
                  onClick={(e) => { e.stopPropagation(); onFocus?.(node); }}
                >
                  🔍
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
