import { useEffect } from 'react';
import useStore from './store/useStore';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import { subscribeToPushNotifications } from './utils/pushNotifications';
import './index.css';

function App() {
  const { user, theme } = useStore();

  useEffect(() => {
    // Apply theme class to document root
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (user) {
      subscribeToPushNotifications();
    }
  }, [user]);

  return (
    <>
      {/* Floating gradient orbs for glassmorphism depth */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Main app content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {user ? <Dashboard /> : <AuthPage />}
      </div>
    </>
  );
}

export default App;
