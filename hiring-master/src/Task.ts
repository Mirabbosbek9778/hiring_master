import Executor from "../src/Executor";

interface Task {
  targetId: number;
  action: ActionType;
}

type ActionType = "init" | "prepare" | "work" | "finalize" | "cleanup";

async function run(queue: Iterable<Task>, maxThreads = 0): Promise<void> {
  if (maxThreads === 0) {
    const executor = new Executor();
    const promises = Array.from(queue, (task) => executor.executeTask(task));
    await Promise.all(promises);
    return;
  }

  const targetIdMap = new Map<number, Promise<void>>();
  const executor = new Executor();

  async function executeTaskWithSemaphore(task: Task) {
    const targetIdPromise = targetIdMap.get(task.targetId) ?? Promise.resolve();
    const onTaskComplete = () => targetIdMap.delete(task.targetId);

    const taskPromise = targetIdPromise.then(async () => {
      try {
        await executor.executeTask(task);
      } finally {
        onTaskComplete();
      }
    });

    targetIdMap.set(task.targetId, taskPromise);
    await taskPromise;
  }

  const promises = Array.from(queue, (task) => executeTaskWithSemaphore(task));
  await Promise.all(promises);
}

const queue: Task[] = [
  { targetId: 0, action: "init" },
  { targetId: 0, action: "prepare" },
  { targetId: 1, action: "init" },
  { targetId: 2, action: "init" },
];

run(queue, 3)
  .then(() => {
    console.log("All tasks completed!");
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
