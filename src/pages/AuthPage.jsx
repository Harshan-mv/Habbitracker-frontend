import { useEffect, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Goal, WalletCards } from 'lucide-react';
import useStore from '../store/useStore';
import useToastStore from '../store/useToastStore';
import api from '../utils/axiosConfig';

const FEATURES = [
  { icon: Check, text: 'Mark today and see your consistency over time' },
  { icon: Goal, text: 'Keep tasks and priorities in one place' },
  { icon: WalletCards, text: 'Plan income, expenses, and savings by month' },
];

let hasPingedServer = false;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useStore();

  useEffect(() => {
    if (hasPingedServer) return undefined;
    hasPingedServer = true;
    api.get('/health').catch((error) => {
      if (!error.response || [502, 503, 504].includes(error.response.status)) {
        useToastStore.getState().addToast(
          'Server is still unavailable. Please retry in a moment.',
          'error',
        );
      }
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
          || 'We could not sign you in. Check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode) => {
    setIsLogin(mode === 'login');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden lg:flex flex-col justify-between p-10 xl:p-14 border-e border-[var(--line)]">
        <a href="/" className="inline-flex w-fit items-center gap-3 no-underline text-[var(--text-primary)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--accent)] text-[var(--accent-ink)]">
            <Check size={19} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-base font-semibold">Habit Tracker</span>
        </a>

        <div className="max-w-xl py-12">
          <p className="mb-3 text-sm text-[var(--text-muted)]">Routines, tasks, and finances</p>
          <h1 className="max-w-lg text-4xl xl:text-5xl font-medium leading-[1.12] tracking-[-0.02em] text-[var(--text-primary)]">
            Keep the small things moving
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
            Build a steady record of your habits, make progress on your tasks, and keep an eye on the month ahead.
          </p>

          <div className="mt-9 app-surface max-w-lg p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--text-primary)]">A week at a glance</span>
              <span className="text-xs text-[var(--text-muted)]">Habit progress</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2" aria-label="Sample weekly habit progress">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div key={`${day}-${index}`} className="flex flex-col items-center gap-2">
                  <span className="text-[11px] text-[var(--text-muted)]">{day}</span>
                  <span
                    className={`h-8 w-8 rounded-[8px] border ${index < 4 ? 'bg-[var(--accent)]/25 border-[var(--accent)]/50' : 'bg-[var(--surface-raised)] border-[var(--line)]'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                <Icon size={17} strokeWidth={1.6} className="mt-0.5 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[var(--text-muted)]">A little structure for everyday plans</p>
      </section>

      <section className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <a href="/" className="mb-8 inline-flex items-center gap-2.5 text-[var(--text-primary)] no-underline lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--accent)] text-[var(--accent-ink)]">
            <Check size={17} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="font-semibold">Habit Tracker</span>
        </a>

        <div className="w-full max-w-[420px] rounded-[var(--radius-panel)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-raised)] sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-medium leading-tight text-[var(--text-primary)]">
              {isLogin ? 'Sign in' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {isLogin ? 'Continue with your routines and plans' : 'Start tracking your routines and plans'}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-[10px] border border-[var(--line)] bg-[var(--page)] p-1">
            {[
              { mode: 'login', label: 'Sign in' },
              { mode: 'register', label: 'Create account' },
            ].map(({ mode, label }) => {
              const active = (mode === 'login') === isLogin;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchMode(mode)}
                  className={`min-h-10 rounded-[7px] px-3 text-sm transition-colors ${active ? 'bg-[var(--surface-raised)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Name</label>
                <input
                  id="auth-name"
                  autoComplete="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={80}
                  className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-primary)]"
                  placeholder="Your name"
                  aria-invalid={Boolean(error)}
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Email</label>
              <input
                id="auth-email"
                autoComplete="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-primary)]"
                placeholder="name@example.com"
                aria-invalid={Boolean(error)}
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Password</label>
              <div className="flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] focus-within:border-[var(--accent)]">
                <input
                  id="auth-password"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--text-primary)] outline-none"
                  placeholder="At least 6 characters"
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  className="finance-icon-btn muted me-1"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="status-message" data-tone="error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" aria-hidden="true" />
                  {isLogin ? 'Signing in' : 'Creating account'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            {isLogin ? 'New to Habit Tracker?' : 'Already have an account?'}{' '}
            <button
              type="button"
              className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
              onClick={() => switchMode(isLogin ? 'register' : 'login')}
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
