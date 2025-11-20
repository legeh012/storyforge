interface DeviceCapabilities {
  cores: number;
  memory: number;
  devicePixelRatio: number;
  connectionType: string;
  gpu: string;
}

interface OptimizationSettings {
  videoQuality: 'low' | 'medium' | 'high' | 'ultra';
  workerPoolSize: number;
  maxConcurrentTasks: number;
  chunkSize: number;
  enableParallelProcessing: boolean;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
  imageCompression: number;
}

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  processingSpeed: number;
}

class ResourceOptimizer {
  private capabilities: DeviceCapabilities;
  private currentSettings: OptimizationSettings;
  private metrics: PerformanceMetrics = {
    fps: 60,
    memory: 0,
    loadTime: 0,
    processingSpeed: 0
  };
  private listeners: ((settings: OptimizationSettings) => void)[] = [];

  constructor() {
    this.capabilities = this.detectCapabilities();
    this.currentSettings = this.calculateOptimalSettings();
    this.startPerformanceMonitoring();
  }

  private detectCapabilities(): DeviceCapabilities {
    const cores = navigator.hardwareConcurrency || 4;
    
    // Get memory if available (Chrome only)
    const memory = (performance as any).memory 
      ? (performance as any).memory.jsHeapSizeLimit / (1024 * 1024 * 1024)
      : 4; // Default to 4GB

    const devicePixelRatio = window.devicePixelRatio || 1;

    // Detect connection type
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection?.effectiveType || 'unknown';

    // Try to detect GPU
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const debugInfo = gl ? (gl as any).getExtension('WEBGL_debug_renderer_info') : null;
    const gpu = debugInfo ? (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';

    return {
      cores,
      memory,
      devicePixelRatio,
      connectionType,
      gpu
    };
  }

  private calculateOptimalSettings(): OptimizationSettings {
    const { cores, memory, connectionType } = this.capabilities;

    // Determine video quality based on device capabilities
    let videoQuality: OptimizationSettings['videoQuality'] = 'medium';
    if (memory >= 8 && cores >= 8) {
      videoQuality = 'ultra';
    } else if (memory >= 4 && cores >= 4) {
      videoQuality = 'high';
    } else if (memory >= 2 && cores >= 2) {
      videoQuality = 'medium';
    } else {
      videoQuality = 'low';
    }

    // Adjust for connection speed
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      videoQuality = 'low';
    } else if (connectionType === '3g') {
      videoQuality = videoQuality === 'ultra' ? 'high' : videoQuality;
    }

    // Worker pool size based on CPU cores
    const workerPoolSize = Math.min(cores, 8);

    // Max concurrent tasks based on memory
    const maxConcurrentTasks = Math.floor(memory / 0.5);

    // Chunk size based on available resources
    const chunkSize = videoQuality === 'ultra' ? 8192 :
                      videoQuality === 'high' ? 4096 :
                      videoQuality === 'medium' ? 2048 : 1024;

    // Enable parallel processing for capable devices
    const enableParallelProcessing = cores >= 4 && memory >= 2;

    // Cache strategy based on available memory
    const cacheStrategy: OptimizationSettings['cacheStrategy'] = 
      memory >= 8 ? 'aggressive' :
      memory >= 4 ? 'moderate' : 'minimal';

    // Image compression (0-100, higher = better quality)
    const imageCompression = videoQuality === 'ultra' ? 95 :
                             videoQuality === 'high' ? 85 :
                             videoQuality === 'medium' ? 75 : 65;

    return {
      videoQuality,
      workerPoolSize,
      maxConcurrentTasks,
      chunkSize,
      enableParallelProcessing,
      cacheStrategy,
      imageCompression
    };
  }

  private startPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();

    const monitor = () => {
      const currentTime = performance.now();
      frameCount++;

      // Update FPS every second
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        const memory = (performance as any).memory 
          ? Math.round(((performance as any).memory.usedJSHeapSize / 1048576))
          : 0;

        this.metrics = {
          ...this.metrics,
          fps,
          memory
        };

        // Auto-adjust settings if performance degrades
        this.autoAdjustSettings();

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(monitor);
    };

    monitor();
  }

  private autoAdjustSettings() {
    const { fps, memory } = this.metrics;
    let changed = false;

    // Downgrade quality if FPS drops below 30
    if (fps < 30 && this.currentSettings.videoQuality !== 'low') {
      const qualities: Array<OptimizationSettings['videoQuality']> = ['ultra', 'high', 'medium', 'low'];
      const currentIndex = qualities.indexOf(this.currentSettings.videoQuality);
      if (currentIndex < qualities.length - 1) {
        this.currentSettings.videoQuality = qualities[currentIndex + 1];
        changed = true;
      }
    }

    // Reduce worker pool if memory is high
    if (memory > this.capabilities.memory * 1024 * 0.8) {
      if (this.currentSettings.workerPoolSize > 2) {
        this.currentSettings.workerPoolSize = Math.max(2, this.currentSettings.workerPoolSize - 1);
        changed = true;
      }
    }

    // Upgrade quality if performance is excellent
    if (fps >= 55 && memory < this.capabilities.memory * 1024 * 0.5) {
      const qualities: Array<OptimizationSettings['videoQuality']> = ['low', 'medium', 'high', 'ultra'];
      const currentIndex = qualities.indexOf(this.currentSettings.videoQuality);
      if (currentIndex > 0 && currentIndex < qualities.length - 1) {
        this.currentSettings.videoQuality = qualities[currentIndex + 1];
        changed = true;
      }
    }

    if (changed) {
      this.notifyListeners();
      console.log('Settings auto-adjusted:', this.currentSettings);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentSettings));
  }

  public subscribe(listener: (settings: OptimizationSettings) => void) {
    this.listeners.push(listener);
    listener(this.currentSettings); // Initial call
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getSettings(): OptimizationSettings {
    return { ...this.currentSettings };
  }

  public getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public updateMetrics(metrics: Partial<PerformanceMetrics>) {
    this.metrics = { ...this.metrics, ...metrics };
  }

  public forceQuality(quality: OptimizationSettings['videoQuality']) {
    this.currentSettings.videoQuality = quality;
    this.notifyListeners();
  }

  public resetToOptimal() {
    this.currentSettings = this.calculateOptimalSettings();
    this.notifyListeners();
  }
}

export const resourceOptimizer = new ResourceOptimizer();

// Helper functions
export const getOptimalVideoResolution = (quality: OptimizationSettings['videoQuality']): { width: number; height: number } => {
  switch (quality) {
    case 'ultra':
      return { width: 1920, height: 1080 };
    case 'high':
      return { width: 1280, height: 720 };
    case 'medium':
      return { width: 854, height: 480 };
    case 'low':
      return { width: 640, height: 360 };
  }
};

export const getOptimalFrameRate = (quality: OptimizationSettings['videoQuality']): number => {
  switch (quality) {
    case 'ultra':
      return 60;
    case 'high':
      return 30;
    case 'medium':
      return 24;
    case 'low':
      return 15;
  }
};
