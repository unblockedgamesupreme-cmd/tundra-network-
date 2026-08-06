async function run() {
  try {
    const res = await fetch("https://www.google.com/search?q=test", {
      headers: {
        "accept-encoding": "gzip, deflate, br, zstd",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("Success", res.status);
  } catch(e) {
    console.log("ERROR", e.message);
  }
}
run();
