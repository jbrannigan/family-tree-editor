// About.js
import './UserGuide.css'; // Reuse same modal styles

export default function About({ onClose }) {
  return (
    <div className="user-guide-overlay" onClick={onClose}>
      <div className="user-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-guide-header">
          <h2>About Family Tree Editor</h2>
          <button
            type="button"
            className="user-guide-close"
            onClick={onClose}
            aria-label="Close about dialog"
          >
            ✕
          </button>
        </div>

        <div className="user-guide-content">
          {/* Version */}
          <section className="guide-section">
            <h3>ℹ️ Version</h3>
            <p>
              <strong>Family Tree Editor v1.2.0</strong>
            </p>
            <p>
              A React-based editor for building, viewing, and sharing family trees using the
              TreeDown plain-text format.
            </p>
          </section>

          {/* TreeDown Notation */}
          <section className="guide-section">
            <h3>📝 TreeDown Notation</h3>
            <p>
              <strong>TreeDown</strong> is a plain-text family tree markup language invented by{' '}
              <strong>Larry McGinty</strong>. It uses simple indentation to represent family
              relationships, making it easy to read, edit, and share.
            </p>
            <p>
              TreeDown prioritizes human readability and archival-friendly plain text, ensuring your
              family history remains accessible for generations.
            </p>
          </section>

          {/* Credits */}
          <section className="guide-section">
            <h3>👥 Credits</h3>
            <ul className="guide-tips">
              <li>
                <strong>TreeDown notation invented by:</strong> Larry McGinty
              </li>
              <li>
                <strong>Application developed by:</strong> Jim Brannigan and contributors
              </li>
              <li>
                <strong>Open source:</strong> MIT License
              </li>
            </ul>
          </section>

          {/* Links */}
          <section className="guide-section">
            <h3>🔗 Links</h3>
            <ul className="guide-tips">
              <li>
                <strong>GitHub Repository:</strong>{' '}
                <a
                  href="https://github.com/jbrannigan/family-tree-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/jbrannigan/family-tree-editor
                </a>
              </li>
              <li>
                <strong>Live Demo:</strong>{' '}
                <a
                  href="https://jbrannigan.github.io/family-tree-editor/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  jbrannigan.github.io/family-tree-editor
                </a>
              </li>
              <li>
                <strong>TreeDown Specification:</strong>{' '}
                <a
                  href="https://github.com/jbrannigan/family-tree-editor/blob/main/TREEDOWN_SPEC.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
              </li>
              <li>
                <strong>Report Issues:</strong>{' '}
                <a
                  href="https://github.com/jbrannigan/family-tree-editor/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub Issues
                </a>
              </li>
            </ul>
          </section>

          {/* Features */}
          <section className="guide-section">
            <h3>✨ Key Features</h3>
            <ul className="guide-tips">
              <li>Plain-text editing with TreeDown format</li>
              <li>Live preview in multiple views (List, Diagram)</li>
              <li>Export to HTML, JSON, SVG, and TXT</li>
              <li>Focus mode for isolating specific branches</li>
              <li>Full keyboard navigation and screen reader support</li>
              <li>Auto-save to browser storage</li>
            </ul>
          </section>

          {/* License */}
          <section className="guide-section">
            <h3>📄 License</h3>
            <p>
              <strong>Family Tree Editor:</strong> MIT License
              <br />
              <strong>TreeDown Specification:</strong> Public Domain (CC0)
            </p>
            <p style={{ fontSize: '13px', color: '#57606a', marginTop: '12px' }}>
              Copyright © 2025 Jim Brannigan and contributors
            </p>
          </section>
        </div>

        <div className="user-guide-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
