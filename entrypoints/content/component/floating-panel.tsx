import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";

type FloatingPanelProps = {
  show: boolean;
};

// 로컬 스토리지 키 정의
const LOCAL_STORAGE_POS_KEY = "floatingPanelPosition";
const LOCAL_STORAGE_SIZE_KEY = "floatingPanelSize";
// 🎨 새로운 키 정의: 색상 상태
const LOCAL_STORAGE_COLOR_KEY = "floatingPanelColors";

// 🎨 기본 색상 설정
const DEFAULT_COLORS = {
  headerBg: "#EF4444", // bg-red-500
  headerText: "#FFFFFF", // text-white
  bodyBg: "#FFFFFF", // bg-white (패널 배경)
  bodyText: "#374151", // text-gray-700 (내용 텍스트)
};

const DEFAULT_SIZE = { width: 320, height: 200 };
const MIN_SIZE = { width: 200, height: 100 };

// 🎨 색상 커스터마이징 옵션 (예시)
const COLOR_OPTIONS = [
  { name: "Red", bg: "#EF4444", text: "#FFFFFF" },
  { name: "Blue", bg: "#3B82F6", text: "#FFFFFF" }, // Blue-500
  { name: "Green", bg: "#10B981", text: "#FFFFFF" }, // Green-500
  { name: "Black", bg: "#1F2937", text: "#FFFFFF" }, // Gray-800
  { name: "White", bg: "#FFFFFF", text: "#1F2937" }, // White, Black text
];

