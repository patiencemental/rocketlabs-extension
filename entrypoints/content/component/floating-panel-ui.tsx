// src/components/FloatingPanel/FloatingPanelUI.tsx

import { DeckSetting } from "@/entrypoints/content/component/anki/deck-setting";
import {
  Colors,
  Position,
  Size,
} from "@/entrypoints/content/component/floating-panel";
import { cn } from "@/lib/utils";
import { JSX } from "react";

// 탭 정보와 이름을 정의합니다.
const tabs: { key: string; name: string; component: JSX.Element }[] = [
  { key: "deck-setting", name: "덱", component: <DeckSetting /> },
  { key: "study", name: "학습", component: <div>학습</div> },
];

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
  const [selectedTab, setSelectedTab] = useState<string>("deck-setting");

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
        <h3 className="font-semibold">RocketLabs</h3>
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

      {/* ⭐️ 탭 리스트 (Tab List) */}
      <div
        className="flex border-b flex-shrink-0"
        style={{ borderColor: colors.bodyText + "20" }} // 탭 구분선 색상
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)} // 탭 선택 시 상태 변경
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              selectedTab === tab.key // 선택된 탭 스타일
                ? "border-b-2"
                : "opacity-70 hover:opacity-100" // 선택되지 않은 탭 스타일
            )}
            style={{
              color: colors.bodyText,
              borderColor:
                selectedTab === tab.key ? colors.bodyText : "transparent", // 선택된 탭의 밑줄 색상
              backgroundColor:
                selectedTab === tab.key ? colors.bodyBg + "10" : "transparent", // 선택된 탭의 배경색 (약간의 강조)
            }}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 패널 내용 */}
      <div
        className="p-4 flex-grow overflow-auto"
        style={{
          color: colors.bodyText, // 내용 텍스트 색상 적용
        }}
      >
        {tabs.find((tab) => tab.key === selectedTab)?.component}
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
