async function run() {
  try {
    const res = await fetch("https://now.gg", {
      headers: { "user-agent": "Mozilla/5.0" }
    });
    console.log("Success", res.status);
  } catch(e) {
    console.log("ERROR", e.name, e.message);
  }
}
run();
