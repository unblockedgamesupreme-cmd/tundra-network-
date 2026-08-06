async function run() {
  try {
    const res = await fetch("https://www.bing.com/search?q=test", {
      headers: {
        "accept-encoding": "gzip, deflate, br, zstd"
      }
    });
    const text = await res.text();
    console.log("Success", text.length);
  } catch(e) {
    console.log("ERROR", e.message);
  }
}
run();
