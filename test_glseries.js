async function run() {
  try {
    const res = await fetch("https://live.glseries.net/");
    console.log("Success", res.status);
  } catch(e) {
    console.log("ERROR", e.message);
  }
}
run();
