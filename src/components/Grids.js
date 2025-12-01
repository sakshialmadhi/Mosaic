import React, { useEffect, useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import bgImage from "../resources/mastercard.png";

const initialImages = [
];

export default function FullScreenGrid() {
  const [itemData, setItemData] = useState(initialImages);
  const [total, setTotal] = useState(9);
  const [randomGrid, setRandomGrid] = useState([]);
  const [newImgUrl, setNewImgUrl] = useState("");
  const [flyingImg, setFlyingImg] = useState(null);

  // Dynamic grid sizing
  const [columns, setColumns] = useState(Math.ceil(Math.sqrt(total)));
  const [rows, setRows] = useState(Math.ceil(total / columns));
  const [cellW, setCellW] = useState(100 / columns);
  const [cellH, setCellH] = useState(100 / rows);

  // Recalculate grid size whenever total changes
  useEffect(() => {
    const newColumns = Math.ceil(Math.sqrt(total));
    const newRows = Math.ceil(total / newColumns);
    setColumns(newColumns);
    setRows(newRows);
    setCellW(100 / newColumns);
    setCellH(100 / newRows);
  }, [total]);

  // Initialize grid
  useEffect(() => {
    const grid = new Array(total).fill(null);
    itemData.forEach((img, idx) => (grid[idx] = img));
    setRandomGrid(grid);
  }, []);

  const addImageToRandomCell = () => {
    if (!newImgUrl.trim()) return;

    const newImage = { img: newImgUrl, title: "New" };
    let updatedGrid = [...randomGrid];
    let updatedItemData = [...itemData];

    const emptyCells = updatedGrid
      .map((cell, idx) => (cell === null ? idx : null))
      .filter((v) => v !== null);

    if (emptyCells.length === 0) {
      // All cells filled → expand grid first
      updatedItemData.push(newImage);
      const root = Math.sqrt(updatedItemData.length);
      const newTotal = Math.pow(Math.ceil(root), 2);
      const newGrid = new Array(newTotal).fill(null);
      updatedItemData.forEach((img, idx) => (newGrid[idx] = img));
      setTotal(newTotal);
      setRandomGrid(newGrid);
      setItemData(updatedItemData);
      setNewImgUrl("");
      return; // No animation for expansion
    }

    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const col = randomIndex % columns;
    const row = Math.floor(randomIndex / columns);
    const targetX = col * cellW;
    const targetY = row * cellH;

    setFlyingImg({ src: newImgUrl, x: targetX, y: targetY, index: randomIndex });
    setNewImgUrl("");

    setTimeout(() => {
      updatedGrid[randomIndex] = newImage;
      updatedItemData.push(newImage);
      setRandomGrid(updatedGrid);
      setItemData(updatedItemData);
      setFlyingImg(null);

      // Check if grid full now → expand
      const isFull = updatedGrid.every((cell) => cell !== null);
      if (isFull) {
        const root = Math.sqrt(updatedItemData.length);
        const newTotal = Math.pow(Math.ceil(root), 2);
        if (newTotal > total) {
          const newGrid = new Array(newTotal).fill(null);
          updatedItemData.forEach((img, idx) => (newGrid[idx] = img));
          setTotal(newTotal);
          setRandomGrid(newGrid);
        }
      }
    }, 900);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "#000"
      }}
    >
      {/* Input */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999,
          display: "flex",
          gap: 2
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Enter Image URL"
          value={newImgUrl}
          onChange={(e) => setNewImgUrl(e.target.value)}
          sx={{ width: 300, backgroundColor: "#fff", borderRadius: "6px" }}
        />
        <Button variant="contained" color="warning" onClick={addImageToRandomCell}>
          Add Image
        </Button>
      </Box>

      {/* Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
          zIndex: 200,
          pointerEvents: "none"
        }}
      />

      {/* Flying image */}
      {flyingImg && (
        <img
          src={flyingImg.src}
          style={{
            position: "absolute",
            top: "-150px",
            left: "50%",
            width: "150px",
            height: "150px",
            objectFit: "cover",
            borderRadius: "10px",
            border: "2px solid white",
            zIndex: 9999,
            animation: `dropAnim 0.9s ease forwards`,
            '--target-x': `${flyingImg.x}vw`,
            '--target-y': `${flyingImg.y}vh`
          }}
        />
      )}

      {/* Grid */}
      {Array.from({ length: total }).map((_, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const bgPosX = (col / (columns - 1 || 1)) * 100;
        const bgPosY = (row / (rows - 1 || 1)) * 100;

        return (
          <Box
            key={index}
            sx={{
              position: "absolute",
              left: `${col * cellW}%`,
              top: `${row * cellH}%`,
              width: `${cellW}%`,
              height: `${cellH}%`,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundImage: `
                linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.2)),
                url(${bgImage})
              `,
              backgroundSize: `${columns * 100}% ${rows * 100}%`,
              backgroundPosition: `${bgPosX}% ${bgPosY}%`
            }}
          >
            {randomGrid[index] && (
              <img
                src={randomGrid[index].img}
                alt={randomGrid[index].title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "relative",
                  zIndex: 3,
                  padding: "4px"
                }}
              />
            )}
          </Box>
        );
      })}

      {/* Animation CSS */}
      <style>{`
        @keyframes dropAnim {
          0% { transform: translate(-50%, 0) scale(0.4); opacity: 0; }
          60% { transform: translate(-50%, 40vh) scale(1.1); opacity: 1; }
          100% { transform: translate(calc(var(--target-x) - 50vw), calc(var(--target-y))) scale(1); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}

