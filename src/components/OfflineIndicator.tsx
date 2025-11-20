import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineIndicator = () => {
  const { isOnline, wasOffline } = useOfflineDetection();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Alert variant="destructive" className="shadow-lg">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're offline. Some features may be limited.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Alert className="shadow-lg border-green-500 bg-green-50 dark:bg-green-950">
            <Wifi className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Back online! Syncing data...
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
