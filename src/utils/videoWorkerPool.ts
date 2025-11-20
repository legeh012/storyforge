class WorkerPool {
  private workers: Worker[] = [];
  private taskQueue: Array<{ task: any; resolve: Function; reject: Function }> = [];
  private activeWorkers = new Set<Worker>();

  constructor(private poolSize: number = navigator.hardwareConcurrency || 4) {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker('/video-worker.js');
      worker.addEventListener('message', this.handleWorkerMessage.bind(this, worker));
      worker.addEventListener('error', this.handleWorkerError.bind(this, worker));
      this.workers.push(worker);
    }
  }

  private handleWorkerMessage(worker: Worker, e: MessageEvent) {
    const { type, result, error } = e.data;

    if (type === 'ERROR') {
      console.error('Worker error:', error);
    }

    // Mark worker as available
    this.activeWorkers.delete(worker);

    // Process next task if available
    this.processNextTask();
  }

  private handleWorkerError(worker: Worker, error: ErrorEvent) {
    console.error('Worker error:', error);
    this.activeWorkers.delete(worker);
    this.processNextTask();
  }

  private processNextTask() {
    if (this.taskQueue.length === 0) return;

    const availableWorker = this.workers.find(w => !this.activeWorkers.has(w));
    if (!availableWorker) return;

    const { task, resolve, reject } = this.taskQueue.shift()!;
    this.activeWorkers.add(availableWorker);

    // Set up one-time message listener for this task
    const messageHandler = (e: MessageEvent) => {
      const { type, result, error } = e.data;
      
      if (type === 'ERROR') {
        reject(new Error(error));
      } else {
        resolve(result);
      }
      
      availableWorker.removeEventListener('message', messageHandler);
    };

    availableWorker.addEventListener('message', messageHandler);
    availableWorker.postMessage(task);
  }

  public async execute<T>(task: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      this.processNextTask();
    });
  }

  public async parallelProcess<T>(tasks: any[]): Promise<T[]> {
    return Promise.all(tasks.map(task => this.execute<T>(task)));
  }

  public terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers.clear();
  }
}

export const videoWorkerPool = new WorkerPool();

// Helper functions for common tasks
export const processFrameParallel = async (frameUrl: string, index: number, settings?: any) => {
  return videoWorkerPool.execute({
    type: 'PROCESS_FRAME',
    data: { frameUrl, index, settings }
  });
};

export const validateQualityParallel = async (frameUrl: string, qualitySettings?: any) => {
  return videoWorkerPool.execute({
    type: 'VALIDATE_QUALITY',
    data: { frameUrl, qualitySettings }
  });
};

export const optimizeAssetParallel = async (assetUrl: string, optimizationLevel: number = 2) => {
  return videoWorkerPool.execute({
    type: 'OPTIMIZE_ASSET',
    data: { assetUrl, optimizationLevel }
  });
};

export const batchProcessParallel = async (items: any[], operation: string) => {
  return videoWorkerPool.execute({
    type: 'BATCH_PROCESS',
    data: { items, operation }
  });
};
