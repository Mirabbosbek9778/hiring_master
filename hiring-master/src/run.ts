import { Task } from "./Task";
import { Executor, IExecutor } from "./Executor";

async function run(queue: Iterable<Task>, maxThreads = 0): Promise<void> {
  const executor: IExecutor = new Executor();
  const targetIdMap: Map<number, Task[]> = new Map();

  const processTask = async (task: Task) => {
    const targetIdTasks = targetIdMap.get(task.targetId) || [];
    if (targetIdTasks.length > 0) {
      await targetIdTasks[targetIdTasks.length - 1].executionPromise;
    }
    targetIdTasks.push(task);
    targetIdMap.set(task.targetId, targetIdTasks);

    await executor.executeTask(task);

    if (targetIdTasks.length > 0 && targetIdTasks[0] === task) {
      targetIdTasks.shift();
    }
  };

  const processQueue = async () => {
    const queueIterator = queue[Symbol.iterator]();
    let activeThreads = 0;

    const processNextTask = async () => {
      const nextTask = queueIterator.next();
      if (!nextTask.done) {
        const task = nextTask.value;
        activeThreads++;

        processTask(task)
          .then(() => {
            activeThreads--;
            processNextTask();
          })
          .catch((error) => {
            activeThreads--;
            processNextTask();
          });
      }
    };

    while (activeThreads < maxThreads || maxThreads === 0) {
      processNextTask();
      if (activeThreads === 0) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  await processQueue();
}

export { run };
