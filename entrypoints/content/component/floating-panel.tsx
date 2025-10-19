import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";

type FloatingPanelProps = {
  show: boolean;
};

// 로컬 스토리지 키 정의
const LOCAL_STORAGE_POS_KEY = "floatingPanelPosition";
const LOCAL_STORAGE_SIZE_KEY = "floatingPanelSize"; // 새로운 키 정의

// 기본 크기 설정
const DEFAULT_SIZE = { width: 320, height: 200 };
const MIN_SIZE = { width: 200, height: 100 }; // 최소 크기 제한

export const FloatingPanel = ({ show }: FloatingPanelProps) => {
  const [position, setPosition] = useState({ x: 40, y: 40 });
  // 새로운 상태: 패널 크기
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [isDragging, setIsDragging] = useState(false);
  // 새로운 상태: 크기 조절 중인지
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLElement>(null);

  // 위치와 크기를 로컬 스토리지에 저장하는 함수
  const saveToLocalStorage = useCallback(
    (pos: { x: number; y: number }, s: { width: number; height: number }) => {
      try {
        localStorage.setItem(LOCAL_STORAGE_POS_KEY, JSON.stringify(pos));
        localStorage.setItem(LOCAL_STORAGE_SIZE_KEY, JSON.stringify(s));
      } catch (error) {
        console.error("Failed to save to local storage:", error);
      }
    },
    []
  );

  // 1. 컴포넌트 마운트/show 변경 시 위치와 크기를 로드
  useEffect(() => {
    if (show) {
      try {
        // 위치 로드
        const storedPosition = localStorage.getItem(LOCAL_STORAGE_POS_KEY);
        if (storedPosition) {
          const parsedPosition = JSON.parse(storedPosition);
          if (
            typeof parsedPosition.x === "number" &&
            typeof parsedPosition.y === "number"
          ) {
            setPosition(parsedPosition);
          }
        }

        // 크기 로드
        const storedSize = localStorage.getItem(LOCAL_STORAGE_SIZE_KEY);
        if (storedSize) {
          const parsedSize = JSON.parse(storedSize);
          if (
            typeof parsedSize.width === "number" &&
            typeof parsedSize.height === "number"
          ) {
            // 최소 크기 제한 적용하여 로드
            setSize({
              width: Math.max(parsedSize.width, MIN_SIZE.width),
              height: Math.max(parsedSize.height, MIN_SIZE.height),
            });
          }
        } else {
          // 저장된 크기가 없으면 기본값 저장
          saveToLocalStorage(position, DEFAULT_SIZE);
        }
      } catch (error) {
        console.error("Failed to load state from local storage:", error);
      }
    }
  }, [show]); // `position`을 의존성에 넣지 않음: 초기 로딩 시에만 필요하므로

  // 2. 드래그 및 크기 조절 로직
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      if (isDragging) {
        // 위치 업데이트
        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      } else if (isResizing) {
        // 크기 업데이트
        setSize((prev) => ({
          width: Math.max(prev.width + dx, MIN_SIZE.width),
          height: Math.max(prev.height + dy, MIN_SIZE.height),
        }));
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        // 드래그 또는 리사이즈 종료 시 위치와 크기를 저장
        setPosition((currentPos) => {
          setSize((currentSize) => {
            saveToLocalStorage(currentPos, currentSize);
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
      document.body.style.userSelect = "none"; // 드래그/리사이즈 중 텍스트 선택 방지
      document.body.style.cursor = isDragging ? "move" : "se-resize"; // 커서 모양 변경
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging, isResizing, dragStart, saveToLocalStorage]);

  // 드래그 시작 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // 크기 조절 핸들러와 충돌 방지
    if (show) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // 크기 조절 시작 핸들러
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // 패널 드래그 이벤트로 전파 방지
    if (show) {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  if (!show) {
    return null;
  }

  return (
    <section
      ref={panelRef}
      style={{
        zIndex: 9999,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`, // 크기 적용
        height: `${size.height}px`, // 크기 적용
      }}
      className={cn(
        // `absolute` 대신 `fixed` 사용을 권장하지만, 기존 코드를 따라 `absolute` 유지
        "absolute bg-white rounded-lg border shadow-2xl overflow-hidden flex flex-col justify-around"
      )}
    >
      {/* 드래그 가능한 헤더 */}
      <header
        onMouseDown={handleMouseDown}
        className={cn(
          "bg-red-500 text-white px-4 py-3 cursor-move select-none flex-shrink-0",
          "hover:bg-red-600 transition-colors"
        )}
      >
        <h3 className="font-semibold">Floating Panel</h3>
      </header>

      {/* 패널 내용 - 내용 영역이 크기에 따라 스크롤되도록 설정 */}
      <div className="p-4 flex-grow overflow-auto">
        <p className="text-gray-700">패널 내용이 여기에 들어갑니다.</p>
      </div>

      <footer className="text-sm p-4 text-center text-gray-500">
        위치: ({position.x.toFixed(0)}, {position.y.toFixed(0)}) | 크기: (
        {size.width.toFixed(0)} x {size.height.toFixed(0)})
      </footer>

      {/* 크기 조절 핸들러 (우측 하단 모서리) */}
      <div
        onMouseDown={handleResizeMouseDown}
        className={cn(
          "absolute right-0 bottom-0 w-4 h-4 cursor-se-resize",
          "bg-gray-300 opacity-0 hover:opacity-100 transition-opacity" // 시각적 피드백 제공
        )}
        style={{ zIndex: 10000 }} // 헤더보다 위에 위치하도록 zIndex 설정
      />
    </section>
  );
};
