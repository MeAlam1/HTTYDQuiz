function TopBar({guess, onGuessChange, revealedCount, total, timer, onReset, onQuit}) {
    return (
        <div className="top-bar">
            <div className="info-box guess-box">
                <input
                    placeholder="Dragon name..."
                    value={guess}
                    onChange={onGuessChange}
                />
            </div>
            <div className="info-box">
                <label>Amount:</label>
                <div>{revealedCount} / {total}</div>
            </div>
            <div className="info-box">
                <label>Timer:</label>
                <div>{timer}</div>
            </div>
            <div className="button-group">
                <button className="button" onClick={onReset}>Reset</button>
                <button className="button" onClick={onQuit}>Quit</button>
            </div>
        </div>
    );
}

export default TopBar;