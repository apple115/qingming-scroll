"use client";
import { useEffect, useRef, useState } from "react";

const tileSize = 512;

const sounds = {

  "0-2": "bird.wav",
  "0-6": "bird.wav",
  "0-7": "bird.wav",
  "0-8": "water.wav",
  "0-9": "water.wav",
  "0-10": "water.wav",
  "0-11": "water.wav",
  "0-12": "water.wav",
  "0-13": "water.wav",

  "0-15": "bird.wav",
  "0-16": "bird.wav",


  "0-23": "wind.mp3",
  "0-24": "people.wav",
  "0-25": "people.wav",

  "0-26": "wind.mp3",
  "0-27": "wind.mp3",

  "0-28": "water.wav",

  "0-29": "wind.mp3",

  "0-29": "people.wav",



  "2-36": "people.wav",
  "2-37": "people.wav",
  "2-90": "people.wav",
  "2-91": "people.wav",
  "2-92": "people.mp3",

  "0-33": "bird.wav",
  "1-14": "bird.wav",
  "2-89": "bird.wav",

  "2-88": "wind.mp3",

};

const QingmingScroll = () => {
  const canvasRef = useRef(null);
  const bufferCanvasRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const currentAudios = useRef({});

  const loadTile = (row, col, context) => {
    const img = new Image();
    img.src = `/tiles/${row}-${col}.jpg`;
    img.onload = () => {
      const x = col * tileSize * scale + position.x;
      const y = row * tileSize * scale + position.y;
      context.drawImage(img, x, y, tileSize * scale, tileSize * scale);
    };
  };

  const renderTiles = () => {
    const canvas = canvasRef.current;
    const bufferCanvas = bufferCanvasRef.current;
    const context = canvas.getContext("2d");

    const visibleRows = Math.ceil(canvas.height / (tileSize * scale)) + 2;
    const visibleCols = Math.ceil(canvas.width / (tileSize * scale)) + 10;
    const startRow = Math.floor(-position.y / (tileSize * scale)) - 1;
    const startCol = Math.floor(-position.x / (tileSize * scale)) - 1;
    const visibleSounds = new Set();

    context.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    for (let row = startRow; row < startRow + visibleRows; row++) {
      for (let col = startCol; col < startCol + visibleCols; col++) {
        if (row >= 0 && col >= 0) {
          loadTile(row, col, context);
          const key = `${row}-${col}`;
          if (sounds[key]) {
            visibleSounds.add(sounds[key]);
          }
        }
      }
    }

    const screenContext = canvas.getContext("2d");
    screenContext.clearRect(0, 0, canvas.width, canvas.height);
    screenContext.drawImage(bufferCanvas, 0, 0);

    // 停止不再可见的声音
    for (const sound in currentAudios.current) {
      if (!visibleSounds.has(sound)) {
        currentAudios.current[sound].pause();
        delete currentAudios.current[sound];
      }
    }

    // 播放新的可见声音
    for (const sound of visibleSounds) {
      if (!currentAudios.current[sound]) {
        const audio = new Audio(sound);
        audio.loop = true;
        audio.play();
        currentAudios.current[sound] = audio;
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const bufferCanvas = bufferCanvasRef.current;
    if (canvas && bufferCanvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      bufferCanvas.width = window.innerWidth;
      bufferCanvas.height = window.innerHeight;
      renderTiles();
    }
  }, [position, scale]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const bufferCanvas = bufferCanvasRef.current;
      if (canvas && bufferCanvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        bufferCanvas.width = window.innerWidth;
        bufferCanvas.height = window.innerHeight;
        renderTiles();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setTouchStartDistance(Math.sqrt(dx * dx + dy * dy));
    } else {
      setDragging(true);
      setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const newScale = scale * (distance / touchStartDistance);
      setScale(Math.max(0.5, Math.min(newScale, 3)));
      setTouchStartDistance(distance);
    } else if (dragging) {
      const dx = e.touches[0].clientX - startPos.x;
      const dy = e.touches[0].clientY - startPos.y;
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setDragging(false);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY }); // 使用 clientX 和 clientY 获取鼠标位置
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      setPosition((prev) => {
        const newX = Math.max(
          Math.min(prev.x + dx, 0),
          -(56531 * scale - canvasRef.current.width),
        ); // 替换 56531 为图片实际宽度
        const newY = Math.max(
          Math.min(prev.y + dy, 0),
          -(1700 * scale - canvasRef.current.height),
        ); // 替换 1700 为图片实际高度
        return { x: newX, y: newY };
      });
      setStartPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };
  const handleMouseLeave = () => {
    setDragging(false);
  };
  const handleWheel = (e) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(prev * delta, 3)));
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown} // 使用 onMouseDown、onMouseMove、onMouseUp 处理鼠标事件
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ touchAction: "none", cursor: dragging ? "grabbing" : "grab" }}
      />
      <canvas ref={bufferCanvasRef} style={{ display: "none" }} />
    </>
  );
};

export default QingmingScroll;
