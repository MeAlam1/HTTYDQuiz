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
                          onOpenFilters,
                          availableOrigins,
                          availableClasses,
                          activeOriginCount,
                          activeClassCount
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

    const originSummary = availableOrigins.length > 0
        ? `${activeOriginCount}/${availableOrigins.length}`
        : "0/0";
    const classSummary = availableClasses.length > 0
        ? `${activeClassCount}/${availableClasses.length}`
        : "0/0";

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
                <div className="timer-area">
                    <label>Filters:</label>
                    <span className="filter-summary">Origins {originSummary}</span>
                    <span className="filter-summary">Classes {classSummary}</span>
                    <button onClick={onOpenFilters} className="control-button">
                        Configure
                    </button>
                </div>
            </div>
            {isPaused && <PauseMenu onResume={handleResume}/>}
        </>
    );
}

export default GameControls;
