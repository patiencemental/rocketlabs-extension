// entrypoints/FloatingButton.tsx (Content Script 번들 내)
import { Button } from "@/components/ui/button"; // shadcn/ui 버튼 컴포넌트 경로
import { RocketIcon } from "lucide-react"; // 아이콘 (예시)

export const FloatingMenuButton = () => {
  const handleClick = () => {
    console.log("Floating Button Clicked!");
    // 여기에 원하는 동작 로직 추가 (예: 팝업 열기, 데이터 저장 등)
    window.alert("hello world");
  };

  return (
    <div
      // Tailwind CSS를 Shadow DOM 내에서 적용하기 위한 스타일
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "9999",
      }}
    >
      {/* shadcn Button 컴포넌트 사용 */}
      <Button
        size="icon"
        className="p-4 h-16 w-16 bg-gray-500 rounded-full shadow-lg" // 크기 및 스타일 조정
        onClick={handleClick}
      >
        <RocketIcon className="h-8 w-8" />
      </Button>
    </div>
  );
};
