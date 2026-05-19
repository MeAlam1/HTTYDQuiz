import {useEffect, useState} from "react";
import PauseMenu from "./PauseMenu.jsx";

function GameControls({
                          timerMode,
                          timeLimit,
                          setStartTime,
                          timerStarted,
                          sortMode,
                          elapsed,
                          gameMode,
                          onOpenConfig,
                          activeOriginCount,
                          totalOrigins,
                          activeClassCount,
                          totalClasses
                      }) {
    const [isPaused, setIsPaused] = useState(false);

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
    const sortLabel = sortMode === "class" ? "By Class" : "By Origin";
    const timerLabel = timerMode === "up" ? "Infinite" : `${timeLimit} Min`;

    return (
        <>
            <div className="game-controls-container">
                <div className="game-controls-summary">
                    <div className="summary-item">
                        <span className="summary-label">Mode:</span>
                        <span className="summary-value">{modeLabel}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Sort:</span>
                        <span className="summary-value">{sortLabel}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Timer:</span>
                        <span className="summary-value">{timerLabel}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Filters:</span>
                        <span className="summary-value">
                            Origins {activeOriginCount}/{totalOrigins}, 
                            Classes {activeClassCount}/{totalClasses}
                        </span>
                    </div>
                </div>
                <div className="game-controls-actions">
                    <button onClick={onOpenConfig} className="control-button config-trigger">
                        Configure
                    </button>
                    <button onClick={handlePause} className="control-button pause-button">
                        II
                    </button>
                </div>
            </div>
            {isPaused && <PauseMenu onResume={handleResume}/>}
        </>
    );
}

export default GameControls;
