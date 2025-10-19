import { useEffect } from "react";
import { browser } from "wxt/browser";
import { FloatingMenuButton } from "@/entrypoints/content/component/floating-menu-button";

const domLoaded = () => {
  console.log("dom loaded");
};

const App = () => {
  useEffect(() => {
    if (document.readyState === "complete") {
      // load event has already fired, run your code or function here
      console.log("dom complete");
      domLoaded();
    } else {
      // load event hasn't fired, listen for it
      window.addEventListener("load", () => {
        // your code here
        console.log("content load:");
        console.log(window.location.href);
        domLoaded();
      });
    }
  }, []);

  return <FloatingMenuButton />;
};

export default App;
