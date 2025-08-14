// src/utils/generateHTML.js
// Export a single function: generateHTML(tree)
// tree can be an array of roots or a single root object.

function ensureArray(tree) {
  if (!tree) return [];
  return Array.isArray(tree) ? tree : [tree];
}

// Assign stable ids if missing (used by focus/unfocus in the static HTML)
function assignIds(nodes, prefix = 'n') {
  let counter = 0;
  const walk = (node) => {
    if (!node.id) node.id = `${prefix}-${counter++}`;
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return nodes;
}

function escapeHTML(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Serialize tree to a plain object the static HTML can consume
function serialize(nodes) {
  const toPlain = (n) => ({
    id: n.id,
    name: n.name,
    children: Array.isArray(n.children) ? n.children.map(toPlain) : [],
  });
  return nodes.map(toPlain);
}

export function generateHTML(tree) {
  const roots = assignIds(ensureArray(tree));
  const data = serialize(roots);
  const json = escapeHTML(JSON.stringify(data));

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Family Tree (Static)</title>
<style>
  :root{
    --text:#111; --muted:#666; --line:#d4d4d8; --accent:#0b6efd;
    --bg:#fff; --bg-soft:#fafafa;
  }
  html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
  .wrap{max-width:1100px;margin:24px auto;padding:0 16px}
  header{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
  h1{font-size:18px;margin:0 12px 0 0}
  .btn{
    border:1px solid #ccc;background:#fff;border-radius:8px;padding:6px 10px;cursor:pointer;
  }
  .btn:hover{border-color:#999}
  .btn-ghost{border:0;background:transparent;color:var(--accent);padding:6px 8px}
  .pill{background:#f5f5f5;border:1px solid #e5e5e5;border-radius:999px;padding:4px 10px;color:#333}
  .tree{
    padding:12px;border:1px solid #eee;background:var(--bg-soft);border-radius:10px;
    overflow:auto
  }

  /* tree lines */
  .ul{list-style:none;margin:0;padding-left:18px;position:relative}
  .ul:before{
    content:"";position:absolute;left:7px;top:0;bottom:0;border-left:1px solid var(--line)
  }
  .li{position:relative;padding-left:12px;margin:4px 0}
  .li:before{
    content:"";position:absolute;left:7px;top:11px;width:10px;border-top:1px solid var(--line)
  }
  .row{
    display:flex;align-items:center;gap:8px;padding:2px 0;white-space:nowrap
  }
  .toggle{
    width:16px;display:inline-block;user-select:none;cursor:pointer;color:var(--muted)
  }
  .toggle.hidden{visibility:hidden}
  .name{font-weight:600}
  .focus{
    background:none;border:0;cursor:pointer;padding:0;margin-left:6px;color:var(--muted)
  }
  .focus:hover{color:var(--accent)}
  .muted{color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Family Tree</h1>
    <span class="pill" id="countPill"></span>
    <button class="btn" id="expandAll">Expand all</button>
    <button class="btn" id="collapseAll">Collapse all</button>
    <span class="muted" id="focusHint"></span>
    <button class="btn-ghost" id="unfocusBtn" style="display:none">Unfocus</button>
  </header>

  <div class="tree" id="treeRoot"></div>
</div>

<script>
  // ---- Data from app ----
  const ROOTS = ${json};

  // ---- State ----
  let focusedId = null;
  let expanded = Object.create(null); // id -> boolean

  const el = {
    root: document.getElementById('treeRoot'),
    countPill: document.getElementById('countPill'),
    expandAll: document.getElementById('expandAll'),
    collapseAll: document.getElementById('collapseAll'),
    unfocus: document.getElementById('unfocusBtn'),
    focusHint: document.getElementById('focusHint'),
  };

  // ---- Helpers ----
  function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

  function findNodeById(nodes, id){
    for(const n of nodes){
      if(n.id === id) return n;
      if(n.children && n.children.length){
        const found = findNodeById(n.children, id);
        if(found) return found;
      }
    }
    return null;
  }

  function visibleForest(){
    if(!focusedId) return clone(ROOTS);
    const hit = findNodeById(ROOTS, focusedId);
    return hit ? [clone(hit)] : [];
  }

  function countNodes(nodes){
    let c = 0;
    (function walk(list){
      for(const n of list){
        c++;
        if(n.children && n.children.length) walk(n.children);
      }
    })(nodes);
    return c;
  }

  // ---- Render ----
  function render(){
    const forest = visibleForest();
    el.countPill.textContent = countNodes(forest) + " nodes";
    el.unfocus.style.display = focusedId ? "" : "none";
    el.focusHint.textContent = focusedId ? "(focused)" : "";

    el.root.innerHTML = "";
    const container = document.createElement('div');

    forest.forEach((root, idx) => {
      container.appendChild(renderNode(root, 0, idx));
    });

    el.root.appendChild(container);
  }

  function renderNode(node, level, idx){
    const li = document.createElement('div');
    li.className = "li";

    const row = document.createElement('div');
    row.className = "row";

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id] !== false; // default expanded

    const tg = document.createElement('span');
    tg.className = "toggle" + (hasChildren ? "" : " hidden");
    tg.textContent = isExpanded ? "▾" : "▸";
    tg.title = isExpanded ? "Collapse" : "Expand";
    tg.onclick = () => { expanded[node.id] = !isExpanded; render(); };
    row.appendChild(tg);

    const name = document.createElement('span');
    name.className = "name";
    name.textContent = node.name || "(unnamed)";
    row.appendChild(name);

    const focusBtn = document.createElement('button');
    focusBtn.className = "focus";
    focusBtn.title = focusedId === node.id ? "Unfocus" : "Focus";
    focusBtn.textContent = focusedId === node.id ? "−" : "+";
    focusBtn.onclick = () => {
      if (focusedId === node.id) {
        focusedId = null;
      } else {
        focusedId = node.id;
        // when focusing, auto-expand this node
        expanded[node.id] = true;
      }
      render();
    };
    row.appendChild(focusBtn);

    li.appendChild(row);

    if (hasChildren && isExpanded){
      const ul = document.createElement('div');
      ul.className = "ul";
      node.children.forEach((ch, i) => ul.appendChild(renderNode(ch, level+1, i)));
      li.appendChild(ul);
    }

    return li;
  }

  // ---- Toolbar actions ----
  el.expandAll.onclick = () => {
    (function walk(list){
      for(const n of list){
        expanded[n.id] = true;
        if(n.children && n.children.length) walk(n.children);
      }
    })(ROOTS);
    render();
  };

  el.collapseAll.onclick = () => {
    (function walk(list){
      for(const n of list){
        expanded[n.id] = false;
        if(n.children && n.children.length) walk(n.children);
      }
    })(ROOTS);
    render();
  };

  el.unfocus.onclick = () => { focusedId = null; render(); };

  // first paint
  render();
</script>
</body>
</html>`;
}
