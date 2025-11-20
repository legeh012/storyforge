import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface Stage {
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  progress?: number;
}

interface ProgressTrackerProps {
  title: string;
  stages: Stage[];
  currentStage?: number;
}

export const ProgressTracker = ({ title, stages, currentStage = 0 }: ProgressTrackerProps) => {
  const overallProgress = Math.round(
    (stages.filter(s => s.status === 'completed').length / stages.length) * 100
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant={overallProgress === 100 ? 'default' : 'secondary'}>
            {overallProgress}%
          </Badge>
        </div>
        <Progress value={overallProgress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, index) => {
          const Icon =
            stage.status === 'completed'
              ? CheckCircle2
              : stage.status === 'in_progress'
              ? Clock
              : Circle;

          return (
            <div key={index} className="flex items-start gap-3">
              <Icon
                className={`h-5 w-5 mt-0.5 ${
                  stage.status === 'completed'
                    ? 'text-green-600'
                    : stage.status === 'in_progress'
                    ? 'text-blue-600 animate-pulse'
                    : 'text-muted-foreground'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    stage.status === 'pending' ? 'text-muted-foreground' : ''
                  }`}
                >
                  {stage.name}
                </p>
                {stage.status === 'in_progress' && stage.progress !== undefined && (
                  <Progress value={stage.progress} className="mt-2 h-1" />
                )}
              </div>
              <Badge
                variant={
                  stage.status === 'completed'
                    ? 'default'
                    : stage.status === 'in_progress'
                    ? 'secondary'
                    : 'outline'
                }
                className="text-xs"
              >
                {stage.status === 'completed'
                  ? 'Done'
                  : stage.status === 'in_progress'
                  ? 'Active'
                  : 'Pending'}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
