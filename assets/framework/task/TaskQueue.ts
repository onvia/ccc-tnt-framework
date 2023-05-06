
type CompleteCallbackNoData = (err?: Error | null) => void;
type ForEachFunction<T> = (item: T, done: CompleteCallbackNoData) => void;
type TaskRunner = (progress: (value) => void, done: Runnable) => void;

class Task {
    static create(key: string) {
        // return _taskPool.get();
        let task = new Task();
        task.key = key;
        return task;
    }
    recycle() {
        this.runner = null;
        // _taskPool.put(this);
    }
    key: string;
    runner: TaskRunner;
}

export class TaskQueue {

    tasks: Task[] = [];
    isRunning = false;
    totalTaskCount: number = 0;
    completedCount: number = 0;
    completeProgress: number = 0;

    public addTask(runner: TaskRunner, key?: string) {
        // let task = _taskPool.get();
        let task = Task.create(key);
        task.runner = runner;
        this.tasks.push(task);
        this.totalTaskCount = this.tasks.length;
    }

    /**
     * 串行执行任务
     */

    public startTasksSerial(onComplete: () => void)
    public startTasksSerial(onProgress: (progress: number) => void, onComplete: () => void)
    public startTasksSerial(onProgress: (progress?: number) => void, onComplete?: () => void) {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.completeProgress = 0;
        this.completedCount = 0;
        this.nextTask(onProgress, onComplete);
    }

    /**
     * 并行执行任务
     */
    public startTasksParallel(onComplete: () => void)
    public startTasksParallel(onProgress: (progress: number) => void, onComplete: () => void)
    public startTasksParallel(onProgress: (progress?: number) => void, onComplete?: () => void) {
        if (this.isRunning) {
            return;
        }
        if (!onComplete && onProgress) {
            onComplete = onProgress;
            onProgress = null;
        }
        this.isRunning = true;
        this.completeProgress = 0;
        this.completedCount = 0;
        this.forEach(this.tasks, (task, done) => {
            task.runner((value) => {
                this.completeProgress = Math.max((this.completedCount + Math.min(1, value * 1)) / this.totalTaskCount, this.completeProgress);
                onProgress?.(this.completeProgress);
            }, () => {
                this.completedCount++;
                this.completeProgress = this.completedCount / this.totalTaskCount;
                onProgress?.(this.completeProgress);
                done();
            });
        }, () => {
            this.completeProgress = this.completedCount / this.totalTaskCount;
            onProgress?.(this.completeProgress);
            onComplete?.();

            this.tasks.forEach((task) => {
                task.recycle();
            });
            this.tasks.length = 0;
        });
    }
    private nextTask(onProgress: (progress?: number) => void, onComplete?: () => void) {

        if (!onComplete && onProgress) {
            onComplete = onProgress;
            onProgress = null;
        }

        if (this.tasks.length > 0) {
            let task = this.tasks.shift();
            task.runner((value) => {
                this.completeProgress = Math.max((this.completedCount + Math.min(1, value * 1)) / this.totalTaskCount, this.completeProgress);
                onProgress?.(this.completeProgress);
            }, () => {
                this.completedCount++;
                this.completeProgress = this.completedCount / this.totalTaskCount;
                onProgress?.(this.completeProgress);
                task.recycle();
                this.nextTask(onProgress, onComplete);
            });
            return;
        }

        if (this.tasks.length <= 0) {
            this.completeProgress = this.completedCount / this.totalTaskCount;
            onProgress?.(this.completeProgress);
            this.isRunning = false;
            onComplete?.();
        }
    }

    private forEach<T = any>(array: T[], process: ForEachFunction<T>, onComplete: (errs: Error[]) => void) {
        let count = 0;
        const errs: Error[] = [];
        const length = array.length;
        if (length === 0 && onComplete) {
            onComplete(errs);
        }
        const done = (err) => {
            if (err) {
                errs.push(err);
            }
            count++;
            if (count === length) {
                this.isRunning = false;
                if (onComplete) {
                    onComplete(errs);
                }
            }
        };
        for (let i = 0; i < length; i++) {
            process(array[i], done);
        }
    }

    public reset() {
        this.tasks = [];
        this.isRunning = false;
        this.totalTaskCount = 0;
        this.completedCount = 0;
        this.completeProgress = 0;
    }

}