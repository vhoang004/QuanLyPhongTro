export default function Modal({ title, onClose, children, footer, size = 600 }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: size }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body-with-scroll">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
