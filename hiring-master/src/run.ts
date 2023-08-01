import { IExecutor } from "./Executor";
import ITask from "./Task";

export default async function run(
  executor: IExecutor,
  queue: AsyncIterable<ITask>,
  maxThreads = 0
) {
  maxThreads = Math.max(0, maxThreads);

  const processTask = async (task: ITask) => {};

  const processQueue = async () => {
    const queueIterator = queue[Symbol.asyncIterator]();
    let activeThreads = 0;

    const processNextTask = async () => {
      const nextTask = await queueIterator.next();
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
      await processNextTask();
      if (activeThreads === 0) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  await processQueue();
}
