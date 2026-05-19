import {useEffect, useState} from "react";
import PauseMenu from "./PauseMenu.jsx";

function GameControls({
                          timerMode,
                          onTimerModeChange,
                          timeLimit,
                          onTimeLimitApply,
                          setStartTime,
                          timerStarted,
                          sortMode,
                          onSortModeChange,
                          elapsed,
                          gameMode,
                          onOpenModeSelect,
                          availableOrigins,
                          activeOriginCount,
                          originFilters,
                          onOriginToggle
                      }) {
    const [isPaused, setIsPaused] = useState(false);
    const [draftTimeLimit, setDraftTimeLimit] = useState(timeLimit);

    useEffect(() => {
        setDraftTimeLimit(timeLimit);
    }, [timeLimit]);

    const handleSetTime = () => {
        if (draftTimeLimit > 0) {
            onTimeLimitApply(draftTimeLimit);
        }
    };

    const handleInfinite = () => {
        onTimerModeChange("up");
    };

    const handlePause = () => {
        setStartTime(null);
        timerStarted.current = false;
        setIsPaused(true);
    };

    const handleResume = () => {
        const now = Date.now();
        if (timerMode === "down") {
            setStartTime(now - (timeLimit * 60 - elapsed) * 1000);
        } else {
            setStartTime(now - elapsed * 1000);
        }
        timerStarted.current = true;
        setIsPaused(false);
    };

    const modeLabel = gameMode === "class" ? "Class" : gameMode === "origin" ? "Origin" : "General";

    return (
        <>
            <div className="game-controls">
                <div className="timer-area">
                    <label>Sort:</label>
                    <button
                        onClick={() => onSortModeChange("class")}
                        className={`control-button ${sortMode === "class" ? "active" : ""}`}
                    >
                        Class
                    </button>
                    <button
                        onClick={() => onSortModeChange("film")}
                        className={`control-button ${sortMode === "film" ? "active" : ""}`}
                    >
                        Origin
                    </button>
                </div>
                <div className="timer-area">
                    <label>Timer:</label>
                    <div className="timer-buttons">
                        <button
                            onClick={handleInfinite}
                            className={`control-button ${timerMode === "up" ? "active" : ""}`}
                        >
                            ∞
                        </button>
                        <div className="time-input">
                            <input
                                type="text"
                                value={draftTimeLimit}
                                onInput={(e) => {
                                    const numericValue = e.currentTarget.value.replace(/[^0-9]/g, "");
                                    setDraftTimeLimit(Number(numericValue || 0));
                                }}
                                title="Minutes"
                            />
                            <span>Min</span>
                        </div>
                        <button
                            onClick={handleSetTime}
                            className={`control-button ${timerMode === "down" ? "countdown-button" : ""}`}
                        >
                            Set
                        </button>
                    </div>
                    <button onClick={handlePause} className="control-button pause-button">
                        II
                    </button>
                </div>
                <div className="timer-area">
                    <label>Mode:</label>
                    <span className="mode-pill">{modeLabel}</span>
                    <button
                        onClick={onOpenModeSelect}
                        className="control-button"
                    >
                        Change
                    </button>
                </div>
            </div>
            <div className="game-controls origins-row">
                <div className="timer-area origins-area">
                    <label>Origins:</label>
                    {availableOrigins.length === 0 ? (
                        <span className="origin-empty">Loading...</span>
                    ) : (
                        <details className="origin-config">
                            <summary className="origin-config-summary">
                                Filters ({activeOriginCount}/{availableOrigins.length})
                            </summary>
                            <div className="origin-config-panel">
                                {availableOrigins.map((origin) => (
                                    <label key={origin} className="origin-option">
                                        <input
                                            type="checkbox"
                                            checked={originFilters[origin] !== false}
                                            onChange={() => onOriginToggle(origin)}
                                        />
                                        <span>{origin}</span>
                                    </label>
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            </div>
            {isPaused && <PauseMenu onResume={handleResume}/>}
        </>
    );
}

export default GameControls;
