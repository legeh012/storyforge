import { supabase } from '@/integrations/supabase/client';

interface SyncTask {
  id: string;
  type: 'insert' | 'update' | 'delete' | 'function';
  table?: string;
  data?: any;
  functionName?: string;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class BackgroundSyncManager {
  private queue: SyncTask[] = [];
  private processing = false;
  private listeners: ((queue: SyncTask[]) => void)[] = [];
  private maxRetries = 3;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem('sync-queue');
      if (stored) {
        this.queue = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem('sync-queue', JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('Connection restored, processing queue...');
      this.processQueue();
    });

    window.addEventListener('app-online', () => {
      this.processQueue();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  public subscribe(listener: (queue: SyncTask[]) => void) {
    this.listeners.push(listener);
    listener([...this.queue]); // Initial call
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public async addTask(task: Omit<SyncTask, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const newTask: SyncTask = {
      ...task,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: task.maxRetries ?? this.maxRetries
    };

    this.queue.push(newTask);
    this.saveQueue();

    // Try to process immediately if online
    if (navigator.onLine) {
      await this.processQueue();
    }
  }

  public async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.processing = true;
    const tasksToProcess = [...this.queue];

    for (const task of tasksToProcess) {
      try {
        await this.executeTask(task);
        // Remove successful task
        this.queue = this.queue.filter(t => t.id !== task.id);
        this.saveQueue();
      } catch (error) {
        console.error('Task failed:', task, error);
        
        // Increment retry count
        const taskIndex = this.queue.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          this.queue[taskIndex].retryCount++;
          
          // Remove if max retries exceeded
          if (this.queue[taskIndex].retryCount >= task.maxRetries) {
            console.error('Task exceeded max retries, removing:', task);
            this.queue.splice(taskIndex, 1);
            window.dispatchEvent(new CustomEvent('sync-task-failed', { detail: task }));
          }
          
          this.saveQueue();
        }
      }
    }

    this.processing = false;
  }

  private async executeTask(task: SyncTask): Promise<void> {
    switch (task.type) {
      case 'insert':
        if (!task.table || !task.data) throw new Error('Invalid insert task');
        const { error: insertError } = await (supabase as any)
          .from(task.table)
          .insert(task.data);
        if (insertError) throw insertError;
        break;

      case 'update':
        if (!task.table || !task.data) throw new Error('Invalid update task');
        const { error: updateError } = await (supabase as any)
          .from(task.table)
          .update(task.data)
          .eq('id', task.data.id);
        if (updateError) throw updateError;
        break;

      case 'delete':
        if (!task.table || !task.data?.id) throw new Error('Invalid delete task');
        const { error: deleteError } = await (supabase as any)
          .from(task.table)
          .delete()
          .eq('id', task.data.id);
        if (deleteError) throw deleteError;
        break;

      case 'function':
        if (!task.functionName) throw new Error('Invalid function task');
        const { error: funcError } = await supabase.functions.invoke(
          task.functionName,
          { body: task.data }
        );
        if (funcError) throw funcError;
        break;

      default:
        throw new Error(`Unknown task type: ${(task as any).type}`);
    }

    window.dispatchEvent(new CustomEvent('sync-task-success', { detail: task }));
  }

  public getQueueStatus() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(t => t.retryCount === 0).length,
      retrying: this.queue.filter(t => t.retryCount > 0).length,
      processing: this.processing
    };
  }

  public clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  public getQueue() {
    return [...this.queue];
  }
}

export const backgroundSyncManager = new BackgroundSyncManager();

// Helper functions for common operations
export const queueInsert = async (table: string, data: any) => {
  try {
    if (navigator.onLine) {
      const { error } = await (supabase as any).from(table).insert(data);
      if (error) throw error;
    } else {
      await backgroundSyncManager.addTask({
        type: 'insert',
        table,
        data,
        maxRetries: 3
      });
    }
  } catch (error) {
    await backgroundSyncManager.addTask({
      type: 'insert',
      table,
      data,
      maxRetries: 3
    });
    throw error;
  }
};

export const queueUpdate = async (table: string, data: any) => {
  try {
    if (navigator.onLine) {
      const { error } = await (supabase as any).from(table).update(data).eq('id', data.id);
      if (error) throw error;
    } else {
      await backgroundSyncManager.addTask({
        type: 'update',
        table,
        data,
        maxRetries: 3
      });
    }
  } catch (error) {
    await backgroundSyncManager.addTask({
      type: 'update',
      table,
      data,
      maxRetries: 3
    });
    throw error;
  }
};

export const queueFunctionCall = async (functionName: string, data: any) => {
  try {
    if (navigator.onLine) {
      const { error } = await supabase.functions.invoke(functionName, { body: data });
      if (error) throw error;
    } else {
      await backgroundSyncManager.addTask({
        type: 'function',
        functionName,
        data,
        maxRetries: 3
      });
    }
  } catch (error) {
    await backgroundSyncManager.addTask({
      type: 'function',
      functionName,
      data,
      maxRetries: 3
    });
    throw error;
  }
};
