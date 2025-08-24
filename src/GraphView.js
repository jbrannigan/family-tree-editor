// GraphView.js
import { useMemo } from 'react';

/**
 * Simple text wrapper that wraps on spaces, fallback to hard-break
 */
function wrapText(label, maxCharsPerLine = 22) {
  if (!label) return [''];
  const words = String(label).split(/\s+/);
  const lines = [];
  let line = '';

  for (const w of words) {
    if (line.length === 0) {
      // start a new line
      if (w.length <= maxCharsPerLine) {
        line = w;
      } else {
        // word longer than max: hard-break it
        for (let i = 0; i < w.length; i += maxCharsPerLine) {
          lines.push(w.slice(i, i + maxCharsPerLine));
        }
        line = '';
      }
    } else {
      if ((line + ' ' + w).length <= maxCharsPerLine) {
        line = line + ' ' + w;
      } else {
        lines.push(line);
        if (w.length <= maxCharsPerLine) {
          line = w;
        } else {
          for (let i = 0; i < w.length; i += maxCharsPerLine) {
            const chunk = w.slice(i, i + maxCharsPerLine);
            if (chunk.length === maxCharsPerLine) {
              lines.push(chunk);
            } else {
              line = chunk; // last chunk becomes current line
            }
          }
        }
      }
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Measure a node's box size from its text lines
 * We go monospaced-ish: ~7.2 px per char, 16px line height
 */
function measureNodeBox(node, config) {
  const { paddingX, paddingY, charPx, lineHeight } = config;
  const lines = wrapText(node.name, config.maxCharsPerLine);
  const maxLen = Math.max(...lines.map((l) => l.length), 1);
  const textW = maxLen * charPx;
  const textH = lines.length * lineHeight;
  const width = Math.max(config.minBoxWidth, textW + paddingX * 2);
  const height = Math.max(config.minBoxHeight, textH + paddingY * 2);
  return { lines, width, height };
}

/**
 * Compute subtree width (for sibling spacing) and decorate nodes with layout info
 */
function computeSizes(node, config) {
  const self = measureNodeBox(node, config);
  let children = Array.isArray(node.children) ? node.children : [];

  if (children.length === 0) {
    node._layout = {
      ...self,
      subtreeWidth: self.width,
      subtreeHeight: self.height,
    };
    return node._layout;
  }

  // compute children sizes first
  const childLayouts = children.map((c) => computeSizes(c, config));
  const totalChildrenWidth =
    childLayouts.reduce((acc, c) => acc + c.subtreeWidth, 0) +
    config.siblingGap * (childLayouts.length - 1);
  const subtreeWidth = Math.max(self.width, totalChildrenWidth);
  const subtreeHeight =
    self.height + config.levelGap + Math.max(...childLayouts.map((c) => c.subtreeHeight), 0);

  node._layout = {
    ...self,
    subtreeWidth,
    subtreeHeight,
  };
  return node._layout;
}

/**
 * Assign x,y positions, centering parent over children
 */
function assignPositions(node, leftX, topY, config) {
  const L = node._layout;
  const children = Array.isArray(node.children) ? node.children : [];

  // If has children, center parent over the children block.
  if (children.length > 0) {
    const totalChildrenWidth =
      children.reduce((acc, c) => acc + c._layout.subtreeWidth, 0) +
      config.siblingGap * (children.length - 1);
    const childrenLeft = leftX + (L.subtreeWidth - totalChildrenWidth) / 2;

    // parent x is centered over children span
    node._layout.x = leftX + (L.subtreeWidth - L.width) / 2;
    node._layout.y = topY;

    // position children in a row
    let cx = childrenLeft;
    const cy = topY + L.height + config.levelGap;
    for (const child of children) {
      assignPositions(child, cx, cy, config);
      cx += child._layout.subtreeWidth + config.siblingGap;
    }
  } else {
    // leaf: center the box in its subtree width
    node._layout.x = leftX + (L.subtreeWidth - L.width) / 2;
    node._layout.y = topY;
  }
}

/**
 * Render a node (box + text) and links to children
 */
function renderNode(node, config, out) {
  const L = node._layout;
  const { x, y, width, height, lines } = L;

  // Box
  out.nodes.push(
    <rect
      key={`box-${node.id || node.name}-${x}-${y}`}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={8}
      ry={8}
      fill="#fff"
      stroke="#444"
      strokeWidth="1.25"
    />,
  );

  // Text (tspan lines)
  const textX = x + width / 2;
  const textY = y + config.paddingY + config.lineHeight; // first baseline
  out.nodes.push(
    <text
      key={`text-${node.id || node.name}-${x}-${y}`}
      x={textX}
      y={textY}
      textAnchor="middle"
      fontSize="12"
      fill="#111"
      style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}
    >
      {lines.map((ln, i) => (
        <tspan key={i} x={textX} dy={i === 0 ? 0 : config.lineHeight}>
          {ln}
        </tspan>
      ))}
    </text>,
  );

  // Links
  const children = Array.isArray(node.children) ? node.children : [];
  for (const child of children) {
    const startX = x + width / 2;
    const startY = y + height;
    const endX = child._layout.x + child._layout.width / 2;
    const endY = child._layout.y;
    const midY = (startY + endY) / 2;

    out.links.push(
      <path
        key={`link-${node.id || node.name}->${child.id || child.name}`}
        d={`M${startX},${startY} V${midY} H${endX} V${endY}`}
        stroke="#888"
        fill="none"
        strokeWidth="1"
      />,
    );

    // recurse
    renderNode(child, config, out);
  }
}

function normalizeForest(tree) {
  if (!tree) return [];
  const forest = Array.isArray(tree) ? tree : [tree];
  // deep-clone to avoid mutating upstream state via _layout decorations
  return JSON.parse(JSON.stringify(forest));
}

export default function GraphView({ tree }) {
  const config = useMemo(
    () => ({
      // layout
      levelGap: 60,
      siblingGap: 24,
      // text / boxes
      maxCharsPerLine: 24,
      charPx: 7.2,
      lineHeight: 16,
      paddingX: 10,
      paddingY: 8,
      minBoxWidth: 120,
      minBoxHeight: 36,
      // outer margin
      margin: 24,
    }),
    [],
  );

  const { nodes, links, totalWidth, totalHeight } = useMemo(() => {
    const forest = normalizeForest(tree);
    if (forest.length === 0) {
      return { nodes: [], links: [], totalWidth: 800, totalHeight: 200 };
    }

    // 1) compute sizes for each root
    for (const root of forest) {
      computeSizes(root, config);
    }

    // 2) place roots left-to-right with forest gaps
    let cursorX = config.margin;
    let maxBottom = 0;
    for (const root of forest) {
      assignPositions(root, cursorX, config.margin, config);
      cursorX += root._layout.subtreeWidth + 40; // gap between separate trees
      maxBottom = Math.max(maxBottom, root._layout.y + root._layout.subtreeHeight);
    }

    // 3) render
    const out = { nodes: [], links: [] };
    for (const root of forest) {
      renderNode(root, config, out);
    }

    const totalWidth = cursorX + config.margin - 40; // remove last added gap
    const totalHeight = maxBottom + config.margin;

    return { ...out, totalWidth, totalHeight };
  }, [tree, config]);

  return (
    <div className="graph-view" style={{ marginTop: 12 }}>
      {/* <h3 style={{ marginTop: 0 }}>SVG Tree Diagram</h3>
      <br></br> */}
      <svg
        id="graph-svg"
        width="100%"
        height={Math.min(totalHeight, 1200)}
        viewBox={`0 0 ${Math.max(totalWidth, 800)} ${totalHeight}`}
        style={{ border: '1px solid #ddd', background: '#fafafa' }}
        preserveAspectRatio="xMinYMin meet"
      >
        {links}
        {nodes}
      </svg>
    </div>
  );
}
