import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Music, Video, Mic, Scissors, TrendingUp, ArrowRight } from 'lucide-react';

interface DepartmentCollaborationProps {
  departments: string[];
  handoff?: {
    from: string;
    to: string;
    context: string;
  };
}

const DEPARTMENT_CONFIG = {
  story: {
    icon: BookOpen,
    label: 'Story Director',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]'
  },
  character: {
    icon: Users,
    label: 'Character Design',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    glowColor: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]'
  },
  soundtrack: {
    icon: Music,
    label: 'Soundtrack',
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    glowColor: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]'
  },
  cinematography: {
    icon: Video,
    label: 'Cinematography',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    glowColor: 'shadow-[0_0_15px_rgba(249,115,22,0.3)]'
  },
  dialogue: {
    icon: Mic,
    label: 'Dialogue & Voice',
    color: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    glowColor: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]'
  },
  post_production: {
    icon: Scissors,
    label: 'Post-Production',
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    glowColor: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  },
  marketing: {
    icon: TrendingUp,
    label: 'Marketing',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    glowColor: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]'
  }
};

export const DepartmentCollaboration = ({ departments, handoff }: DepartmentCollaborationProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHandoff, setShowHandoff] = useState(false);

  useEffect(() => {
    if (departments.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % departments.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [departments]);

  useEffect(() => {
    if (handoff) {
      setShowHandoff(true);
      const timeout = setTimeout(() => setShowHandoff(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [handoff]);

  if (departments.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Active Departments */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium">
          {departments.length === 1 ? 'Active:' : 'Collaborating:'}
        </span>
        {departments.map((dept, idx) => {
          const config = DEPARTMENT_CONFIG[dept as keyof typeof DEPARTMENT_CONFIG];
          if (!config) return null;
          
          const Icon = config.icon;
          const isActive = departments.length > 1 && idx === activeIndex;
          
          return (
            <Badge
              key={dept}
              variant="outline"
              className={`
                ${config.color} 
                ${isActive ? config.glowColor : ''} 
                transition-all duration-500 
                ${isActive ? 'scale-110' : 'scale-100'}
                animate-fade-in
                flex items-center gap-1.5 px-3 py-1
              `}
              style={{
                animationDelay: `${idx * 100}ms`
              }}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-medium">{config.label}</span>
            </Badge>
          );
        })}
      </div>

      {/* Handoff Notification */}
      {showHandoff && handoff && (
        <div className="animate-slide-in-right bg-muted/50 border border-border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Department Handoff</span>
            <div className="flex items-center gap-1">
              {DEPARTMENT_CONFIG[handoff.from as keyof typeof DEPARTMENT_CONFIG] && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                  {DEPARTMENT_CONFIG[handoff.from as keyof typeof DEPARTMENT_CONFIG].label}
                </Badge>
              )}
              <ArrowRight className="h-3 w-3" />
              {DEPARTMENT_CONFIG[handoff.to as keyof typeof DEPARTMENT_CONFIG] && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                  {DEPARTMENT_CONFIG[handoff.to as keyof typeof DEPARTMENT_CONFIG].label}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            "{handoff.context}"
          </p>
        </div>
      )}
    </div>
  );
};
