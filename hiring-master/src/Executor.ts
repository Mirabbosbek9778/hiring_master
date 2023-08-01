import ITask from './Task';

export interface ITaskCollection {
    [targetId: string]: ITask;
}

export interface ICompletedTasksCollection {
    [targetId: string]: ITask[];
}

export interface IExecutor {
    executeTask(task: ITask): Promise<void>;
    start(): void;
    stop(): void;
}

export default class Executor implements IExecutor {
    constructor() {
        this.executeData = {
            running: {},
            completed: {},
            performanceData: [],
        };

        this.performanceReport = {
            min: 0,
            max: 0,
            avg: 0,
        };
    }

    public start() {
    }

    public stop() {
    }

    public async executeTask(task: ITask) {
    }

    private recordPerformance(excludeFromMin: boolean) {
    }

    protected performanceReport: {
        min: number;
        max: number;
        avg: number;
    };

    protected executeData: {
        running: ITaskCollection;
        completed: ICompletedTasksCollection;
        performanceData: Array<{
            excludeFromMin: boolean;
            running: ITask[];
            time: number;
        }>;
    };

    private startedAt = BigInt(0);
    private prevPerformanceRecordedAt = BigInt(0);
    private recordPerformanceInterval?: NodeJS.Timeout;
}

async function sleep(ms: number) {
    ms = Math.max(0, ms);
    return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}
