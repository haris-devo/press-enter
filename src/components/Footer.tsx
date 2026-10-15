import './footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-in">
        <p className="footer-big">Now you know what happens in the second after you press Enter.</p>
        <div className="footer-links">
          <p>
            Made by <a href="https://github.com/haris-devo">Haris Ahmed</a>. The source is on{' '}
            <a href="https://github.com/haris-devo/press-enter">GitHub</a>.
          </p>
          <p>
            Part of a series on frontend system design. Next: <a href="https://haris-devo.github.io/renderlab/">renderlab</a>, on how pages are rendered.
          </p>
          <p className="footer-small">The speed lab is a simple model with round numbers. Your real trip comes from your own browser.</p>
        </div>
      </div>
    </footer>
  );
}
