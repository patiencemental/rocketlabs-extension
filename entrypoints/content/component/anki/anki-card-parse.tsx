import "./_logseq_anki_sync.css";
import "./_logseq_anki_sync_front.css";
import parse from "html-react-parser";
import { useEffect, useRef } from "react";

export function AnkiCardParse({ htmlContent }: { htmlContent: string }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // 스크립트 태그 추출 및 실행
      const scripts = containerRef.current.querySelectorAll("script");
      scripts.forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;

        // 속성 복사
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        document.body.appendChild(newScript);
      });
    }
  }, [htmlContent]);

  return <div ref={containerRef}>{parse(htmlContent)}</div>;
}
