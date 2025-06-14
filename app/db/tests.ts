import { DBService } from "./dbService";

async function runTests() {
  console.log("🔌 Connecting to MongoDB...");

  // 🔹 1. Test getOrCreateUser
  const user1 = await DBService.getOrCreateUser("0x1111111111111111111111111111111111111111");
  const user2 = await DBService.getOrCreateUser("0x2222222222222222222222222222222222222222");

  console.log("✅ Created users:");
  console.log(user1);
  console.log(user2);

  // 🔹 2. Test createTask
  const task = await DBService.createTask({
    owner: user1.address,
    title: "Design logo",
    description: "Need a logo for DeFi app",
    asset: "USDC",
    amount: 50,
    deadline: null,
  });

  console.log("✅ Task created:");
  console.log(task);

  // 🔹 3. Test getMarketTasks
  const marketTasks = await DBService.getMarketTasks(user2.address);
  console.log("✅ Market tasks for user2:");
  console.log(marketTasks.map(t => t.title));

  // 🔹 4. Apply task
  await DBService.applyTask(task._id!, user2.address);
  const afterApply = await DBService.getUserTasks(user2.address);
  console.log("✅ After apply, user2 tasks:");
  console.log(afterApply);

  // 🔹 5. Approve by executor
  await DBService.approveTask(task._id!, user2.address);
  // 🔹 6. Approve by owner (finalTask will be triggered here)
  await DBService.approveTask(task._id!, user1.address);

  const finalTask = (await DBService.getUserTasks(user1.address)).find(t => t._id === task._id);
  console.log("✅ Final task state:");
  console.log(finalTask);
}

runTests()
  .then(() => {
    console.log("🎉 All tests completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error during test run:", err);
    process.exit(1);
  });
