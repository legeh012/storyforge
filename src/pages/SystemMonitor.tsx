import Navigation from '@/components/Navigation';
import { SystemHealthMonitor } from '@/components/SystemHealthMonitor';
import { ResourceUsageDashboard } from '@/components/ResourceUsageDashboard';
import { ResourceOptimizationPanel } from '@/components/ResourceOptimizationPanel';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSelfHealing } from '@/hooks/useSelfHealing';
import { useToast } from '@/hooks/use-toast';

const SystemMonitor = () => {
  const { reportError } = useSelfHealing();
  const { toast } = useToast();

  const testSelfHealing = async () => {
    // Test the self-healing system with a sample error
    const testError = new Error('Test timeout error for self-healing');
    testError.name = 'TimeoutError';
    
    const result = await reportError(testError, {
      component: 'SystemMonitor',
      action: 'test_self_healing',
      metadata: { test: true }
    });

    if (result.success) {
      toast({
        title: 'Self-Healing Triggered',
        description: `Recovery action: ${result.recovery.action}`
      });
    } else {
      toast({
        title: 'Test Failed',
        description: 'Could not trigger self-healing system',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <SEOHead
        title="System Monitor - StoryForge"
        description="Monitor system health and error recovery"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">System Monitor</h1>
              <p className="text-muted-foreground">
                Real-time system health, resource monitoring, and optimization
              </p>
            </div>
            <Button onClick={testSelfHealing} variant="outline">
              Test Self-Healing
            </Button>
          </div>
          
          <Tabs defaultValue="resources" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resources">Resource Usage</TabsTrigger>
              <TabsTrigger value="optimization">Optimization</TabsTrigger>
              <TabsTrigger value="health">System Health</TabsTrigger>
            </TabsList>

            <TabsContent value="resources">
              <ResourceUsageDashboard />
            </TabsContent>

            <TabsContent value="optimization">
              <ResourceOptimizationPanel />
            </TabsContent>

            <TabsContent value="health">
              <SystemHealthMonitor />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default SystemMonitor;
