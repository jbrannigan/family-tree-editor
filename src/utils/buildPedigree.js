export function buildPedigreeTree(roots, targetId) {
  if (!Array.isArray(roots) || roots.length === 0 || !targetId) return null;

  const path = findPathToNode(roots, targetId);
  if (!path || path.length === 0) return null;

  const focusNode = path[path.length - 1];
  const focusClone = cloneWithChildren(focusNode);

  let child = focusClone;
  for (let i = path.length - 2; i >= 0; i -= 1) {
    const ancestor = path[i];
    child = {
      ...ancestor,
      children: [child],
    };
  }

  return [child];
}

function cloneWithChildren(node) {
  if (!node) return null;
  return {
    ...node,
    children: Array.isArray(node.children)
      ? node.children.map((child) => cloneWithChildren(child)).filter(Boolean)
      : [],
  };
}

function findPathToNode(roots, targetId) {
  const stack = [];

  const visit = (node) => {
    if (!node) return false;
    stack.push(node);
    if (node.id === targetId) {
      return true;
    }

    for (const child of node.children || []) {
      if (visit(child)) {
        return true;
      }
    }

    stack.pop();
    return false;
  };

  for (const root of roots) {
    if (visit(root)) {
      return stack.slice();
    }
  }

  return null;
}

export default buildPedigreeTree;
