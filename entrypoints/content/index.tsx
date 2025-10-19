import App from "@/entrypoints/content/App";
import ReactDOM from "react-dom/client";
import "@/assets/tailwind.css";

// (() => {
//   window.scrollToClozeElement = () => {
//     document.getElementsByClassName("cloze")[0].scrollIntoView({
//       behavior: "smooth",
//       block: "center",
//       inline: "center",
//     }),
//       console.log("Scrolled to cloze element");
//   };
//   window.openBlockInLogseq = (e) => {
//     if (e == null || e == "") return;
//     let o = document
//         .getElementsByClassName("breadcrumb2")[0]
//         .getElementsByTagName("a")[0],
//       l = document.createElement("a");
//     (l.href = `${o.href.match(/logseq:\/\/graph\/.*\?/)}block-id=${e}`),
//       l.click();
//   };
//   var n = () => {
//     a(), c();
//   };
//   function a() {
//     let e = document.getElementsByClassName("tag");
//     for (let t of e)
//       t.getAttribute("data-ref") &&
//         (t.textContent = t.getAttribute("data-ref"));
//   }
//   function c() {
//     window.type !== "image_occlusion" &&
//       document
//         .getElementById("tags")
//         .getAttribute("tags_name")
//         .split(" ")
//         .includes("type-in") &&
//       (document.getElementsByClassName("type-in-container")[0].style.display =
//         "block");
//   }
//   document.readyState === "complete" && n(), window.addEventListener("load", n);
// })();

export default defineContentScript({
  matches: ["*://*.notion.com/*"],
  // matches: ["http://*", "https://*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "language-learning-content-box",
      position: "inline",
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
