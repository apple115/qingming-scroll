'use client'
import { useEffect, useRef, useState } from 'react';

const QingmingScroll = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = '/qingming.jpg'; // 图片路径
    img.onload = () => setImage(img);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (image) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        position.x,
        position.y,
        image.width * scale,
        image.height * scale
      );
    }
  }, [image, position, scale]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize(); // 初始化尺寸

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setInitialDistance(Math.sqrt(dx * dx + dy * dy));
      setLastScale(scale);
    } else if (e.touches.length === 1) {
      setDragging(true);
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
        setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setStartPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
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
        style={{ touchAction: 'none' }}
      />
    );
  };

  export default QingmingScroll;
