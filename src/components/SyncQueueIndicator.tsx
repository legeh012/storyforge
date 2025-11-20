import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CloudOff, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { backgroundSyncManager } from '@/utils/backgroundSync';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export const SyncQueueIndicator = () => {
  const [queueStatus, setQueueStatus] = useState(backgroundSyncManager.getQueueStatus());
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = backgroundSyncManager.subscribe((queue) => {
      setQueueStatus(backgroundSyncManager.getQueueStatus());
    });

    const handleSuccess = (e: CustomEvent) => {
      toast({
        title: "Sync Complete",
        description: "Task synced successfully",
      });
    };

    const handleFailure = (e: CustomEvent) => {
      toast({
        title: "Sync Failed",
        description: "Task exceeded max retries",
        variant: "destructive",
      });
    };

    window.addEventListener('sync-task-success' as any, handleSuccess);
    window.addEventListener('sync-task-failed' as any, handleFailure);

    return () => {
      unsubscribe();
      window.removeEventListener('sync-task-success' as any, handleSuccess);
      window.removeEventListener('sync-task-failed' as any, handleFailure);
    };
  }, [toast]);

  const handleRetry = async () => {
    await backgroundSyncManager.processQueue();
    toast({
      title: "Retrying...",
      description: "Processing queued tasks",
    });
  };

  const handleClear = () => {
    backgroundSyncManager.clearQueue();
    toast({
      title: "Queue Cleared",
      description: "All pending tasks removed",
    });
  };

  if (queueStatus.total === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50 w-80"
      >
        <Card className="border-2 border-orange-500/20 shadow-lg">
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudOff className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-sm">Sync Queue</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {queueStatus.total} pending
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="h-6 w-6 p-0"
                >
                  {expanded ? <X className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Processing Status</span>
                {queueStatus.processing ? (
                  <span className="flex items-center gap-1 text-blue-500">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    Waiting
                  </span>
                )}
              </div>
              
              {queueStatus.processing && (
                <Progress value={50} className="h-1" />
              )}
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 border-t pt-3"
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Pending</div>
                      <div className="font-semibold">{queueStatus.pending}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Retrying</div>
                      <div className="font-semibold text-orange-500">{queueStatus.retrying}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleRetry}
                      disabled={queueStatus.processing || !navigator.onLine}
                      size="sm"
                      className="flex-1"
                      variant="outline"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry Now
                    </Button>
                    <Button
                      onClick={handleClear}
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                    >
                      Clear Queue
                    </Button>
                  </div>

                  {!navigator.onLine && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Will auto-retry when online
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
