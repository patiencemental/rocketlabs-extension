import React, { useEffect, useRef, useState } from "react";
import { browser } from "wxt/browser";
import { FloatingButton } from "@/components/floating-button";

const domLoaded = () => {
  console.log("dom loaded");
};

export default () => {
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

  return <FloatingButton />;
};
