// src/components/FloatingPanel/FloatingPanelUI.tsx

import {
  Colors,
  Position,
  Size,
} from "@/entrypoints/content/component/floating-panel";
import { cn } from "@/lib/utils";

type FloatingPanelUIProps = {
  position: Position;
  size: Size;
  colors: Colors;
  showColorSettings: boolean;
  handleDragStart: (e: React.MouseEvent) => void;
  handleResizeStart: (e: React.MouseEvent) => void;
  handleSettingsClick: () => void;
};

export const FloatingPanelUI = ({
  position,
  size,
  colors,
  showColorSettings,
  handleDragStart,
  handleResizeStart,
  handleSettingsClick,
}: FloatingPanelUIProps) => {
  return (
    <section
      style={{
        zIndex: 9999,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: colors.bodyBg, // 패널 배경 색상 적용
      }}
      className={cn(
        "absolute rounded-lg border shadow-2xl overflow-hidden flex flex-col justify-around"
      )}
    >
      {/* 드래그 가능한 헤더 */}
      <header
        onMouseDown={handleDragStart} // 드래그 시작 핸들러
        style={{
          backgroundColor: colors.headerBg, // 헤더 배경 색상 적용
          color: colors.headerText, // 헤더 텍스트 색상 적용
        }}
        className={cn(
          "px-4 py-3 cursor-move select-none flex-shrink-0 flex justify-between"
        )}
      >
        <h3 className="font-semibold">Floating Panel</h3>
        {/* Settings 버튼 */}
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
          onMouseDown={(e) => e.stopPropagation()} // 드래그 충돌 방지
        >
          {showColorSettings ? "Close ✕" : "Settings ⚙️"}
        </button>
      </header>

      {/* 패널 내용 */}
      <div
        className="p-4 flex-grow overflow-auto"
        style={{
          color: colors.bodyText, // 내용 텍스트 색상 적용
        }}
      >
        <p>
          패널 내용이 여기에 들어갑니다. 패널 배경색: {colors.bodyBg}, 텍스트
          색:
          {colors.bodyText}
        </p>
      </div>

      <footer className="text-sm p-4 text-center text-gray-500 flex-shrink-0">
        위치: ({position.x.toFixed(0)}, {position.y.toFixed(0)}) | 크기: (
        {size.width.toFixed(0)} x {size.height.toFixed(0)})
      </footer>

      {/* 크기 조절 핸들러 */}
      <div
        onMouseDown={handleResizeStart} // 리사이즈 시작 핸들러
        className={cn(
          "absolute right-0 bottom-0 w-4 h-4 cursor-se-resize",
          "bg-gray-300 opacity-0 hover:opacity-100 transition-opacity"
        )}
        style={{ zIndex: 10000 }}
      />
    </section>
  );
};
