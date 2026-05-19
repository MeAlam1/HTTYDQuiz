import {useEffect, useMemo, useRef, useState} from "react";

export default function useGameState(dragons, filteredClass, activeIndices, sortMode) {
    const [timerMode, setTimerMode] = useState("up");
    const [timeLimit, setTimeLimit] = useState(20);

    const [guess, setGuess] = useState("");
    const [revealed, setRevealed] = useState(Array(dragons.length).fill(false));
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const timerStarted = useRef(false);

    const [sortedIndices, setSortedIndices] = useState(dragons.map((_, i) => i));

    const activeIndexSet = useMemo(() => new Set(activeIndices), [activeIndices]);
    const allActiveRevealed = activeIndices.length > 0 && activeIndices.every((index) => revealed[index]);

    useEffect(() => {
        let indices = dragons.map((_, i) => i);
        if (sortMode === "film") {
            indices = [...indices].sort(
                (a, b) => (dragons[a].film || "").localeCompare(dragons[b].film || "")
            );
        } else if (sortMode === "class") {
            indices = [...indices].sort(
                (a, b) => (dragons[a].class || "").localeCompare(dragons[b].class || "")
            );
        }
        setSortedIndices(indices);
    }, [sortMode, dragons]);

    useEffect(() => {
        if (allActiveRevealed && timerStarted.current) {
            setStartTime(null);
            timerStarted.current = false;
        }
    }, [allActiveRevealed]);

    useEffect(() => {
        if (startTime === null) {
            if (!timerStarted.current) return;
            setElapsed(timerMode === "down" ? timeLimit * 60 : 0);
            return;
        }
        const interval = setInterval(() => {
            const now = Date.now();
            if (timerMode === "up") {
                setElapsed(Math.floor((now - startTime) / 1000));
            } else {
                const left = timeLimit * 60 - Math.floor((now - startTime) / 1000);
                setElapsed(left > 0 ? left : 0);
                if (left <= 0) {
                    clearInterval(interval);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, timerMode, timeLimit]);

    const handleReset = () => {
        setRevealed(Array(dragons.length).fill(false));
        setStartTime(null);
        setElapsed(timerMode === "down" ? timeLimit * 60 : 0);
        setGuess("");
        setHasStarted(false);
        timerStarted.current = false;
    };

    const handleQuit = () => {
        setStartTime(null);
        setGuess("");
        setHasStarted(false);
        timerStarted.current = false;
    };

    const handleGuessChange = (e) => {
        const value = e.target.value;
        setGuess(value);

        if (timerRanOut) {
            handleReset();
            setStartTime(Date.now());
            setHasStarted(true);
            timerStarted.current = true;
        }

        if (!timerStarted.current && value.trim() !== "") {
            setStartTime(Date.now());
            setElapsed(timerMode === "down" ? timeLimit * 60 : 0);
            setRevealed(Array(dragons.length).fill(false));
            setHasStarted(true);
            timerStarted.current = true;
        }

        const matchingIndices = dragons
            .map((dragon, index) => ({dragon, index}))
            .filter(({dragon, index}) => {
                const isValidClass = !filteredClass || dragon.class === filteredClass;
                const isActive = activeIndexSet.has(index);
                return isActive && !revealed[index] && isValidClass &&
                    dragon.name.toLowerCase() === value.trim().toLowerCase();
            })
            .map(({index}) => index);

        if (matchingIndices.length > 0) {
            const newRevealed = [...revealed];
            matchingIndices.forEach((idx) => {
                newRevealed[idx] = true;
            });
            setRevealed(newRevealed);
            setGuess("");
        }
    };

    const timerRanOut = timerMode === "down" && elapsed === 0 && timerStarted.current && !allActiveRevealed;

    return {
        timerMode, setTimerMode,
        timeLimit, setTimeLimit,
        guess, setGuess,
        revealed, setRevealed,
        startTime, setStartTime,
        elapsed, setElapsed,
        hasStarted,
        timerStarted, handleGuessChange, handleReset, handleQuit,
        allRevealed: allActiveRevealed, timerRanOut, sortedIndices
    };
}