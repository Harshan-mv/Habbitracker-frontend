import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, Goal, WalletCards } from 'lucide-react';
import useStore from '../store/useStore';
import useToastStore from '../store/useToastStore';
import api from '../utils/axiosConfig';
import GoogleIdentityButton from '../components/GoogleIdentityButton';

const FEATURES = [
  { icon: Check, text: 'Mark today and see your consistency over time' },
  { icon: Goal, text: 'Keep tasks and priorities in one place' },
  { icon: WalletCards, text: 'Plan income, expenses, and savings by month' },
];

let hasPingedServer = false;

function PasswordResetFlow({ initialEmail, onBack, onComplete }) {
  const { requestPasswordReset, verifyPasswordResetCode, resetPassword } = useStore();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const stepInputRef = useRef(null);

  useEffect(() => {
    stepInputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setTimeout(
      () => setResendCountdown((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const sendCode = async (event) => {
    event.preventDefault();
    setError('');
    setLoadingAction('send');
    try {
      await requestPasswordReset(email.trim());
      setCode('');
      setStep('verify');
      setResendCountdown(60);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not send a code. Please try again.');
    } finally {
      setLoadingAction('');
    }
  };

  const resendCode = async () => {
    setError('');
    setLoadingAction('resend');
    try {
      await requestPasswordReset(email.trim());
      setResendCountdown(60);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not send a code. Please try again.');
    } finally {
      setLoadingAction('');
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    setError('');
    setLoadingAction('verify');
    try {
      const verifiedToken = await verifyPasswordResetCode(email.trim(), code);
      setResetToken(verifiedToken);
      setStep('password');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'That code is invalid or expired. Request a new code and try again.');
    } finally {
      setLoadingAction('');
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoadingAction('update');
    try {
      await resetPassword(email.trim(), resetToken, newPassword);
      onComplete(email.trim());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not update your password. Please try again.');
    } finally {
      setLoadingAction('');
    }
  };

  const stepIndex = step === 'email' ? 0 : step === 'verify' ? 1 : 2;
  const steps = ['Email', 'Verify', 'Password'];

  return (
    <div className="space-y-5">
      <button
        type="button"
        disabled={Boolean(loadingAction)}
        className="text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        onClick={onBack}
      >
        Back to sign in
      </button>

      <ol aria-label="Password reset progress" className="grid grid-cols-3 gap-2">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={index === stepIndex ? 'step' : undefined}
            className={`rounded-[var(--radius-control)] px-2 py-2 text-center text-xs ${index === stepIndex ? 'bg-[var(--surface-raised)] font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}
          >
            <span className="me-1">{index + 1}.</span>{label}
          </li>
        ))}
      </ol>

      {step === 'email' && (
        <form onSubmit={sendCode} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Email</label>
            <input
              id="reset-email"
              ref={stepInputRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={Boolean(loadingAction)}
              required
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-sm text-[var(--text-primary)]"
              placeholder="name@example.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'reset-form-error' : undefined}
            />
          </div>
          {error && <div id="reset-form-error" className="status-message" data-tone="error" role="alert">{error}</div>}
          <button
            type="submit"
            disabled={Boolean(loadingAction)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loadingAction === 'send' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" aria-hidden="true" />
                Sending code
              </>
            ) : 'Send code'}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={verifyCode} className="space-y-4">
          <p className="status-message" role="status">
            If an account exists for this email, we sent a 6-digit code.
          </p>
          <div>
            <label htmlFor="reset-code" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">6-digit code</label>
            <input
              id="reset-code"
              ref={stepInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={Boolean(loadingAction)}
              required
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] px-3 text-center font-mono text-lg tracking-[0.3em] text-[var(--text-primary)]"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'reset-form-error' : undefined}
            />
          </div>
          {error && <div id="reset-form-error" className="status-message" data-tone="error" role="alert">{error}</div>}
          <button
            type="submit"
            disabled={Boolean(loadingAction) || code.length !== 6}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loadingAction === 'verify' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" aria-hidden="true" />
                Verifying code
              </>
            ) : 'Verify code'}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              type="button"
              disabled={Boolean(loadingAction) || resendCountdown > 0}
              onClick={resendCode}
              className="font-medium text-[var(--accent)] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loadingAction === 'resend' ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-e-transparent" aria-hidden="true" />
                  Sending code
                </span>
              ) : resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend code'}
            </button>
            <button
              type="button"
              disabled={Boolean(loadingAction)}
              onClick={() => {
                setError('');
                setCode('');
                setStep('email');
              }}
              className="text-[var(--text-secondary)] underline-offset-4 hover:underline"
            >
              Change email
            </button>
          </div>
        </form>
      )}

      {step === 'password' && (
        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label htmlFor="reset-new-password" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">New password</label>
            <div className="flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] focus-within:border-[var(--accent)]">
              <input
                id="reset-new-password"
                ref={stepInputRef}
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={Boolean(loadingAction)}
                required
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--text-primary)] outline-none"
                placeholder="At least 6 characters"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'reset-form-error' : undefined}
              />
              <button
                type="button"
                className="finance-icon-btn muted me-1"
                onClick={() => setShowNewPassword((visible) => !visible)}
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                aria-pressed={showNewPassword}
              >
                {showNewPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="reset-confirm-password" className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">Confirm new password</label>
            <div className="flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] focus-within:border-[var(--accent)]">
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={Boolean(loadingAction)}
                required
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--text-primary)] outline-none"
                placeholder="Enter your new password again"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'reset-form-error' : undefined}
              />
              <button
                type="button"
                className="finance-icon-btn muted me-1"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
              </button>
            </div>
          </div>
          {error && <div id="reset-form-error" className="status-message" data-tone="error" role="alert">{error}</div>}
          <button
            type="submit"
            disabled={Boolean(loadingAction)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loadingAction === 'update' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-e-transparent" aria-hidden="true" />
                Updating password
              </>
            ) : 'Update password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, register, googleLogin, theme } = useStore();

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
    setGoogleError('');
    setResetSuccess(false);
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

  const handleGoogleCredential = async (credential) => {
    setGoogleError('');
    setGoogleLoading(true);
    try {
      await googleLogin(credential);
    } catch (requestError) {
      setGoogleError(
        requestError.response?.data?.message
          || 'Google sign-in failed. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign-in failed. Please try again.');
  };

  const switchMode = (mode) => {
    setIsLogin(mode === 'login');
    setResetMode(false);
    setResetSuccess(false);
    setError('');
    setGoogleError('');
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
              {resetMode ? 'Reset your password' : isLogin ? 'Sign in' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {resetMode ? 'Verify your email to choose a new password' : isLogin ? 'Continue with your routines and plans' : 'Start tracking your routines and plans'}
            </p>
          </div>

          {!resetMode && (
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
          )}

          {resetMode ? (
            <PasswordResetFlow
              initialEmail={email}
              onBack={() => setResetMode(false)}
              onComplete={(resetEmail) => {
                setEmail(resetEmail);
                setPassword('');
                setIsLogin(true);
                setResetMode(false);
                setError('');
                setGoogleError('');
                setResetSuccess(true);
              }}
            />
          ) : (
            <>
          {resetSuccess && (
            <div className="status-message mb-4" data-tone="success" role="status">
              Password updated. Please sign in.
            </div>
          )}
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
              {isLogin && (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                  onClick={() => {
                    setResetMode(true);
                    setResetSuccess(false);
                    setError('');
                    setGoogleError('');
                  }}
                >
                  Forgot password?
                </button>
              )}
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

          <div className="auth-divider"><span>or</span></div>
          <GoogleIdentityButton
            onCredential={handleGoogleCredential}
            onError={handleGoogleError}
            theme={theme}
            loading={googleLoading}
            disabled={loading}
          />
          {googleError && (
            <div className="status-message mt-3" data-tone="error" role="alert">
              {googleError}
            </div>
          )}

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
            </>
          )}
        </div>
      </section>
    </main>
  );
}
