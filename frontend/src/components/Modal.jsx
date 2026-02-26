import React, { useEffect } from 'react'
import './Modal.css'

function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', confirmVariant = 'primary' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="modal-header">
                    <h2 id="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-footer">
                    <button className="btn-modal btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className={`btn-modal btn-${confirmVariant}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal
