import React, { useEffect, useState } from "react";
import flipSound from "../../public/flip.mp3";
import winSound from "../../public/win.mp3";
import loseSound from "../../public/lose.mp3";

const themes = {
  numbers: [...Array(50).keys()].map((n) => n + 1), // Numbers 1-50
  emojis: [
    "😃",
    "😂",
    "😍",
    "🤩",
    "🥳",
    "😎",
    "😇",
    "🤖",
    "🤡",
    "👽",
    "🎃",
    "💀",
    "👻",
    "🦄",
    "🐵",
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
  ],
  animals: [
    "🐶",
    "🐱",
    "🐻",
    "🐰",
    "🦊",
    "🐼",
    "🦁",
    "🐸",
    "🐯",
    "🐮",
    "🐷",
    "🐵",
    "🦉",
    "🦆",
    "🦇",
    "🦄",
    "🐢",
    "🐙",
    "🦎",
    "🦕",
  ],
  fruits: [
    "🍎",
    "🍌",
    "🍇",
    "🍉",
    "🍒",
    "🥭",
    "🍍",
    "🍓",
    "🥥",
    "🍋",
    "🍊",
    "🥝",
    "🍑",
    "🍈",
    "🥑",
    "🥦",
    "🍅",
    "🌽",
    "🍆",
    "🥕",
  ],
  sports: [
    "⚽",
    "🏀",
    "🏈",
    "🎾",
    "⚾",
    "🏐",
    "🏉",
    "🥎",
    "🥊",
    "🏓",
    "🏸",
    "🥋",
    "⛳",
    "🏹",
    "🏒",
    "🏂",
    "🛹",
    "🎿",
    "🛼",
    "🚴",
  ],
};

const MemoryGame = () => {
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);
  const [flipped, setFlippled] = useState([]);
  const [solved, setSolved] = useState([]);
  const [won, setWon] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [minMoves, setMinMoves] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [theme, setTheme] = useState("numbers");
  const [darkMode, setDarkMode] = useState(false);

  const flipAudio = new Audio(flipSound);
  const winAudio = new Audio(winSound);
  const loseAudio = new Audio(loseSound);

  const calculateTimeLimit = (gridSize) => {
    return 30 + (gridSize - 2) * 8; // Start with 20s for 2x2, increase by 5s per grid step
  };

  const initializeGame = () => {
    const totalCards = gridSize * gridSize;
    const pairCount = Math.floor(totalCards / 2);
    // Get the selected theme icons
    let themeIcons = themes[theme];

    // If not enough icons, repeat them to cover the required pairs
    while (themeIcons.length < pairCount) {
      themeIcons = [...themeIcons, ...themeIcons]; // Duplicate existing icons
    }

    // Now slice the required number of pairs
    const selectedIcons = themeIcons.slice(0, pairCount);
    const shuffledCards = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((icon, index) => ({
        id: index,
        value: icon,
      }));

    setCards(shuffledCards);
    setFlippled([]);
    setSolved([]);
    setWon(false);
    setMoves(0);
    setGameOver(false);
    const timeLimit = calculateTimeLimit(gridSize);
    setTimeLeft(timeLimit);
    setTimerRunning(true);
    setScore(0);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
      setTimerRunning(false);
      loseAudio.play();
    }
  }, [timeLeft, timerRunning]);

  useEffect(() => {
    if (moves > minMoves) {
      setGameOver(true);
      setTimerRunning(false);
      loseAudio.play();
    }
  }, [moves, minMoves]);

  useEffect(() => {
    if (
      solved.length === cards.length &&
      cards.length > 0 &&
      moves <= minMoves
    ) {
      setWon(true);
      setTimerRunning(false);
      winAudio.play();
      calculateScore();
    }
  }, [solved, cards, moves, minMoves]);

  const calculateScore = () => {
    const calculatedScore = timeLeft * 10 + (minMoves - moves) * 20;
    setScore(calculatedScore > 0 ? calculatedScore : 0);
  };

  const checkMatch = (secondId) => {
    const [firstId] = flipped;

    if (cards[firstId].value === cards[secondId].value) {
      setSolved([...solved, firstId, secondId]);
      setFlippled([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlippled([]);
        setDisabled(false);
      }, 1000);
    }
  };

  const handleClick = (id) => {
    if (disabled || won || gameOver) return;

    flipAudio.play();

    if (flipped.length === 0) {
      setFlippled([id]);
      return;
    }

    if (flipped.length === 1) {
      setDisabled(true);
      if (id !== flipped[0]) {
        setFlippled([...flipped, id]);
        setMoves((prev) => prev + 1);
        checkMatch(id);
      } else {
        setFlippled([]);
        setDisabled(false);
      }
    }
  };

  const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
  const isSolved = (id) => solved.includes(id);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="flex justify-between w-full max-w-3xl mb-6">
        <h1 className="text-4xl font-bold">Memory Game</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-gray-700 text-white rounded-full shadow-md"
        >
          {darkMode ? "🌚" : "😎"}
        </button>
      </div>

      <div className="mb-4 flex space-x-4">
        <label>Grid Size:</label>
        <input
          type="number"
          min="2"
          max="10"
          value={gridSize}
          onChange={(e) => setGridSize(parseInt(e.target.value))}
          className="border-2 border-gray-300 rounded px-2 py-1"
        />

        <label>Min Moves:</label>
        <input
          type="number"
          min="1"
          value={minMoves}
          onChange={(e) => setMinMoves(parseInt(e.target.value))}
          className="border-2 border-gray-300 rounded px-2 py-1"
        />

        <label>Theme:</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="border-2 border-gray-300 rounded px-2 py-1"
        >
          {Object.keys(themes).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2 text-lg font-semibold">
        Moves: {moves} / {minMoves} | Time Left: {timeLeft}s | Score: {score}
      </div>

      <div
        className="grid gap-2 mb-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0,1fr))`,
          width: `min(100%, ${gridSize * 5.5}rem)`,
        }}
      >
        {cards.map((card) => (
          <div
            onClick={() => handleClick(card.id)}
            className={`aspect-square flex items-center justify-center text-3xl font-bold rounded-lg cursor-pointer transition-all duration-300 ${
              isFlipped(card.id)
                ? isSolved(card.id)
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-400"
            }`}
            key={card.id}
          >
            {isFlipped(card.id) ? card.value : "?"}
          </div>
        ))}
      </div>

      {won && (
        <div className="mt-4 text-4xl font-bold text-green-500">
          You Won! Score: {score}
        </div>
      )}
      {gameOver && (
        <div className="mt-4 text-4xl font-bold text-red-500">Game Over!</div>
      )}

      <button
        onClick={initializeGame}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        {won || gameOver ? "Play Again" : "Reset"}
      </button>
    </div>
  );
};

export default MemoryGame;
