// UserGuide.js
import './UserGuide.css';

export default function UserGuide({ onClose, onLoadClanTree }) {
  return (
    <div className="user-guide-overlay" onClick={onClose}>
      <div className="user-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-guide-header">
          <h2>Welcome to Family Tree Editor</h2>
          <button
            type="button"
            className="user-guide-close"
            onClick={onClose}
            aria-label="Close user guide"
          >
            ✕
          </button>
        </div>

        <div className="user-guide-content">
          {/* Quick Start */}
          <section className="guide-section">
            <h3>🚀 Quick Start</h3>
            <ol>
              <li>
                <strong>Write your tree</strong> in the <strong>Tree Text Editor</strong> tab using
                TreeDown format
              </li>
              <li>
                <strong>View your tree</strong> in the <strong>Tree View</strong> tab (collapsible
                list)
              </li>
              <li>
                <strong>See the diagram</strong> in the <strong>Graph View</strong> tab (visual
                chart)
              </li>
              <li>
                <strong>Export</strong> using the download buttons in the toolbar
              </li>
            </ol>
          </section>

          {/* TreeDown Format */}
          <section className="guide-section">
            <h3>📝 TreeDown Format</h3>
            <p>
              TreeDown is a plain-text family tree notation invented by Larry McGinty. Use
              indentation to show parent-child relationships:
            </p>
            <div className="guide-example">
              <pre>{`John McGinty & Margaret Kirk
    James McGinty b.1854 d.1932
        Mary (Mollie) b.1880
        Patrick McGinty b.1882 d.1945
    Ellen McGinty b.1856`}</pre>
            </div>
            <ul className="guide-tips">
              <li>
                <strong>&</strong> shows a marriage/union
              </li>
              <li>
                <strong>b.</strong> for birth, <strong>d.</strong> for death
              </li>
              <li>
                <strong>(Nickname)</strong> in parentheses
              </li>
              <li>
                <strong>Tab key</strong> to indent (press Tab once per level)
              </li>
              <li>Children inherit parent's last name unless specified</li>
            </ul>
          </section>

          {/* Navigation */}
          <section className="guide-section">
            <h3>⌨️ Keyboard Navigation</h3>
            <div className="guide-keyboard">
              <div className="guide-key-row">
                <kbd>↑</kbd> <kbd>↓</kbd> <span>Move between items</span>
              </div>
              <div className="guide-key-row">
                <kbd>←</kbd> <kbd>→</kbd> <span>Collapse/expand or navigate tree</span>
              </div>
              <div className="guide-key-row">
                <kbd>Enter</kbd> <span>Focus on selected item</span>
              </div>
              <div className="guide-key-row">
                <kbd>Space</kbd> <span>Toggle expand/collapse</span>
              </div>
              <div className="guide-key-row">
                <kbd>Esc</kbd> <span>Unfocus (return to full tree)</span>
              </div>
              <div className="guide-key-row">
                <kbd>Home</kbd> / <kbd>End</kbd> <span>Jump to first/last item</span>
              </div>
            </div>
          </section>

          {/* Focus & Export */}
          <section className="guide-section">
            <h3>🔍 Focus & Export</h3>
            <p>
              <strong>Focus</strong> lets you isolate a specific person or branch to view and export
              just that part of your tree.
            </p>

            <h4 style={{ fontSize: '15px', marginTop: '12px', marginBottom: '8px' }}>
              How to Focus
            </h4>
            <ol>
              <li>
                Go to the <strong>List</strong> tab
              </li>
              <li>
                Click the <strong>🔍 button</strong> next to any person (or press Enter when
                selected)
              </li>
              <li>The view updates to show only that person and their descendants</li>
              <li>
                Click <strong>Unfocus</strong> to return to the full tree
              </li>
            </ol>

            <h4 style={{ fontSize: '15px', marginTop: '12px', marginBottom: '8px' }}>
              Pedigree View (Ancestors Only)
            </h4>
            <p>When a person is focused, you can view their pedigree chart:</p>
            <ol>
              <li>Focus on a person in the List tab</li>
              <li>Switch to the Diagram tab</li>
              <li>
                Check <strong>"Show pedigree"</strong> to see only their direct ancestors
              </li>
            </ol>

            <h4 style={{ fontSize: '15px', marginTop: '12px', marginBottom: '8px' }}>Exporting</h4>
            <p>Choose what to export using the export panel:</p>
            <ol>
              <li>
                <strong>Format:</strong> Select one or more formats (HTML, JSON, TXT, SVG)
              </li>
              <li>
                <strong>Scope:</strong>
                <ul>
                  <li>
                    <strong>Full tree:</strong> Export everything
                  </li>
                  <li>
                    <strong>Focused subtree:</strong> Export only the currently focused branch
                    (great for sharing specific family lines)
                  </li>
                </ul>
              </li>
              <li>
                Click <strong>Export</strong> to download
              </li>
            </ol>
          </section>

          {/* Export Formats */}
          <section className="guide-section">
            <h3>💾 Export Formats</h3>
            <div className="guide-formats">
              <div className="guide-format-item">
                <strong>HTML</strong>
                <p>Interactive, collapsible tree for sharing</p>
              </div>
              <div className="guide-format-item">
                <strong>JSON</strong>
                <p>Structured data for programming</p>
              </div>
              <div className="guide-format-item">
                <strong>TXT</strong>
                <p>TreeDown format for editing</p>
              </div>
              <div className="guide-format-item">
                <strong>SVG</strong>
                <p>Vector diagram for printing</p>
              </div>
            </div>
          </section>

          {/* Tips */}
          <section className="guide-section guide-tips-section">
            <h3>💡 Tips</h3>
            <ul className="guide-tips">
              <li>
                <strong>Auto-save</strong> checkbox saves your work in browser storage
              </li>
              <li>
                <strong>Clean Up</strong> normalizes indentation and formatting
              </li>
              <li>
                <strong>Focused subtree exports</strong> are great for collaboration—share just one
                branch
              </li>
              <li>
                Use <strong>Expand All</strong> / <strong>Collapse All</strong> in List view for
                quick navigation
              </li>
            </ul>
          </section>

          {/* Accessibility */}
          <section className="guide-section">
            <h3>♿ Accessibility</h3>
            <ul className="guide-tips">
              <li>Full screen reader support with ARIA labels</li>
              <li>Complete keyboard navigation (no mouse required)</li>
              <li>Clear focus indicators throughout</li>
              <li>Roving tabindex for efficient navigation</li>
            </ul>
          </section>
        </div>

        <div className="user-guide-footer">
          {onLoadClanTree && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                onLoadClanTree();
                onClose();
              }}
              style={{ marginRight: '8px' }}
            >
              Load McGinty Clan Tree
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
