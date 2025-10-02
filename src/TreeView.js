// TreeView.js
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import './TreeView.css';

function ensureArray(tree) {
  if (!tree) return [];
  return Array.isArray(tree) ? tree : [tree];
}

function buildIndexes(roots) {
  const allIds = new Set();
  const parentById = new Map();
  const nodeById = new Map();
  const rootIds = [];

  const walk = (node, parentId = null) => {
    if (!node) return;
    nodeById.set(node.id, node);
    allIds.add(node.id);
    if (parentId != null) parentById.set(node.id, parentId);
    (node.children || []).forEach((c) => walk(c, node.id));
  };

  for (const r of roots) {
    if (!r) continue;
    rootIds.push(r.id);
    walk(r, null);
  }
  return { allIds, nodeById, parentById, rootIds };
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
  onUnfocus, // keep existing API
  isFocused, // keep existing API
  filterText = '', // provided by App
}) {
  const roots = ensureArray(tree);

  // Indexes for fast lookups
  const { allIds, nodeById, parentById, rootIds } = useMemo(() => buildIndexes(roots), [roots]);

  // Expanded state - ALWAYS all expanded (no collapse functionality)
  const expanded = useMemo(() => new Set(allIds), [allIds]);

  // Visible rows - always show all (always expanded)
  const visible = useMemo(() => flattenVisible(roots, expanded), [roots, expanded]);

  // Active (roving) focus
  const [activeId, setActiveId] = useState(null);
  useEffect(() => {
    if (focusedNodeId && allIds.has(focusedNodeId)) {
      setActiveId(focusedNodeId);
    } else if (!activeId) {
      const first = roots[0]?.id ?? null;
      if (first) setActiveId(first);
    }
  }, [focusedNodeId, allIds, roots, activeId]);

  const indexById = useMemo(() => {
    const map = new Map();
    visible.forEach((row, i) => map.set(row.node.id, i));
    return map;
  }, [visible]);

  const containerRef = useRef(null);

  // Define search state early (before using it)
  const [localFilter, setLocalFilter] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const effectiveFilter = filterText || localFilter;
  const effectiveQ = effectiveFilter.trim().toLowerCase();

  // Filter helpers (highlight/dim)
  const matches = useCallback(
    (name) => {
      if (!effectiveQ) return true;
      const s = (name || '').toLowerCase();
      return s.includes(effectiveQ);
    },
    [effectiveQ],
  );

  const renderName = (name) => {
    if (!effectiveQ) return name || '(unnamed)';
    const raw = name || '(unnamed)';
    const low = raw.toLowerCase();
    const i = low.indexOf(effectiveQ);
    if (i === -1) return raw;
    return (
      <>
        {raw.slice(0, i)}
        <mark>{raw.slice(i, i + effectiveQ.length)}</mark>
        {raw.slice(i + effectiveQ.length)}
      </>
    );
  };

  // Get all matching nodes
  const matchingNodes = useMemo(() => {
    if (!effectiveQ) return [];
    return visible.filter(({ node }) => matches(node.name));
  }, [effectiveQ, visible, matches]);

  // When search changes, reset to first match
  useEffect(() => {
    if (!effectiveQ) {
      setCurrentMatchIndex(0);
      return;
    }
    setCurrentMatchIndex(0);
    if (matchingNodes.length > 0) {
      setActiveId(matchingNodes[0].node.id);
    }
  }, [effectiveQ, matchingNodes]);

  // Navigate to current match
  useEffect(() => {
    if (
      matchingNodes.length > 0 &&
      currentMatchIndex >= 0 &&
      currentMatchIndex < matchingNodes.length
    ) {
      setActiveId(matchingNodes[currentMatchIndex].node.id);
    }
  }, [currentMatchIndex, matchingNodes]);

  const goToNextMatch = () => {
    if (matchingNodes.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matchingNodes.length);
  };

  const goToPrevMatch = () => {
    if (matchingNodes.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matchingNodes.length) % matchingNodes.length);
  };

  // Keep active row in view
  useEffect(() => {
    if (!activeId) return;
    const el = containerRef.current?.querySelector(`[data-treeitem-id="${activeId}"]`);
    if (el) {
      // ensure it's tabbable
      el.setAttribute('tabindex', '0');
      // keep it visible
      if ('scrollIntoView' in el) {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
  }, [activeId]);

  // When the container receives focus (via Tab), move focus into the active row immediately.
  const onContainerFocus = (e) => {
    if (e.target !== containerRef.current) return;
    const row = containerRef.current?.querySelector('li.tree-row[tabindex="0"]');
    row?.focus();
  };

  const onKeyDown = (e) => {
    if (!activeId) return;
    const idx = indexById.get(activeId);
    if (idx == null) return;

    const row = visible[idx];
    const { node } = row;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = visible[Math.min(idx + 1, visible.length - 1)];
        if (next) setActiveId(next.node.id);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = visible[Math.max(idx - 1, 0)];
        if (prev) setActiveId(prev.node.id);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        // If already focused on this node, unfocus; otherwise focus
        if (focusedNodeId === node.id) {
          onUnfocus?.();
        } else {
          onFocus?.(node);
        }
        break;
      }
      case 'Escape': {
        if (isFocused && onUnfocus) {
          e.preventDefault();
          onUnfocus();
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = visible[0];
        if (first) setActiveId(first.node.id);
        break;
      }
      case 'End': {
        e.preventDefault();
        const last = visible[visible.length - 1];
        if (last) setActiveId(last.node.id);
        break;
      }
      default:
        break;
    }
  };

  // Helper to expose aria-posinset / aria-setsize
  const getSiblingMeta = (parentId, childId) => {
    const siblings = parentId ? nodeById.get(parentId)?.children || [] : roots;
    const setsize = siblings.length || undefined;
    const ix = siblings.findIndex((s) => s && s.id === childId);
    const posinset = ix >= 0 ? ix + 1 : undefined;
    return { posinset, setsize };
  };

  return (
    <div className={`tree-view${isFocused ? ' is-focused' : ''}${effectiveQ ? ' has-filter' : ''}`}>
      <div
        className="tree-toolbar"
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}
      >
        <input
          type="search"
          placeholder="Search tree..."
          value={localFilter}
          onChange={(e) => setLocalFilter(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (e.shiftKey) {
                goToPrevMatch();
              } else {
                goToNextMatch();
              }
            }
          }}
          className="tree-search"
          aria-label="Search family tree"
          style={{
            flex: 1,
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
        {effectiveQ && (
          <>
            <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>
              {matchingNodes.length > 0
                ? `${currentMatchIndex + 1}/${matchingNodes.length}`
                : '0/0'}
            </span>
            <button
              type="button"
              className="btn"
              onClick={goToPrevMatch}
              disabled={matchingNodes.length === 0}
              aria-label="Previous match"
              title="Previous match (Shift+Enter)"
              style={{ padding: '4px 8px', fontSize: '14px' }}
            >
              ↑
            </button>
            <button
              type="button"
              className="btn"
              onClick={goToNextMatch}
              disabled={matchingNodes.length === 0}
              aria-label="Next match"
              title="Next match (Enter)"
              style={{ padding: '4px 8px', fontSize: '14px' }}
            >
              ↓
            </button>
          </>
        )}
        {isFocused && (
          <button
            type="button"
            className="btn"
            onClick={() => onUnfocus?.()}
            aria-label="Show full tree"
            title="Show full tree (Esc)"
            style={{ marginLeft: 'auto' }}
          >
            Show All
          </button>
        )}
      </div>
      <p className="tree-hint" aria-live="polite">
        Keys: ↑/↓ move • Enter focuses node • Esc unfocuses
      </p>
      <div
        ref={containerRef}
        className="tree-container"
        role="tree"
        aria-label="Family tree"
        tabIndex={0}
        onFocus={onContainerFocus}
        onKeyDown={onKeyDown}
      >
        <ul className="tree-root" role="none">
          {visible.map(({ node, level, parentId }) => {
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = expanded.has(node.id);
            const isActive = node.id === activeId;
            const isFocusedRow = focusedNodeId && node.id === focusedNodeId;
            const isRootAndNoFocus = level === 0 && !focusedNodeId;
            const hit = matches(node.name);
            const { posinset, setsize } = getSiblingMeta(parentId, node.id);

            return (
              <li
                key={node.id}
                role="treeitem"
                aria-level={level + 1}
                aria-posinset={posinset}
                aria-setsize={setsize}
                aria-selected={isActive}
                data-treeitem-id={node.id}
                tabIndex={isActive ? 0 : -1}
                className={
                  'tree-row' +
                  (isActive ? ' is-active' : '') +
                  (isFocusedRow ? ' is-focused' : '') +
                  (effectiveQ && !hit ? ' is-dim' : '')
                }
                style={{
                  display: 'flex',
                  width: 'max-content',
                  alignItems: 'center',
                  marginLeft: level * 24,
                  gap: '8px',
                }}
                onClick={() => setActiveId(node.id)}
              >
                {level > 0 && (
                  <div className="tree-connector">
                    <span className="tree-branch">└─</span>
                  </div>
                )}

                <button
                  type="button"
                  className="tree-focus-btn"
                  title={
                    isFocusedRow
                      ? 'Unfocus (Enter) - Show full tree in Diagram'
                      : 'Focus (Enter) - Filter Diagram to this node'
                  }
                  aria-label={
                    isFocusedRow
                      ? `Unfocus ${node.name || 'unnamed node'}`
                      : `Focus on ${node.name || 'unnamed node'} - filters Diagram tab`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFocusedRow) {
                      onUnfocus?.();
                    } else {
                      onFocus?.(node);
                    }
                  }}
                >
                  {isFocusedRow || isRootAndNoFocus ? (
                    <span className="crosshair">⌖</span>
                  ) : (
                    <span className="circle">○</span>
                  )}
                </button>

                <span className="tree-node-label" style={{ flex: '0 1 auto' }}>
                  {renderName(node.name)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
