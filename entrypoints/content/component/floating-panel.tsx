// src/components/FloatingPanel/FloatingPanel.tsx (메인 파일)

import { ColorSettingsPanel } from "@/entrypoints/content/component/color-setting-panel";
import { FloatingPanelUI } from "@/entrypoints/content/component/floating-panel-ui";
import { useState, useRef, useEffect, useCallback } from "react";

// --- 상수 및 타입 정의 (외부 파일로 분리 가능) ---

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };
export type Colors = {
  headerBg: string;
  headerText: string;
  bodyBg: string;
  bodyText: string;
};

type FloatingPanelProps = {
  show: boolean;
};

// 로컬 스토리지 키
const LOCAL_STORAGE_POS_KEY = "floatingPanelPosition";
const LOCAL_STORAGE_SIZE_KEY = "floatingPanelSize";
const LOCAL_STORAGE_COLOR_KEY = "floatingPanelColors";

// 기본값
const DEFAULT_COLORS: Colors = {
  headerBg: "#EF4444", // bg-red-500
  headerText: "#FFFFFF", // text-white
  bodyBg: "#FFFFFF", // bg-white (패널 배경)
  bodyText: "#374151", // text-gray-700 (내용 텍스트)
};
const DEFAULT_SIZE: Size = { width: 320, height: 200 };
const MIN_SIZE: Size = { width: 200, height: 100 };

// --------------------------------------------------

export const FloatingPanel = ({ show }: FloatingPanelProps) => {
  const [position, setPosition] = useState<Position>({ x: 40, y: 40 });
  const [size, setSize] = useState<Size>(DEFAULT_SIZE);
  const [colors, setColors] = useState<Colors>(DEFAULT_COLORS);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [showColorSettings, setShowColorSettings] = useState(false);
  const handleSettingsClick = () => {
    setShowColorSettings((prev) => !prev);
  };

  // 위치, 크기, 색상을 로컬 스토리지에 저장하는 함수
  const saveToLocalStorage = useCallback(
    (pos: Position, s: Size, c: Colors) => {
      try {
        localStorage.setItem(LOCAL_STORAGE_POS_KEY, JSON.stringify(pos));
        localStorage.setItem(LOCAL_STORAGE_SIZE_KEY, JSON.stringify(s));
        localStorage.setItem(LOCAL_STORAGE_COLOR_KEY, JSON.stringify(c));
      } catch (error) {
        console.error("Failed to save to local storage:", error);
      }
    },
    []
  );

  // 로드 로직
  useEffect(() => {
    if (!show) return;

    try {
      // 로컬 스토리지에서 위치, 크기, 색상 로드 및 유효성 검사
      const storedPosition = localStorage.getItem(LOCAL_STORAGE_POS_KEY);
      if (storedPosition) {
        const parsed = JSON.parse(storedPosition);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setPosition(parsed);
        }
      }

      const storedSize = localStorage.getItem(LOCAL_STORAGE_SIZE_KEY);
      if (storedSize) {
        const parsed = JSON.parse(storedSize);
        if (
          typeof parsed.width === "number" &&
          typeof parsed.height === "number"
        ) {
          setSize({
            width: Math.max(parsed.width, MIN_SIZE.width),
            height: Math.max(parsed.height, MIN_SIZE.height),
          });
        }
      }

      const storedColors = localStorage.getItem(LOCAL_STORAGE_COLOR_KEY);
      if (storedColors) {
        const parsed = JSON.parse(storedColors);
        if (
          parsed.headerBg &&
          parsed.headerText &&
          parsed.bodyBg &&
          parsed.bodyText
        ) {
          setColors(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load state from local storage:", error);
    }
  }, [show]);

  // 드래그 및 크기 조절 로직 (마우스 이벤트 핸들러)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (isDragging) {
        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      } else if (isResizing) {
        setSize((prev) => ({
          width: Math.max(prev.width + dx, MIN_SIZE.width),
          height: Math.max(prev.height + dy, MIN_SIZE.height),
        }));
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        // 드래그/리사이즈 종료 시 현재 상태를 로컬 스토리지에 저장
        setPosition((currentPos) => {
          setSize((currentSize) => {
            setColors((currentColors) => {
              saveToLocalStorage(currentPos, currentSize, currentColors);
              return currentColors;
            });
            return currentSize;
          });
          return currentPos;
        });
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = isDragging ? "move" : "se-resize";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, isResizing, dragStart, saveToLocalStorage]);

  // 🎨 색상 변경 핸들러 (ColorSettingsPanel에 전달)
  const handleColorChange = useCallback(
    (key: keyof Colors, value: string) => {
      setColors((prev) => {
        const newColors = { ...prev, [key]: value };
        // 색상 변경 즉시 로컬 스토리지에 저장
        saveToLocalStorage(position, size, newColors);
        return newColors;
      });
    },
    [position, size, saveToLocalStorage]
  );

  // 드래그 시작 핸들러 (FloatingPanelUI에 전달)
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (show) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // 크기 조절 시작 핸들러 (FloatingPanelUI에 전달)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (show) {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <ColorSettingsPanel
        show={showColorSettings}
        colors={colors}
        handleColorChange={handleColorChange}
      />

      <FloatingPanelUI
        position={position}
        size={size}
        colors={colors}
        showColorSettings={showColorSettings}
        handleDragStart={handleDragStart}
        handleResizeStart={handleResizeStart}
        handleSettingsClick={handleSettingsClick}
      />
    </>
  );
};
