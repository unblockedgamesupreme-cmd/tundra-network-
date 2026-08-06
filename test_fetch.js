async function run() {
  try {
    const res = await fetch("https://www.bing.com", {
      headers: {
        "accept-encoding": "gzip, deflate, br, zstd"
      }
    });
    console.log(res.status);
  } catch(e) {
    console.log("ERROR", e.message);
  }
}
run();
