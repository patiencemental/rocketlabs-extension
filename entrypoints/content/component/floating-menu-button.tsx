// entrypoints/FloatingButton.tsx (Content Script 번들 내)
import { Button } from "@/components/ui/button"; // shadcn/ui 버튼 컴포넌트 경로
import { FloatingPanel } from "@/entrypoints/content/component/floating-panel";
import { RocketIcon } from "lucide-react"; // 아이콘 (예시)

export const FloatingMenuButton = () => {
  const [showPanel, setShowPanel] = useState(false);
  const handleClick = () => {
    setShowPanel((prev) => !prev);
  };

  return (
    <>
      <FloatingPanel show={showPanel} />
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
    </>
  );
};
