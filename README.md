# Family Tree Editor (v1.0.0-beta)

A lightweight, tab-indented text → interactive family tree editor.  
Paste or load a `.txt` with tab-indented lines and get:

- Live **Tree View** (collapsible nodes, focus/unfocus)
- **SVG View** (auto-generated diagram; downloadable)
- **Exports**: HTML, JSON, SVG (filenames include a timestamp suffix)

> **Beta:** The layout and styling are under active polish. Core parsing & views work.

---

## Demo (Quick Start)

1. **Install**
   ```bash
   npm install

3. **Run**
   ```bash
   npm start

4. **Use**
* Click **Choose File** or paste your tree text into the editor
* Expand/collapse nodes; click focus to isolate a branch
* **Unfocus** to return to the full tree
* **Download** HTML / JSON / SVG

---

## Text Format
Use tabs to indicate hierachy:
```scss
John McGinty (1870-1909) & Margaret Kirk (1871-1906)
\tJames Lynch McGinty (1896-1950) & Theresa Curtis (1894-1952)
\t\tJohn G. McGinty (1922-1991)
\t\tLoreen (1953)
