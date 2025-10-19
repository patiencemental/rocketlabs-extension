// src/components/FloatingPanel/ColorSettingsPanel.tsx

import { Colors } from "@/entrypoints/content/component/floating-panel";

// 🎨 색상 커스터마이징 옵션 (예시)
const COLOR_OPTIONS = [
  { name: "Red", bg: "#EF4444", text: "#FFFFFF" },
  { name: "Blue", bg: "#3B82F6", text: "#FFFFFF" }, // Blue-500
  { name: "Green", bg: "#10B981", text: "#FFFFFF" }, // Green-500
  { name: "Black", bg: "#1F2937", text: "#FFFFFF" }, // Gray-800
  { name: "White", bg: "#FFFFFF", text: "#1F2937" }, // White, Black text
];

type ColorSettingsPanelProps = {
  show: boolean;
  colors: Colors;
  handleColorChange: (key: keyof Colors, value: string) => void;
};

export const ColorSettingsPanel = ({
  show,
  colors,
  handleColorChange,
}: ColorSettingsPanelProps) => {
  if (!show) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 10000,
        backgroundColor: "white",
        padding: "15px", // 패딩 증가
        border: "1px solid #ddd", // 테두리 색상 변경
        borderRadius: "8px", // 둥근 모서리
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)", // 그림자 강화
      }}
    >
      <h4
        style={{
          margin: "0 0 15px 0",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#1F2937", // 짙은 회색
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
        }}
      >
        🎨 Color Settings
      </h4>

      {/* 헤더 색상 설정 */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Header Background:
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                    ? "3px solid #3B82F6" // 선택된 색상 강조
                    : "1px solid #ccc",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                transition: "all 0.1s ease-in-out",
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
          style={{ marginTop: "10px", width: "100%", height: "30px" }}
        />
      </div>

      {/* 바디 색상 설정 */}
      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Body Background:
        </label>
        <input
          type="color"
          value={colors.bodyBg}
          onChange={(e) => handleColorChange("bodyBg", e.target.value)}
          style={{ width: "100%", height: "30px" }}
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Body Text Color:
        </label>
        <input
          type="color"
          value={colors.bodyText}
          onChange={(e) => handleColorChange("bodyText", e.target.value)}
          style={{ width: "100%", height: "30px" }}
        />
      </div>
    </div>
  );
};
