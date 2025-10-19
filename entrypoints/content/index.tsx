import App from "@/entrypoints/content/App";
import ReactDOM from "react-dom/client";
import "@/assets/tailwind.css";

export default defineContentScript({
  matches: ["*://*.notion.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "language-learning-content-box",
      position: "inline",
      onMount: (container) => {
        console.log(container);
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
