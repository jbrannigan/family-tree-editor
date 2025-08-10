export function parseTree(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const root = { name: 'Root', children: [] };
  const stack = [{ level: -1, node: root }];

  for (const line of lines) {
    const match = line.match(/^(\t*)(.*)$/);
    const level = match[1].length;
    const name = match[2].trim();

    const newNode = { name, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    parent.children.push(newNode);
    stack.push({ level, node: newNode });
  }

  return root.children.length === 1 ? root.children[0] : root;
}
