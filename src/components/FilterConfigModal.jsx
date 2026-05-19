import {useEffect, useState} from "react";

function FilterConfigModal({
                               isOpen,
                               availableOrigins,
                               availableClasses,
                               originFilters,
                               classFilters,
                               onApply,
                               onCancel
                           }) {
    const [draftOrigins, setDraftOrigins] = useState({});
    const [draftClasses, setDraftClasses] = useState({});

    useEffect(() => {
        if (!isOpen) return;
        const initFilters = (filters, available) => {
            const next = {};
            available.forEach((key) => {
                next[key] = filters[key] !== false;
            });
            if (available.length > 0 && !available.some((key) => next[key])) {
                next[available[0]] = true;
            }
            return next;
        };

        setDraftOrigins(initFilters(originFilters, availableOrigins));
        setDraftClasses(initFilters(classFilters, availableClasses));
    }, [isOpen, originFilters, classFilters, availableOrigins, availableClasses]);

    if (!isOpen) return null;

    const toggleFilter = (key, current, setter, available) => {
        const next = {...current};
        next[key] = !(current[key] !== false);
        const activeCount = available.filter((item) => next[item] !== false).length;
        if (activeCount === 0) return;
        setter(next);
    };

    const handleApply = () => {
        onApply(draftOrigins, draftClasses);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card">
                <h3 className="modal-title">Configure Filters</h3>
                <p className="modal-subtitle">Adjust your origin and class pools, then press Done.</p>

                <div className="filter-section">
                    <div className="filter-header">Origins</div>
                    <div className="filter-grid">
                        {availableOrigins.length === 0 ? (
                            <span className="origin-empty">Loading...</span>
                        ) : (
                            availableOrigins.map((origin) => (
                                <label key={origin} className="origin-option">
                                    <input
                                        type="checkbox"
                                        checked={draftOrigins[origin] !== false}
                                        onChange={() => toggleFilter(origin, draftOrigins, setDraftOrigins, availableOrigins)}
                                    />
                                    <span>{origin}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="filter-section">
                    <div className="filter-header">Classes</div>
                    <div className="filter-grid">
                        {availableClasses.length === 0 ? (
                            <span className="origin-empty">Loading...</span>
                        ) : (
                            availableClasses.map((className) => (
                                <label key={className} className="origin-option">
                                    <input
                                        type="checkbox"
                                        checked={draftClasses[className] !== false}
                                        onChange={() => toggleFilter(className, draftClasses, setDraftClasses, availableClasses)}
                                    />
                                    <span>{className}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-buttons">
                    <button className="modal-button" onClick={handleApply}>Done</button>
                    <button className="modal-button secondary" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default FilterConfigModal;

