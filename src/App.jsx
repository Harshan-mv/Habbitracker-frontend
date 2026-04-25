import { useEffect } from 'react';
import useStore from './store/useStore';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  const { user, theme } = useStore();

  useEffect(() => {
    // Apply theme class to document root
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return user ? <Dashboard /> : <AuthPage />;
}

export default App;
