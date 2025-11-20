import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if cmd/ctrl is pressed
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K: Open Mayza (focus on assistant)
      if (isMod && e.key === 'k') {
        e.preventDefault();
        const mayzaToggle = document.querySelector('[aria-label="Open Mayza AI Assistant"]') as HTMLButtonElement;
        if (mayzaToggle) {
          mayzaToggle.click();
        }
      }

      // Cmd/Ctrl + /: Navigate to dashboard
      if (isMod && e.key === '/') {
        e.preventDefault();
        navigate('/dashboard');
      }

      // Cmd/Ctrl + E: Navigate to episodes
      if (isMod && e.key === 'e') {
        e.preventDefault();
        navigate('/episodes');
      }

      // Cmd/Ctrl + P: Navigate to create project
      if (isMod && e.key === 'p') {
        e.preventDefault();
        navigate('/create-project');
      }

      // Cmd/Ctrl + M: Navigate to media library
      if (isMod && e.key === 'm') {
        e.preventDefault();
        navigate('/media-library');
      }

      // Cmd/Ctrl + B: Navigate to viral bots
      if (isMod && e.key === 'b') {
        e.preventDefault();
        navigate('/viral-bots');
      }

      // Escape: Close Mayza if open
      if (e.key === 'Escape') {
        const mayzaClose = document.querySelector('[aria-label="Close Mayza Assistant"]') as HTMLButtonElement;
        if (mayzaClose) {
          mayzaClose.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
};
