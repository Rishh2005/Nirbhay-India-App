import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QuickExit = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Triple press Escape or Ctrl+Shift+X for quick exit
      if (e.key === 'Escape' || (e.ctrlKey && e.shiftKey && e.key === 'X')) {
        window.location.replace('https://www.google.com');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleQuickExit = () => {
    // Replace current page with Google to hide from history
    window.location.replace('https://www.google.com');
  };

  return (
    <button
      onClick={handleQuickExit}
      className="fixed top-4 right-4 z-50 px-3 py-1.5 bg-danger text-white text-xs font-medium rounded-md hover:bg-danger/90 transition-colors shadow-lg"
      title="Quick Exit (Esc or Ctrl+Shift+X)"
    >
      Quick Exit
    </button>
  );
};

export default QuickExit;
