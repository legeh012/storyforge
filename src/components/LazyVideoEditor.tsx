import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the VideoEditor component (named export)
const VideoEditorComponent = lazy(() => 
  import('./VideoEditor').then(module => ({ 
    default: module.VideoEditor
  }))
);

export const LazyVideoEditor = (props: any) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96 bg-muted/50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading Video Editor...</p>
          </div>
        </div>
      }
    >
      <VideoEditorComponent {...props} />
    </Suspense>
  );
};
