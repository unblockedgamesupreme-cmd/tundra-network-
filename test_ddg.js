async function run() {
  try {
    const res = await fetch("https://duckduckgo.com", {
      headers: {
        "accept-encoding": "gzip, deflate, br, zstd"
      }
    });
    console.log("Success", res.status);
  } catch(e) {
    console.log("ERROR", e.message);
  }
}
run();