export const FloatingPanel = ({ show }: FloatingPanelProps) => {
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [size, setSize] = useState(DEFAULT_SIZE);
  // 🎨 새로운 상태: 색상
  const [colors, setColors] = useState(DEFAULT_COLORS);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLElement>(null);

  const [showColorSettings, setShowColorSettings] = useState(false);
  const handleSettingsClick = () => {
    setShowColorSettings((prev) => !prev);
  };

  // 위치, 크기, 색상을 로컬 스토리지에 저장하는 함수
  const saveToLocalStorage = useCallback(
    (pos: typeof position, s: typeof size, c: typeof colors) => {
      try {
        localStorage.setItem(LOCAL_STORAGE_POS_KEY, JSON.stringify(pos));
        localStorage.setItem(LOCAL_STORAGE_SIZE_KEY, JSON.stringify(s));
        // 🎨 색상 저장 추가
        localStorage.setItem(LOCAL_STORAGE_COLOR_KEY, JSON.stringify(c));
      } catch (error) {
        console.error("Failed to save to local storage:", error);
      }
    },
    []
  );

  // 1. 컴포넌트 마운트/show 변경 시 위치, 크기, 색상을 로드
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
            setSize({
              width: Math.max(parsedSize.width, MIN_SIZE.width),
              height: Math.max(parsedSize.height, MIN_SIZE.height),
            });
          }
        }

        // 🎨 색상 로드
        const storedColors = localStorage.getItem(LOCAL_STORAGE_COLOR_KEY);
        if (storedColors) {
          const parsedColors = JSON.parse(storedColors);
          // 최소한의 유효성 검사
          if (
            parsedColors.headerBg &&
            parsedColors.headerText &&
            parsedColors.bodyBg &&
            parsedColors.bodyText
          ) {
            setColors(parsedColors);
          }
        }
      } catch (error) {
        console.error("Failed to load state from local storage:", error);
      }
    }
  }, [show]);

  // 2. 드래그 및 크기 조절 로직 (기존과 동일하지만, 저장 시 색상도 포함)
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
        // 드래그 또는 리사이즈 종료 시 위치, 크기, 색상을 저장
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

  // 드래그 시작 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (show) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // 크기 조절 시작 핸들러
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (show) {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // 🎨 색상 변경 핸들러
  const handleColorChange = (
    key: keyof typeof DEFAULT_COLORS,
    value: string
  ) => {
    setColors((prev) => {
      const newColors = { ...prev, [key]: value };
      // 색상 변경 즉시 로컬 스토리지에 저장 (사용자 경험 개선)
      saveToLocalStorage(position, size, newColors);
      return newColors;
    });
  };

  if (!show) {
    return null;
  }

  return (
    <>
      {/* 🎨 색상 설정 패널 */}
      {showColorSettings && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            zIndex: 10000, // 패널보다 위에
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px 0",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            🎨 Color Settings
          </h4>

          {/* 헤더 색상 설정 */}
          <div style={{ marginBottom: "10px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "semibold",
              }}
            >
              Header Background:
            </label>
            <div style={{ display: "flex", gap: "5px" }}>
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    handleColorChange("headerBg", option.bg);
                    handleColorChange("headerText", option.text); // 헤더 텍스트도 같이 변경
                  }}
                  style={{
                    backgroundColor: option.bg,
                    color: option.text,
                    border:
                      colors.headerBg === option.bg
                        ? "2px solid black"
                        : "1px solid #ccc",
                    padding: "5px 10px",
                    borderRadius: "3px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <input
              type="color"
              value={colors.headerBg}
              onChange={(e) => handleColorChange("headerBg", e.target.value)}
              style={{ marginTop: "5px", width: "100%" }}
            />
          </div>

          {/* 바디 색상 설정 */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "semibold",
              }}
            >
              Body Background:
            </label>
            <input
              type="color"
              value={colors.bodyBg}
              onChange={(e) => handleColorChange("bodyBg", e.target.value)}
              style={{ width: "100%", marginBottom: "5px" }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "semibold",
              }}
            >
              Body Text Color:
            </label>
            <input
              type="color"
              value={colors.bodyText}
              onChange={(e) => handleColorChange("bodyText", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      )}
      {/* 🎨 색상 설정 패널 끝 */}

      {/* 메인 Floating Panel */}
      <section
        ref={panelRef}
        style={{
          zIndex: 9999,
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          // 🎨 패널 배경 색상 적용
          backgroundColor: colors.bodyBg,
        }}
        className={cn(
          "absolute rounded-lg border shadow-2xl overflow-hidden flex flex-col justify-around"
        )}
      >
        {/* 드래그 가능한 헤더 */}
        <header
          onMouseDown={handleMouseDown}
          style={{
            // 🎨 헤더 배경/텍스트 색상 적용 (Tailwind 클래스 대신 인라인 스타일 사용)
            backgroundColor: colors.headerBg,
            color: colors.headerText,
          }}
          className={cn(
            "px-4 py-3 cursor-move select-none flex-shrink-0 flex justify-between"
            // 호버 효과는 기본 색상에서 약간 어둡게 처리하는 로직 필요 (CSS 또는 JS)
            // 간단하게 인라인 스타일로 처리. 실제 프로덕션에선 Tailwind 동적 변수 사용 권장.
          )}
        >
          <h3 className="font-semibold">Floating Panel</h3>
          {/* 💡 Settings 버튼 */}
          <button
            id="settings-button"
            onClick={handleSettingsClick}
            style={{
              backgroundColor:
                colors.headerText === "#FFFFFF"
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
              color: colors.headerText,
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              border: "none",
              flexShrink: 0,
            }}
            // 버튼 클릭 시 커서 스타일 변경 방지 및 드래그와의 충돌 방지를 위해 onMouseDown에 stopPropagation 추가
            onMouseDown={(e) => e.stopPropagation()}
          >
            {showColorSettings ? "Close ✕" : "Settings ⚙️"}
          </button>
        </header>

        {/* 패널 내용 */}
        <div
          className="p-4 flex-grow overflow-auto"
          style={{
            // 🎨 내용 텍스트 색상 적용
            color: colors.bodyText,
          }}
        >
          <p>
            패널 내용이 여기에 들어갑니다. 패널 배경색: {colors.bodyBg}, 텍스트
            색: {colors.bodyText}
          </p>
        </div>

        <footer className="text-sm p-4 text-center text-gray-500">
          위치: ({position.x.toFixed(0)}, {position.y.toFixed(0)}) | 크기: (
          {size.width.toFixed(0)} x {size.height.toFixed(0)})
        </footer>

        {/* 크기 조절 핸들러 */}
        <div
          onMouseDown={handleResizeMouseDown}
          className={cn(
            "absolute right-0 bottom-0 w-4 h-4 cursor-se-resize",
            "bg-gray-300 opacity-0 hover:opacity-100 transition-opacity"
          )}
          style={{ zIndex: 10000 }}
        />
      </section>
    </>
  );
};
