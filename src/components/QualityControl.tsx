import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";

interface QualityMetric {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  value?: number;
  threshold?: number;
  message: string;
}

interface QualityControlProps {
  metrics: QualityMetric[];
  overallScore: number;
  isChecking: boolean;
}

export const QualityControl = ({ metrics, overallScore, isChecking }: QualityControlProps) => {
  const getStatusIcon = (status: QualityMetric['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'fail': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusBadge = (status: QualityMetric['status']) => {
    const variants = {
      pass: 'bg-green-500/10 text-green-500 border-green-500/20',
      fail: 'bg-red-500/10 text-red-500 border-red-500/20',
      warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      pending: 'bg-muted text-muted-foreground'
    };
    return variants[status];
  };

  const passCount = metrics.filter(m => m.status === 'pass').length;
  const failCount = metrics.filter(m => m.status === 'fail').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quality Control
            </CardTitle>
            <CardDescription>AI-powered production quality validation</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{overallScore}%</div>
            <div className="text-xs text-muted-foreground">Quality Score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Quality</span>
            <span className="text-muted-foreground">{overallScore}%</span>
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>

        {/* Status Summary */}
        <div className="flex gap-3">
          {passCount > 0 && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {passCount} Passed
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              {warningCount} Warnings
            </Badge>
          )}
          {failCount > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              {failCount} Failed
            </Badge>
          )}
        </div>

        {/* Quality Metrics */}
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                metric.status === 'pending' ? 'animate-pulse' : ''
              }`}
            >
              {getStatusIcon(metric.status)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{metric.name}</span>
                  {metric.value !== undefined && metric.threshold !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {metric.value}/{metric.threshold}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{metric.message}</p>
              </div>
              <Badge variant="outline" className={getStatusBadge(metric.status)}>
                {metric.status.toUpperCase()}
              </Badge>
            </div>
          ))}
        </div>

        {/* Checking Status */}
        {isChecking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 animate-pulse text-primary" />
            Running AI quality validation...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
