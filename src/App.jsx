import { useEffect } from 'react';
import useStore from './store/useStore';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ToastViewport from './components/ToastViewport';
import { subscribeToPushNotifications } from './utils/pushNotifications';
import './index.css';

function App() {
  const { user, theme } = useStore();

  useEffect(() => {
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
      {user ? <Dashboard /> : <AuthPage />}
      <ToastViewport />
    </>
  );
}

export default App;
