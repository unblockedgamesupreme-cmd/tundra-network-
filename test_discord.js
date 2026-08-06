async function run() {
  try {
    const res = await fetch("https://discord.com");
    console.log("Success", res.status);
  } catch(e) {
    console.log("ERROR", e.message);
  }
}
run();
