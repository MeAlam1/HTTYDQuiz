import {useEffect, useState} from "react";

function ModeSelectModal({isOpen, classes, origins, onSelectGeneral, onSelectOrigin, onSelectClass, onClose}) {
    const [showClassList, setShowClassList] = useState(false);
    const [showOriginList, setShowOriginList] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowClassList(false);
            setShowOriginList(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <h3 className="modal-title">Choose Game Mode</h3>
                <p className="modal-subtitle">Switching modes resets your current run.</p>
                <div className="modal-buttons">
                    <button className="modal-button" onClick={onSelectGeneral}>General Mode</button>
                    <button
                        className="modal-button"
                        onClick={() => {
                            setShowClassList(true);
                            setShowOriginList(false);
                        }}
                    >
                        Class Mode
                    </button>
                    <button
                        className="modal-button"
                        onClick={() => {
                            setShowOriginList(true);
                            setShowClassList(false);
                        }}
                    >
                        Origin Mode
                    </button>
                </div>
                {showClassList && (
                    <div className="modal-class-list">
                        {classes.map((className) => (
                            <button
                                key={className}
                                className="modal-chip"
                                onClick={() => onSelectClass(className)}
                            >
                                {className}
                            </button>
                        ))}
                    </div>
                )}
                {showOriginList && (
                    <div className="modal-class-list">
                        {origins.length === 0 ? (
                            <span className="origin-empty">Loading...</span>
                        ) : (
                            origins.map((origin) => (
                                <button
                                    key={origin}
                                    className="modal-chip"
                                    onClick={() => onSelectOrigin(origin)}
                                >
                                    {origin}
                                </button>
                            ))
                        )}
                    </div>
                )}
                <button className="modal-button secondary" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default ModeSelectModal;
