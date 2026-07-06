import plugin from "./index";

async function main() {
  console.log("=== RUNNING LOCAL PLUGIN BACKFILL TEST ===");
  await plugin({
    source: "cli",
    args: ["backfill", "1512079809021214730", "5"],
    writer: console.log
  });

  console.log("\n=== RUNNING LOCAL CHECKPOINT TEST ===");
  await plugin({
    source: "cli",
    args: ["checkpoint", "1512079809021214730"],
    writer: console.log
  });

  console.log("\n=== RUNNING LOCAL PLUGIN POLL TEST ===");
  await plugin({
    source: "cli",
    args: ["poll", "1512079809021214730", "5"],
    writer: console.log
  });
}

main().catch(console.error);
