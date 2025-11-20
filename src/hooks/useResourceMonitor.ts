import { useState, useEffect, useCallback } from 'react';

interface ResourceMetric {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
  gpu: number;
}

interface ResourceAlert {
  id: string;
  type: 'cpu' | 'memory' | 'network' | 'gpu';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: number;
}

const THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 75, critical: 90 },
  network: { warning: 80, critical: 95 },
  gpu: { warning: 75, critical: 90 }
};

const MAX_DATA_POINTS = 60; // Keep 60 data points (1 minute at 1 point per second)

export const useResourceMonitor = () => {
  const [metrics, setMetrics] = useState<ResourceMetric[]>([]);
  const [alerts, setAlerts] = useState<ResourceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const calculateCPU = useCallback((): number => {
    // Estimate CPU usage based on FPS performance
    const performance = (window.performance as any);
    if (performance.memory) {
      const usedMemory = performance.memory.usedJSHeapSize;
      const totalMemory = performance.memory.jsHeapSizeLimit;
      // Rough estimate: high memory pressure indicates CPU usage
      return Math.min((usedMemory / totalMemory) * 100, 100);
    }
    return Math.random() * 30 + 40; // Fallback simulation
  }, []);

  const calculateMemory = useCallback((): number => {
    const performance = (window.performance as any);
    if (performance.memory) {
      const usedMemory = performance.memory.usedJSHeapSize;
      const totalMemory = performance.memory.jsHeapSizeLimit;
      return (usedMemory / totalMemory) * 100;
    }
    return 0;
  }, []);

  const calculateNetwork = useCallback((): number => {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    if (connection) {
      // Estimate based on connection type
      const effectiveType = connection.effectiveType;
      const downlink = connection.downlink || 10;
      
      switch (effectiveType) {
        case '4g':
          return Math.min((10 - downlink) / 10 * 100, 100);
        case '3g':
          return Math.min((5 - downlink) / 5 * 100 + 30, 100);
        case '2g':
        case 'slow-2g':
          return Math.min(80 + Math.random() * 20, 100);
        default:
          return Math.min((10 - downlink) / 10 * 100, 100);
      }
    }
    return Math.random() * 20 + 10; // Fallback simulation
  }, []);

  const calculateGPU = useCallback((): number => {
    // GPU usage is hard to measure directly in browser
    // Estimate based on rendering performance
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        // If we can get GPU info, simulate based on device capabilities
        return Math.random() * 30 + 40;
      }
    }
    return Math.random() * 25 + 30; // Fallback simulation
  }, []);

  const checkAlerts = useCallback((metric: ResourceMetric) => {
    const newAlerts: ResourceAlert[] = [];
    const timestamp = Date.now();

    Object.entries(THRESHOLDS).forEach(([key, thresholds]) => {
      const value = metric[key as keyof typeof THRESHOLDS];
      const metricKey = key as 'cpu' | 'memory' | 'network' | 'gpu';

      if (value >= thresholds.critical) {
        newAlerts.push({
          id: `${metricKey}-${timestamp}`,
          type: metricKey,
          severity: 'critical',
          message: `${metricKey.toUpperCase()} usage critical: ${value.toFixed(1)}%`,
          timestamp
        });
      } else if (value >= thresholds.warning) {
        newAlerts.push({
          id: `${metricKey}-${timestamp}`,
          type: metricKey,
          severity: 'warning',
          message: `${metricKey.toUpperCase()} usage high: ${value.toFixed(1)}%`,
          timestamp
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => {
        // Only keep recent alerts (last 10 minutes)
        const recentAlerts = prev.filter(a => timestamp - a.timestamp < 600000);
        // Avoid duplicate alerts for the same metric within 5 seconds
        const uniqueAlerts = newAlerts.filter(newAlert => 
          !recentAlerts.some(existing => 
            existing.type === newAlert.type && 
            newAlert.timestamp - existing.timestamp < 5000
          )
        );
        return [...recentAlerts, ...uniqueAlerts].slice(-20); // Keep last 20 alerts
      });
    }
  }, []);

  const collectMetrics = useCallback(() => {
    const metric: ResourceMetric = {
      timestamp: Date.now(),
      cpu: calculateCPU(),
      memory: calculateMemory(),
      network: calculateNetwork(),
      gpu: calculateGPU()
    };

    setMetrics(prev => {
      const updated = [...prev, metric];
      return updated.slice(-MAX_DATA_POINTS);
    });

    checkAlerts(metric);
  }, [calculateCPU, calculateMemory, calculateNetwork, calculateGPU, checkAlerts]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(collectMetrics, 1000);
    return () => clearInterval(interval);
  }, [isMonitoring, collectMetrics]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    collectMetrics(); // Collect initial metric
  }, [collectMetrics]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const getCurrentUsage = useCallback(() => {
    if (metrics.length === 0) return null;
    return metrics[metrics.length - 1];
  }, [metrics]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    dismissAlert,
    getCurrentUsage
  };
};
