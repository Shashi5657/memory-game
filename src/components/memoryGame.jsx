import React, { useEffect, useState } from "react";
import flipSound from "../../public/flip.mp3";
import winSound from "../../public/win.mp3";
import loseSound from "../../public/lose.mp3";

// Themes
const themes = {
  numbers: [...Array(50).keys()].map((n) => n + 1),
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
  // State definitions
  const [gridSize, setGridSize] = useState(4);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
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

  // Audio
  const flipAudio = new Audio(flipSound);
  const winAudio = new Audio(winSound);
  const loseAudio = new Audio(loseSound);

  // Calculate time limit
  const calculateTimeLimit = (size) => {
    return 30 + (size - 2) * 8; // Adjust as you prefer
  };

  // Initialize game
  const initializeGame = () => {
    const totalCards = gridSize * gridSize;
    const pairCount = Math.floor(totalCards / 2);
    let themeIcons = themes[theme];

    // If theme doesn't have enough icons, duplicate until we have enough
    while (themeIcons.length < pairCount) {
      themeIcons = [...themeIcons, ...themeIcons];
    }

    // Slice the required pairs, shuffle and map
    const selectedIcons = themeIcons.slice(0, pairCount);
    const shuffledCards = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalCards)
      .map((icon, index) => ({
        id: index,
        value: icon,
      }));

    setCards(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setWon(false);
    setMoves(0);
    setGameOver(false);

    const timeLimit = calculateTimeLimit(gridSize);
    setTimeLeft(timeLimit);
    setTimerRunning(true);
    setScore(0);
  };

  // Timer effect
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

  // Moves effect (if moves exceed minMoves -> Game over)
  useEffect(() => {
    if (moves > minMoves) {
      setGameOver(true);
      setTimerRunning(false);
      loseAudio.play();
    }
  }, [moves, minMoves]);

  // Check for win
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

  // Calculate score
  const calculateScore = () => {
    const calculatedScore = timeLeft * 10 + (minMoves - moves) * 20;
    setScore(calculatedScore > 0 ? calculatedScore : 0);
  };

  // Check match logic
  const checkMatch = (secondId) => {
    const [firstId] = flipped;
    if (cards[firstId].value === cards[secondId].value) {
      setSolved([...solved, firstId, secondId]);
      setFlipped([]);
      setDisabled(false);
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, 800);
    }
  };

  // Handle card click
  const handleClick = (id) => {
    if (disabled || won || gameOver) return;
    flipAudio.play();

    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }

    if (flipped.length === 1) {
      setDisabled(true);
      if (id !== flipped[0]) {
        setFlipped([...flipped, id]);
        setMoves((prev) => prev + 1);
        checkMatch(id);
      } else {
        // Clicked the same card, just reset
        setFlipped([]);
        setDisabled(false);
      }
    }
  };

  // Card states
  const isFlipped = (id) => flipped.includes(id) || solved.includes(id);
  const isSolved = (id) => solved.includes(id);

  return (
    <div
      className={`
        min-h-screen w-full
        flex flex-col items-center justify-center 
        px-4 py-8
        transition-all
        ${
          darkMode
            ? "bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white"
            : "bg-gradient-to-r from-purple-50 via-white to-purple-100 text-gray-800"
        }
      `}
    >
      {/* Header Section */}
      <div className="flex justify-between w-full max-w-3xl mb-6 px-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider">
          Memory Game
        </h1>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`
            rounded-full p-2 text-xl 
            transition-all 
            ${
              darkMode
                ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }
          `}
        >
          {darkMode ? "🌚" : "🌞"}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-center mb-6 text-sm md:text-base">
        {/* Grid Size */}
        <div className="flex flex-col items-center">
          <label className="font-semibold mb-1">Grid Size</label>
          <input
            type="number"
            min="2"
            max="10"
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value) || 2)}
            className="w-16 px-2 py-1 border-2 border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Minimum Moves */}
        <div className="flex flex-col items-center">
          <label className="font-semibold mb-1">Min Moves</label>
          <input
            type="number"
            min="1"
            value={minMoves}
            onChange={(e) => setMinMoves(parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 border-2 border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Theme Selector */}
        <div className="flex flex-col items-center">
          <label className="font-semibold mb-1">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-2 py-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {Object.keys(themes).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Game Stats */}
      <div className="flex flex-col items-center mb-4 text-base md:text-lg font-semibold">
        <p>
          Moves: {moves} / {minMoves}
        </p>
        <p>Time Left: {timeLeft}s</p>
        <p>Score: {score}</p>
      </div>

      {/* Game Grid */}
      <div
        className="grid gap-3 md:gap-4 mb-4"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0,1fr))`,
          // Limit the max width to avoid overflowing on larger grid sizes
          width: `min(100%, ${gridSize * 5.2}rem)`,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`
              aspect-square flex items-center justify-center 
              cursor-pointer select-none rounded-md 
              shadow-lg transform transition-transform duration-300 
              text-xl md:text-2xl 
              ${
                isFlipped(card.id)
                  ? isSolved(card.id)
                    ? "bg-green-500 text-white scale-105"
                    : "bg-blue-500 text-white scale-105"
                  : "bg-gray-300 text-transparent hover:scale-105 hover:shadow-xl"
              }
            `}
          >
            {isFlipped(card.id) ? card.value : "?"}
          </div>
        ))}
      </div>

      {/* Game Status Messages */}
      {won && (
        <div className="mt-4 text-2xl md:text-3xl font-bold text-green-600">
          You Won! Score: {score}
        </div>
      )}
      {gameOver && !won && (
        <div className="mt-4 text-2xl md:text-3xl font-bold text-red-600">
          Game Over!
        </div>
      )}

      {/* Reset / Play Again Button */}
      <button
        onClick={initializeGame}
        className={`
          mt-6 px-6 py-2 
          rounded-md text-base font-bold 
          transition-transform transform hover:scale-105 
          ${
            darkMode
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }
        `}
      >
        {won || gameOver ? "Play Again" : "Reset"}
      </button>
    </div>
  );
};

export default MemoryGame;
