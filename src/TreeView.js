// TreeView.js
import { useEffect, useMemo, useRef, useState } from 'react';
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
  onUnfocus,        // keep existing API
  isFocused,        // keep existing API
  filterText = '',  // provided by App
}) {
  const roots = ensureArray(tree);

  // Indexes for fast lookups
  const { allIds, nodeById, parentById, rootIds } = useMemo(
    () => buildIndexes(roots),
    [roots]
  );

  // Expanded state; initialize with everything open (reasonable default)
  const [expanded, setExpanded] = useState(() => new Set(allIds));
  useEffect(() => {
    // when data changes (not filtering), keep user's expansion as-is;
    // if filtering, we'll handle expansion in the filter effect below.
    if (!filterText.trim()) {
      // Ensure at least roots are present in expanded set
      setExpanded((prev) => {
        const next = new Set([...prev].filter((id) => allIds.has(id)));
        if (next.size === 0) rootIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [allIds, rootIds, filterText]);

  // Remember user's expansion while filtering
  const prevExpandedRef = useRef(null);
  const wasFilteringRef = useRef(false);

  const q = filterText.trim().toLowerCase();

  // Visible rows depend on expanded set
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
    rootIds.forEach((id) => next.add(id)); // show just top level
    setExpanded(next);
  };

  // Filter helpers (highlight/dim)
  const matches = (name) => {
    if (!q) return true;
    const s = (name || '').toLowerCase();
    return s.includes(q);
  };
  const renderName = (name) => {
    if (!q) return name || '(unnamed)';
    const raw = name || '(unnamed)';
    const low = raw.toLowerCase();
    const i = low.indexOf(q);
    if (i === -1) return raw;
    return (
      <>
        {raw.slice(0, i)}
        <mark>{raw.slice(i, i + q.length)}</mark>
        {raw.slice(i + q.length)}
      </>
    );
  };

  // SMART FILTER EXPANSION:
  // When q becomes non-empty: save expansion, then expand only ancestors of matches (+roots)
  // When q clears: restore previous expansion (intersecting current ids)
  useEffect(() => {
    const nowFiltering = !!q;

    if (nowFiltering && !wasFilteringRef.current) {
      // entering filter
      wasFilteringRef.current = true;
      prevExpandedRef.current = new Set(expanded);

      // Compute ancestors of matches
      const toExpand = new Set(rootIds);
      for (const id of allIds) {
        const n = nodeById.get(id);
        if (!n) continue;
        if (matches(n.name)) {
          // add all ancestors up to root
          let cur = id;
          while (cur != null) {
            const parent = parentById.get(cur);
            if (parent != null) toExpand.add(parent);
            cur = parent ?? null;
          }
        }
      }
      setExpanded(toExpand);
    } else if (!nowFiltering && wasFilteringRef.current) {
      // leaving filter
      wasFilteringRef.current = false;
      const saved = prevExpandedRef.current || new Set();
      const restore = new Set();
      for (const id of saved) if (allIds.has(id)) restore.add(id);
      // If nothing to restore, keep roots visible
      if (restore.size === 0) rootIds.forEach((id) => restore.add(id));
      setExpanded(restore);
      prevExpandedRef.current = null;
    }
  }, [q, allIds, nodeById, parentById, rootIds, expanded]);

  // When starting a filter, move focus to the first visible match
  useEffect(() => {
    if (!q) return;
    const firstMatch = visible.find(({ node }) => matches(node.name));
    if (firstMatch && firstMatch.node.id !== activeId) {
      setActiveId(firstMatch.node.id);
    }
  }, [q, visible, activeId]);

  // Keep active row in view
  useEffect(() => {
    if (!activeId) return;
    const el = containerRef.current?.querySelector(`[data-treeitem-id="${activeId}"]`);
    if (el && 'scrollIntoView' in el) {
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [activeId]);

  const onKeyDown = (e) => {
    if (!activeId) return;
    const idx = indexById.get(activeId);
    if (idx == null) return;

    const row = visible[idx];
    const { node, level } = row;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);

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
      case 'ArrowRight': {
        e.preventDefault();
        if (hasChildren && !isExpanded) {
          toggleNode(node.id);
        } else if (hasChildren && isExpanded) {
          const next = visible[idx + 1];
          if (next) setActiveId(next.node.id);
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (hasChildren && isExpanded) {
          toggleNode(node.id);
        } else {
          const parent = visible
            .slice(0, idx)
            .reverse()
            .find((r) => r.level === level - 1);
          if (parent) setActiveId(parent.node.id);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        if (hasChildren) {
          e.preventDefault();
          toggleNode(node.id);
        } else if (onFocus) {
          e.preventDefault();
          onFocus(node);
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

  return (
    <div className={`tree-view${isFocused ? ' is-focused' : ''}${q ? ' has-filter' : ''}`}>
      <div
        className="tree-toolbar"
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}
      >
        <button type="button" className="btn" onClick={expandAll} aria-label="Expand all">
          Expand all
        </button>
        <button type="button" className="btn" onClick={collapseAll} aria-label="Collapse all">
          Collapse all
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => onUnfocus?.()}
          disabled={!isFocused}
          aria-disabled={!isFocused}
          title={isFocused ? 'Restore full view' : 'Nothing is focused'}
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
            const hit = matches(node.name);

            return (
              <li
                key={node.id}
                role="treeitem"
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-level={level + 1}
                aria-selected={isActive}
                data-treeitem-id={node.id}
                tabIndex={isActive ? 0 : -1}
                className={
                  'tree-row' +
                  (isActive ? ' is-active' : '') +
                  (isFocusedRow ? ' is-focused' : '') +
                  (q && !hit ? ' is-dim' : '')
                }
                style={{
                  display: 'flex',
                  width: 'max-content',
                  alignItems: 'center',
                  marginLeft: level * 18,
                }}
                onClick={() => setActiveId(node.id)}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    className="tree-toggle"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    aria-expanded={isExpanded}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(node.id);
                    }}
                  >
                    {isExpanded ? '▾' : '▸'}
                  </button>
                ) : (
                  <span
                    style={{ display: 'inline-block', width: 22, height: 22, marginRight: 6 }}
                  />
                )}

                <span className="tree-node-label" style={{ flex: '0 1 auto' }}>
                  {renderName(node.name)}
                </span>

                <button
                  type="button"
                  className="tree-focus-btn"
                  title="Focus"
                  aria-label={`Focus on ${node.name || 'unnamed node'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocus?.(node);
                  }}
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
