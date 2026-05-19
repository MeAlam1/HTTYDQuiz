import useDragons from "./hooks/useDragons.js";
import useGameState from "./hooks/useGameState.js";
import {useEffect, useMemo, useState} from "react";
import DragonGrid from "./components/DragonGrid.jsx";
import Timer from "./components/Timer.jsx";
import TopBar from "./components/TopBar.jsx";
import GameControls from "./components/GameControls.jsx";
import ModeSelectModal from "./components/ModeSelectModal.jsx";
import ConfirmResetModal from "./components/ConfirmResetModal.jsx";
import FilterConfigModal from "./components/FilterConfigModal.jsx";

function App() {
    const [filteredClass, setFilteredClass] = useState(null);
    const [selectedOrigin, setSelectedOrigin] = useState(null);
    const [sortMode, setSortMode] = useState("class");
    const [gameMode, setGameMode] = useState("general");
    const [isModeModalOpen, setIsModeModalOpen] = useState(true);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const {dragons, classes} = useDragons();
    const [loading, setLoading] = useState(true);
    const [resetPrompt, setResetPrompt] = useState(null);

    const originList = useMemo(() => {
        return [...new Set(dragons.map((d) => d.film))].sort((a, b) => a.localeCompare(b));
    }, [dragons]);
    const classList = useMemo(() => {
        return [...new Set(dragons.map((d) => d.class))].sort((a, b) => a.localeCompare(b));
    }, [dragons]);
    const [originFilters, setOriginFilters] = useState({});
    const [classFilters, setClassFilters] = useState({});

    useEffect(() => {
        if (originList.length === 0) return;
        setOriginFilters((prev) => {
            const next = {...prev};
            originList.forEach((origin) => {
                if (next[origin] === undefined) next[origin] = true;
            });
            return next;
        });
    }, [originList]);

    useEffect(() => {
        if (classList.length === 0) return;
        setClassFilters((prev) => {
            const next = {...prev};
            classList.forEach((className) => {
                if (next[className] === undefined) next[className] = true;
            });
            return next;
        });
    }, [classList]);

    const originCounts = useMemo(() => {
        const counts = {};
        originList.forEach((origin) => {
            counts[origin] = 0;
        });
        dragons.forEach((dragon) => {
            if (gameMode === "class" && filteredClass && dragon.class !== filteredClass) return;
            if (gameMode === "origin" && selectedOrigin && dragon.film !== selectedOrigin) return;
            if (!counts[dragon.film]) counts[dragon.film] = 0;
            counts[dragon.film] += 1;
        });
        return counts;
    }, [dragons, originList, gameMode, filteredClass, selectedOrigin]);

    const classCounts = useMemo(() => {
        const counts = {};
        classList.forEach((className) => {
            counts[className] = 0;
        });
        dragons.forEach((dragon) => {
            if (gameMode === "origin" && selectedOrigin && dragon.film !== selectedOrigin) return;
            if (gameMode === "class" && filteredClass && dragon.class !== filteredClass) return;
            if (!counts[dragon.class]) counts[dragon.class] = 0;
            counts[dragon.class] += 1;
        });
        return counts;
    }, [dragons, classList, gameMode, filteredClass, selectedOrigin]);

    const availableOrigins = useMemo(() => {
        return originList.filter((origin) => (originCounts[origin] || 0) > 0);
    }, [originCounts, originList]);

    const availableClasses = useMemo(() => {
        return classList.filter((className) => (classCounts[className] || 0) > 0);
    }, [classCounts, classList]);

    useEffect(() => {
        if (availableOrigins.length === 0) return;
        setOriginFilters((prev) => {
            const next = {...prev};
            availableOrigins.forEach((origin) => {
                if (next[origin] === undefined) next[origin] = true;
            });
            const hasActive = availableOrigins.some((origin) => next[origin] !== false);
            if (!hasActive) next[availableOrigins[0]] = true;
            return next;
        });
    }, [availableOrigins]);

    useEffect(() => {
        if (availableClasses.length === 0) return;
        setClassFilters((prev) => {
            const next = {...prev};
            availableClasses.forEach((className) => {
                if (next[className] === undefined) next[className] = true;
            });
            const hasActive = availableClasses.some((className) => next[className] !== false);
            if (!hasActive) next[availableClasses[0]] = true;
            return next;
        });
    }, [availableClasses]);

    const isDragonActive = (dragon) => {
        const originEnabled = originFilters[dragon.film] !== false;
        const classEnabled = filteredClass
            ? dragon.class === filteredClass
            : classFilters[dragon.class] !== false;
        return originEnabled && classEnabled;
    };

    const activeIndices = dragons
        .map((dragon, index) => (isDragonActive(dragon) ? index : -1))
        .filter((index) => index !== -1);

    const {
        timerMode, setTimerMode,
        timeLimit, setTimeLimit, timerStarted,
        guess,
        revealed, setRevealed,
        elapsed, setStartTime, handleGuessChange, handleReset, handleQuit,
        hasStarted, allRevealed, timerRanOut, sortedIndices
    } = useGameState(dragons, filteredClass, activeIndices, sortMode);

    const filteredDragons = dragons.filter(isDragonActive);

    const uniqueFilteredDragons = Array.from(
        new Map(filteredDragons.map((d) => [d.name, d])).values()
    );

    const activeIndexSet = useMemo(() => new Set(activeIndices), [activeIndices]);
    const filteredSortedIndices = sortedIndices.filter((i) => activeIndexSet.has(i));
    const filteredRevealed = filteredSortedIndices.map((i) => revealed[i]);

    const revealedCount = new Set(
        filteredSortedIndices.filter((i) => revealed[i]).map((i) => dragons[i].name)
    ).size;

    const sortedDragonsList = filteredSortedIndices.map((i) => dragons[i]);

    useEffect(() => {
        if (dragons.length > 0) setLoading(false);
    }, [dragons]);

    useEffect(() => {
        window.completeGame = () => {
            console.log("Revealing all visible dragons...");

            if (activeIndices.length === 0) return;
            const newRevealed = [...revealed];
            activeIndices.forEach((index) => {
                newRevealed[index] = true;
            });
            setRevealed(newRevealed);
        };

        return () => {
            delete window.completeGame;
        };
    }, [activeIndices, revealed, setRevealed]);

    const requestControlChange = (action, resetOptions, message) => {
        if (!hasStarted) {
            action();
            return;
        }
        setResetPrompt({
            action,
            resetOptions,
            message: message || "Changing this setting will reset your current run. Continue?"
        });
    };

    const handleConfirmReset = () => {
        if (!resetPrompt) return;
        resetPrompt.action();
        handleReset(resetPrompt.resetOptions);
        setResetPrompt(null);
    };

    const handleCancelReset = () => {
        setResetPrompt(null);
    };

    const applyGeneralMode = () => {
        requestControlChange(() => {
            setGameMode("general");
            setFilteredClass(null);
            setSelectedOrigin(null);
            setSortMode("class");
            setIsModeModalOpen(false);
        });
    };

    const applyClassMode = (className) => {
        requestControlChange(() => {
            setGameMode("class");
            setFilteredClass(className);
            setSelectedOrigin(null);
            setSortMode("class");
            setIsModeModalOpen(false);
        });
    };

    const applyOriginMode = (origin) => {
        requestControlChange(() => {
            setGameMode("origin");
            setFilteredClass(null);
            setSelectedOrigin(origin);
            setSortMode("film");
            setOriginFilters(originList.reduce((acc, key) => {
                acc[key] = key === origin;
                return acc;
            }, {}));
            setIsModeModalOpen(false);
        });
    };

    const handleModeModalClose = () => {
        setIsModeModalOpen(false);
    };

    const handleSortModeChange = (mode) => {
        requestControlChange(() => {
            setSortMode(mode);
        });
    };

    const handleTimerModeChange = (mode) => {
        requestControlChange(
            () => {
                setTimerMode(mode);
            },
            {timerMode: mode, timeLimit}
        );
    };

    const handleTimeLimitApply = (nextLimit) => {
        requestControlChange(
            () => {
                setTimeLimit(nextLimit);
                setTimerMode("down");
            },
            {timerMode: "down", timeLimit: nextLimit}
        );
    };

    const handleApplyFilters = (nextOrigins, nextClasses) => {
        requestControlChange(() => {
            const normalizedOrigins = {...nextOrigins};
            if (availableOrigins.length > 0 && !availableOrigins.some((o) => normalizedOrigins[o] !== false)) {
                normalizedOrigins[availableOrigins[0]] = true;
            }
            const normalizedClasses = {...nextClasses};
            if (availableClasses.length > 0 && !availableClasses.some((c) => normalizedClasses[c] !== false)) {
                normalizedClasses[availableClasses[0]] = true;
            }
            setOriginFilters(normalizedOrigins);
            setClassFilters(normalizedClasses);
            setIsFilterModalOpen(false);
        });
    };

    const activeOriginCount = availableOrigins.filter((origin) => originFilters[origin] !== false).length;
    const activeClassCount = availableClasses.filter((className) => classFilters[className] !== false).length;

    return (
        <>
            <TopBar
                guess={guess}
                onGuessChange={handleGuessChange}
                revealedCount={revealedCount}
                total={uniqueFilteredDragons.length}
                timer={<Timer elapsed={elapsed}/>}
                onReset={() => handleReset()}
                onQuit={handleQuit}
            />

            {loading ? (
                <div style={{textAlign: "center", margin: "2rem"}}>Loading dragons...</div>
            ) : (
                <DragonGrid dragons={sortedDragonsList} revealed={filteredRevealed} sortMode={sortMode}/>
            )}

            {hasStarted && (allRevealed || timerRanOut) && (
                <h2 className="complete-text">
                    {allRevealed
                        ? `🎉 All done in ${Timer.formatTime(timerMode === "down" ? timeLimit * 60 - elapsed : elapsed)}!`
                        : `⏰ Time's up! You were almost there with ${revealedCount}/${uniqueFilteredDragons.length} dragons!`}
                </h2>
            )}

            <div style={{marginTop: "2rem", width: "100%"}}>
                <hr/>
                <GameControls
                    timerMode={timerMode}
                    onTimerModeChange={handleTimerModeChange}
                    timeLimit={timeLimit}
                    onTimeLimitApply={handleTimeLimitApply}
                    setStartTime={setStartTime}
                    timerStarted={timerStarted}
                    sortMode={sortMode}
                    onSortModeChange={handleSortModeChange}
                    elapsed={elapsed}
                    gameMode={gameMode}
                    onOpenModeSelect={() => setIsModeModalOpen(true)}
                    onOpenFilters={() => setIsFilterModalOpen(true)}
                    availableOrigins={availableOrigins}
                    availableClasses={availableClasses}
                    activeOriginCount={activeOriginCount}
                    activeClassCount={activeClassCount}
                />
            </div>

            <ModeSelectModal
                isOpen={isModeModalOpen}
                classes={classes}
                origins={availableOrigins}
                onSelectGeneral={applyGeneralMode}
                onSelectOrigin={applyOriginMode}
                onSelectClass={applyClassMode}
                onClose={handleModeModalClose}
            />

            <ConfirmResetModal
                isOpen={Boolean(resetPrompt)}
                message={resetPrompt?.message}
                onConfirm={handleConfirmReset}
                onCancel={handleCancelReset}
            />

            <FilterConfigModal
                isOpen={isFilterModalOpen}
                availableOrigins={availableOrigins}
                availableClasses={availableClasses}
                originFilters={originFilters}
                classFilters={classFilters}
                onApply={handleApplyFilters}
                onCancel={() => setIsFilterModalOpen(false)}
            />
        </>
    );
}

export default App;
