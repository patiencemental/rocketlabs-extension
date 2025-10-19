export default defineContentScript({
  //   matches: ["*://*.google.com/*"],
  matches: ["*://*.notion.com/*"],
  main() {
    debugger;
    console.log("hello");
    window.alert("tq");
  },
});
