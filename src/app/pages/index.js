"use client";
import { useEffect, useRef, useState } from "react";

const tileSize = 512;

const QingmingScroll = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [touchStartDistance, setTouchStartDistance] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const loadTile = (row, col) => {
      const img = new Image();
      img.src = `/tiles/${row}-${col}.jpg`; // 图像块路径
      img.onload = () => {
        const x = col * tileSize * scale + position.x;
        const y = row * tileSize * scale + position.y;
        context.drawImage(img, x, y, tileSize * scale, tileSize * scale);
      };
    };

    const renderTiles = () => {
      const visibleRows = Math.ceil(canvas.height / (tileSize * scale));
      const visibleCols = Math.ceil(canvas.width / (tileSize * scale));
      const startRow = Math.floor(-position.y / (tileSize * scale));
      const startCol = Math.floor(-position.x / (tileSize * scale));

      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let row = startRow; row < startRow + visibleRows; row++) {
        for (let col = startCol; col < startCol + visibleCols; col++) {
          if (row >= 0 && col >= 0) {
            loadTile(row, col);
          }
        }
      }
    };

    renderTiles();
  }, [position, scale]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize(); // 初始化尺寸

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

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && initialDistance !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const newScale = (distance / initialDistance) * lastScale;
      setScale(newScale);
    } else if (dragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - startPos.x;
      const dy = e.touches[0].clientY - startPos.y;
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
    };

    const handleTouchEnd = () => {
      setDragging(false);
      setInitialDistance(null);
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
      style={{ touchAction: "none", cursor: "grab" }}
    />
  );
};

  export default QingmingScroll;
