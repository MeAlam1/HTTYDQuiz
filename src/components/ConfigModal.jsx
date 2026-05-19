import {useEffect, useState} from "react";

function ConfigModal({
                         isOpen,
                         onClose,
                         onApply,
                         hasStarted,
                         
                         // Current settings
                         currentSortMode,
                         currentTimerMode,
                         currentTimeLimit,
                         currentGameMode,
                         currentFilteredClass,
                         currentSelectedOrigin,
                         currentOriginFilters,
                         currentClassFilters,
                         
                         // Available data
                         availableOrigins,
                         availableClasses,
                         allOrigins,
                         allClasses
                     }) {
    const [draftSortMode, setDraftSortMode] = useState(currentSortMode);
    const [draftTimerMode, setDraftTimerMode] = useState(currentTimerMode);
    const [draftTimeLimit, setDraftTimeLimit] = useState(currentTimeLimit);
    const [draftGameMode, setDraftGameMode] = useState(currentGameMode);
    const [draftFilteredClass, setDraftFilteredClass] = useState(currentFilteredClass);
    const [draftSelectedOrigin, setDraftSelectedOrigin] = useState(currentSelectedOrigin);
    const [draftOriginFilters, setDraftOriginFilters] = useState({});
    const [draftClassFilters, setDraftClassFilters] = useState({});

    const [showConfirmReset, setShowConfirmReset] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setDraftSortMode(currentSortMode);
        setDraftTimerMode(currentTimerMode);
        setDraftTimeLimit(currentTimeLimit);
        setDraftGameMode(currentGameMode);
        setDraftFilteredClass(currentFilteredClass);
        setDraftSelectedOrigin(currentSelectedOrigin);
        
        const initFilters = (filters, available) => {
            const next = {};
            available.forEach((key) => {
                next[key] = filters[key] !== false;
            });
            return next;
        };

        setDraftOriginFilters(initFilters(currentOriginFilters, allOrigins));
        setDraftClassFilters(initFilters(currentClassFilters, allClasses));
        setShowConfirmReset(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const isChanged = () => {
        if (draftSortMode !== currentSortMode) return true;
        if (draftTimerMode !== currentTimerMode) return true;
        if (draftTimerMode === "down" && draftTimeLimit !== currentTimeLimit) return true;
        if (draftGameMode !== currentGameMode) return true;
        if (draftFilteredClass !== currentFilteredClass) return true;
        if (draftSelectedOrigin !== currentSelectedOrigin) return true;
        
        // Check filters
        const originChanged = allOrigins.some(o => (draftOriginFilters[o] ?? true) !== (currentOriginFilters[o] ?? true));
        if (originChanged) return true;
        const classChanged = allClasses.some(c => (draftClassFilters[c] ?? true) !== (currentClassFilters[c] ?? true));
        if (classChanged) return true;

        return false;
    };

    const handleApply = () => {
        if (hasStarted && isChanged()) {
            setShowConfirmReset(true);
        } else {
            submit();
        }
    };

    const submit = () => {
        onApply({
            sortMode: draftSortMode,
            timerMode: draftTimerMode,
            timeLimit: draftTimeLimit,
            gameMode: draftGameMode,
            filteredClass: draftFilteredClass,
            selectedOrigin: draftSelectedOrigin,
            originFilters: draftOriginFilters,
            classFilters: draftClassFilters
        });
    };

    const toggleFilter = (key, current, setter) => {
        const next = {...current};
        next[key] = !next[key];
        
        // Ensure at least one is selected (optional but good practice)
        const anyActive = Object.values(next).some(v => v);
        if (!anyActive) return;
        
        setter(next);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card config-modal">
                <h3 className="modal-title">Game Configuration</h3>
                
                {showConfirmReset ? (
                    <div className="confirm-reset-area">
                        <p className="modal-subtitle warning">
                            Changing settings will reset your current progress. Are you sure?
                        </p>
                        <div className="modal-buttons">
                            <button className="modal-button danger" onClick={submit}>Yes, Reset & Apply</button>
                            <button className="modal-button secondary" onClick={() => setShowConfirmReset(false)}>Back</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="config-scroll-area">
                            <section className="config-section">
                                <h4>Game Mode</h4>
                                <div className="config-options">
                                    <button 
                                        className={`chip ${draftGameMode === "general" ? "active" : ""}`}
                                        onClick={() => {
                                            setDraftGameMode("general");
                                            setDraftFilteredClass(null);
                                            setDraftSelectedOrigin(null);
                                        }}
                                    >
                                        General
                                    </button>
                                    <button 
                                        className={`chip ${draftGameMode === "class" ? "active" : ""}`}
                                        onClick={() => setDraftGameMode("class")}
                                    >
                                        Class Focus
                                    </button>
                                    <button 
                                        className={`chip ${draftGameMode === "origin" ? "active" : ""}`}
                                        onClick={() => setDraftGameMode("origin")}
                                    >
                                        Origin Focus
                                    </button>
                                </div>
                                
                                {draftGameMode === "class" && (
                                    <div className="sub-options">
                                        {allClasses.map(c => (
                                            <button 
                                                key={c}
                                                className={`modal-chip ${draftFilteredClass === c ? "active" : ""}`}
                                                onClick={() => setDraftFilteredClass(c)}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                {draftGameMode === "origin" && (
                                    <div className="sub-options">
                                        {allOrigins.map(o => (
                                            <button 
                                                key={o}
                                                className={`modal-chip ${draftSelectedOrigin === o ? "active" : ""}`}
                                                onClick={() => setDraftSelectedOrigin(o)}
                                            >
                                                {o}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="config-section">
                                <h4>Timer</h4>
                                <div className="config-options">
                                    <button 
                                        className={`chip ${draftTimerMode === "up" ? "active" : ""}`}
                                        onClick={() => setDraftTimerMode("up")}
                                    >
                                        Count Up
                                    </button>
                                    <button 
                                        className={`chip ${draftTimerMode === "down" ? "active" : ""}`}
                                        onClick={() => setDraftTimerMode("down")}
                                    >
                                        Count Down
                                    </button>
                                    {draftTimerMode === "down" && (
                                        <div className="time-input small">
                                            <input 
                                                type="number" 
                                                value={draftTimeLimit}
                                                onChange={(e) => setDraftTimeLimit(Math.max(1, parseInt(e.target.value) || 1))}
                                            />
                                            <span>Min</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="config-section">
                                <h4>Sorting</h4>
                                <div className="config-options">
                                    <button 
                                        className={`chip ${draftSortMode === "class" ? "active" : ""}`}
                                        onClick={() => setDraftSortMode("class")}
                                    >
                                        By Class
                                    </button>
                                    <button 
                                        className={`chip ${draftSortMode === "film" ? "active" : ""}`}
                                        onClick={() => setDraftSortMode("film")}
                                    >
                                        By Origin
                                    </button>
                                </div>
                            </section>

                            <section className="config-section">
                                <h4>Filters</h4>
                                <div className="filter-group">
                                    <h5>Origins</h5>
                                    <div className="filter-grid">
                                        {allOrigins.map(o => (
                                            <label key={o} className="styled-checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    checked={draftOriginFilters[o] !== false}
                                                    onChange={() => toggleFilter(o, draftOriginFilters, setDraftOriginFilters)}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="label-text">{o}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <h5>Classes</h5>
                                    <div className="filter-grid">
                                        {allClasses.map(c => (
                                            <label key={c} className="styled-checkbox">
                                                <input 
                                                    type="checkbox" 
                                                    checked={draftClassFilters[c] !== false}
                                                    onChange={() => toggleFilter(c, draftClassFilters, setDraftClassFilters)}
                                                />
                                                <span className="checkbox-custom"></span>
                                                <span className="label-text">{c}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="modal-buttons">
                            <button className="modal-button" onClick={handleApply}>Done</button>
                            <button className="modal-button secondary" onClick={onClose}>Cancel</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ConfigModal;
