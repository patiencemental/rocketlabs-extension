// entrypoints/FloatingButton.tsx (Content Script 번들 내)
import { Button } from "@/components/ui/button"; // shadcn/ui 버튼 컴포넌트 경로
import { FloatingPanel } from "@/entrypoints/content/component/floating-panel";
import { cn } from "@/lib/utils";
import { RocketIcon } from "lucide-react"; // 아이콘 (예시)
import { useState, useEffect } from "react"; // useState와 useEffect를 임포트

export const FloatingMenuButton = () => {
  const [showPanel, setShowPanle] = useState(false);
  const [enableShortCuts, setEnableShortCuts] = useState(true);
  const handleClick = useCallback(() => {
    if (showPanel) {
      return;
    }

    setEnableShortCuts(!enableShortCuts);
  }, [enableShortCuts, showPanel]);

  // 키보드 이벤트 리스너 추가 로직
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(`enable: ${enableShortCuts}`);
      if (!enableShortCuts) {
        return;
      }

      // Ctrl (또는 Cmd) 키와 S 키를 동시에 누를 때
      // if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); // 브라우저의 기본 저장 동작 방지
        setShowPanle((prev) => !prev); // 패널 토글
      }
    };

    // 'keydown' 이벤트 리스너를 window 객체에 등록
    window.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 (클린업 함수)
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enableShortCuts]); // 빈 의존성 배열: 컴포넌트가 마운트될 때 한 번만 등록/언마운트될 때 제거

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
          className={cn(
            "p-4 h-16 w-16 rounded-full shadow-lg bg-gray-500 ",
            enableShortCuts && "bg-green-300"
          )} // 크기 및 스타일 조정
          onClick={handleClick}
        >
          <RocketIcon className="h-8 w-8" />
        </Button>
      </div>
    </>
  );
};
