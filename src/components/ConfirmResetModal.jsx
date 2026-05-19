function ConfirmResetModal({isOpen, message, onConfirm, onCancel}) {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <h3 className="modal-title">Reset current run?</h3>
                <p className="modal-subtitle">{message}</p>
                <div className="modal-buttons">
                    <button className="modal-button" onClick={onConfirm}>Reset & Continue</button>
                    <button className="modal-button secondary" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmResetModal;

