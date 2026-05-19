import useDragons from "./hooks/useDragons.js";
import useGameState from "./hooks/useGameState.js";
import {useEffect, useMemo, useState} from "react";
import DragonGrid from "./components/DragonGrid.jsx";
import Timer from "./components/Timer.jsx";
import TopBar from "./components/TopBar.jsx";
import GameControls from "./components/GameControls.jsx";
import ModeSelectModal from "./components/ModeSelectModal.jsx";

function App() {
    const [filteredClass, setFilteredClass] = useState(null);
    const [sortMode, setSortMode] = useState("class");
    const [gameMode, setGameMode] = useState("general");
    const [isModeModalOpen, setIsModeModalOpen] = useState(true);
    const {dragons, classes} = useDragons();
    const [loading, setLoading] = useState(true);

    const originList = useMemo(() => {
        return [...new Set(dragons.map((d) => d.film))].sort((a, b) => a.localeCompare(b));
    }, [dragons]);
    const [originFilters, setOriginFilters] = useState({});

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

    const isDragonActive = (dragon) => {
        const originEnabled = originFilters[dragon.film] !== false;
        const classEnabled = !filteredClass || dragon.class === filteredClass;
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
        elapsed, setElapsed, setStartTime, handleGuessChange, handleReset, handleQuit,
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

    const applyGeneralMode = () => {
        setGameMode("general");
        setFilteredClass(null);
        setSortMode("class");
        handleReset();
        setIsModeModalOpen(false);
    };

    const applyClassMode = (className) => {
        setGameMode("class");
        setFilteredClass(className);
        setSortMode("class");
        handleReset();
        setIsModeModalOpen(false);
    };

    const applyMovieMode = () => {
        setGameMode("movie");
        setFilteredClass(null);
        setSortMode("film");
        handleReset();
        setIsModeModalOpen(false);
    };

    const handleModeModalClose = () => {
        setIsModeModalOpen(false);
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>Dragon Guessing Quiz</h1>
                <p>Prove your dragon knowledge across classes, origins, and movies.</p>
            </header>
            <TopBar
                guess={guess}
                onGuessChange={handleGuessChange}
                revealedCount={revealedCount}
                total={uniqueFilteredDragons.length}
                timer={<Timer elapsed={elapsed}/>}
                onReset={handleReset}
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
                    setTimerMode={(mode) => {
                        setTimerMode(mode);
                        handleReset();
                    }}
                    timeLimit={timeLimit}
                    setTimeLimit={(val) => {
                        setTimeLimit(val);
                        if (timerMode === "down") setElapsed(val);
                    }}
                    setStartTime={setStartTime}
                    sortMode={sortMode}
                    setSortMode={(mode) => {
                        setSortMode(mode);
                        handleReset();
                    }}
                    setElapsed={setElapsed}
                    timerStarted={timerStarted}
                    handleReset={handleReset}
                    elapsed={elapsed}
                    gameMode={gameMode}
                    onOpenModeSelect={() => setIsModeModalOpen(true)}
                    originList={originList}
                    originFilters={originFilters}
                    setOriginFilters={setOriginFilters}
                />
            </div>

            <ModeSelectModal
                isOpen={isModeModalOpen}
                classes={classes}
                onSelectGeneral={applyGeneralMode}
                onSelectMovie={applyMovieMode}
                onSelectClass={applyClassMode}
                onClose={handleModeModalClose}
            />
        </div>
    );
}

export default App;
