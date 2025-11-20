import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Cpu, HardDrive, Wifi, Zap, X, AlertTriangle, 
  Play, Pause, Trash2 
} from 'lucide-react';
import { useResourceMonitor } from '@/hooks/useResourceMonitor';
import { motion, AnimatePresence } from 'framer-motion';

export const ResourceUsageDashboard = () => {
  const {
    metrics,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    dismissAlert,
    getCurrentUsage
  } = useResourceMonitor();

  const [autoStart] = useState(true);

  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
    return () => stopMonitoring();
  }, [autoStart, startMonitoring, stopMonitoring]);

  const formatChartData = () => {
    return metrics.map((m, idx) => ({
      time: idx,
      CPU: m.cpu.toFixed(1),
      Memory: m.memory.toFixed(1),
      Network: m.network.toFixed(1),
      GPU: m.gpu.toFixed(1)
    }));
  };

  const currentUsage = getCurrentUsage();

  const getStatusColor = (value: number) => {
    if (value >= 90) return 'text-red-500';
    if (value >= 75) return 'text-orange-500';
    if (value >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBadge = (value: number) => {
    if (value >= 90) return { variant: 'destructive' as const, label: 'Critical' };
    if (value >= 75) return { variant: 'secondary' as const, label: 'High' };
    if (value >= 50) return { variant: 'secondary' as const, label: 'Medium' };
    return { variant: 'default' as const, label: 'Normal' };
  };

  return (
    <div className="space-y-4">
      {/* Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="space-y-2"
          >
            {alerts.slice(-3).map((alert) => (
              <Alert 
                key={alert.id} 
                variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                className="relative"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{alert.message}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dashboard */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Real-Time Resource Monitor
              </CardTitle>
              <CardDescription>
                Live system resource utilization and performance metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {alerts.length > 0 && (
                <Button
                  onClick={clearAlerts}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear Alerts ({alerts.length})
                </Button>
              )}
              <Button
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
                size="sm"
                variant={isMonitoring ? 'secondary' : 'default'}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="cpu">CPU</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="gpu">GPU</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              {/* Current Status */}
              {currentUsage && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">CPU</span>
                      </div>
                      <Badge {...getStatusBadge(currentUsage.cpu)}>
                        {getStatusBadge(currentUsage.cpu).label}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(currentUsage.cpu)}`}>
                      {currentUsage.cpu.toFixed(1)}%
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Memory</span>
                      </div>
                      <Badge {...getStatusBadge(currentUsage.memory)}>
                        {getStatusBadge(currentUsage.memory).label}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(currentUsage.memory)}`}>
                      {currentUsage.memory.toFixed(1)}%
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Network</span>
                      </div>
                      <Badge {...getStatusBadge(currentUsage.network)}>
                        {getStatusBadge(currentUsage.network).label}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(currentUsage.network)}`}>
                      {currentUsage.network.toFixed(1)}%
                    </div>
                  </div>

                  <div className="space-y-2 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">GPU</span>
                      </div>
                      <Badge {...getStatusBadge(currentUsage.gpu)}>
                        {getStatusBadge(currentUsage.gpu).label}
                      </Badge>
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(currentUsage.gpu)}`}>
                      {currentUsage.gpu.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Combined Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: 'Time (seconds ago)', position: 'insideBottom', offset: -5 }}
                      reversed
                    />
                    <YAxis 
                      label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="CPU" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Memory" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Network" stroke="#a855f7" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="GPU" stroke="#eab308" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* CPU Tab */}
            <TabsContent value="cpu">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" reversed />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="CPU" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Memory Tab */}
            <TabsContent value="memory">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" reversed />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="Memory" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Network Tab */}
            <TabsContent value="network">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" reversed />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="Network" 
                      stroke="#a855f7" 
                      fill="#a855f7" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* GPU Tab */}
            <TabsContent value="gpu">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" reversed />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="GPU" 
                      stroke="#eab308" 
                      fill="#eab308" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
