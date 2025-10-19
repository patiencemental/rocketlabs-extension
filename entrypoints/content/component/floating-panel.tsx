import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

type FloatingPanelProps = {
  show: boolean;
};

export const FloatingPanel = ({ show }: FloatingPanelProps) => {
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
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
      }}
      className={cn(
        "absolute w-80 bg-white rounded-lg border shadow-lg overflow-hidden"
      )}
    >
      {/* 드래그 가능한 헤더 */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "bg-red-500 text-white px-4 py-3 cursor-move select-none",
          "hover:bg-red-600 transition-colors"
        )}
      >
        <h3 className="font-semibold">Floating Panel</h3>
      </div>

      {/* 패널 내용 */}
      <div className="p-4">
        <p className="text-gray-700">패널 내용이 여기에 들어갑니다.</p>
      </div>
    </section>
  );
};
