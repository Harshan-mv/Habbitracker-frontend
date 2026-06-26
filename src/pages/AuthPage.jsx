import { useState, useEffect } from 'react';
import useStore from '../store/useStore';

const FEATURES = [
  { icon: '🔥', title: 'Build Streaks', desc: 'Track consecutive days and watch your streaks grow' },
  { icon: '📊', title: 'Visual Progress', desc: 'Beautiful heatmap grid to see your journey at a glance' },
  { icon: '🎯', title: 'Daily Focus', desc: 'Stay focused on what matters most each day' },
  { icon: '🏆', title: 'Hit Records', desc: 'Beat your longest streak and celebrate every win' },
];

const HABIT_EXAMPLES = ['Morning Run 🏃', 'Read 30 min 📚', 'Meditate 🧘', 'Drink Water 💧', 'Journaling ✍️', 'No Sugar 🚫'];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [habitsIdx, setHabitsIdx] = useState(0);
  const { login, register } = useStore();

  // Cycle through example habits
  useEffect(() => {
    const timer = setInterval(() => {
      setHabitsIdx((i) => (i + 1) % HABIT_EXAMPLES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ══════════════════ LEFT PANEL ══════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ width: '52%' }}
      >
        {/* Animated gradient orbs */}
        <div
          className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.25) 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', animation: 'pulse 5s ease-in-out infinite 1s' }}
        />
        <div
          className="absolute top-[40%] right-[-40px] w-48 h-48 rounded-full blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite 2s' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-lg shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              boxShadow: '0 0 24px rgba(74,222,128,0.4)',
            }}
          >
            ✓
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight" style={{ color: 'var(--text-primary)' }}>Habit Tracker</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Build better habits daily</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h1 className="text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Small habits.<br />
            <span style={{ background: 'linear-gradient(90deg, #4ade80, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Big results.
            </span>
          </h1>
          <p className="text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
            Track your daily habits with a beautiful heatmap. Build streaks, stay consistent, become unstoppable.
          </p>

          {/* Animated habit chip – glass */}
          <div className="mb-10">
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: 'rgba(74,222,128,0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(74,222,128,0.3)',
                boxShadow: '0 4px 24px rgba(74,222,128,0.1), var(--glass-inset-shadow)',
                transition: 'all 0.4s ease',
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 12px #4ade80' }} />
              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{HABIT_EXAMPLES[habitsIdx]}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.2)', color: 'var(--accent-green-dark)' }}>Today ✓</span>
            </div>
          </div>

          {/* Feature list – glass cards */}
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-4 rounded-2xl transition-all duration-300"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(var(--glass-blur))',
                  WebkitBackdropFilter: 'blur(var(--glass-blur))',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-inset-shadow)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--glass-bg-strong)';
                  e.currentTarget.style.borderColor = 'var(--border-glow)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--glass-bg)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[['∞', 'Streaks possible'], ['24/7', 'Always in sync'], ['100%', 'Ad-free forever']].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="text-xl font-bold" style={{ color: 'var(--accent-green)', textShadow: '0 0 16px rgba(74,222,128,0.3)' }}>{val}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════ RIGHT PANEL – Glass Form ══════════════════ */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 relative"
      >
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold"
            style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', boxShadow: '0 0 20px rgba(74,222,128,0.4)' }}
          >✓</div>
          <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Habit Tracker</span>
        </div>

        <div
          className="w-full p-8 rounded-3xl"
          style={{
            maxWidth: '420px',
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'blur(var(--glass-blur-strong))',
            WebkitBackdropFilter: 'blur(var(--glass-blur-strong))',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow-lg), var(--glass-inset-shadow)',
          }}
        >
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {isLogin ? 'Welcome back 👋' : 'Start your journey 🚀'}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {isLogin
                ? 'Sign in to continue tracking your habits'
                : 'Create your free account in seconds'}
            </p>
          </div>

          {/* Mode toggle – glass */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {['login', 'register'].map((mode) => {
              const active = (mode === 'login') === isLogin;
              return (
                <button
                  key={mode}
                  onClick={() => switchMode(mode)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-250"
                  style={active
                    ? {
                        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                        color: '#000',
                        boxShadow: '0 4px 20px rgba(74,222,128,0.35), 0 0 30px rgba(74,222,128,0.15)',
                      }
                    : { color: 'var(--text-secondary)' }
                  }
                >
                  {mode === 'login' ? 'Sign In' : 'Register'}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: `1.5px solid ${focusedField === 'name' ? 'var(--accent-green)' : 'var(--glass-border)'}`,
                    boxShadow: focusedField === 'name' ? '0 0 20px rgba(74,222,128,0.15), var(--glass-inset-shadow)' : 'var(--glass-inset-shadow)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>👤</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your full name"
                    required
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: `1.5px solid ${focusedField === 'email' ? 'var(--accent-green)' : 'var(--glass-border)'}`,
                  boxShadow: focusedField === 'email' ? '0 0 20px rgba(74,222,128,0.15), var(--glass-inset-shadow)' : 'var(--glass-inset-shadow)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: `1.5px solid ${focusedField === 'password' ? 'var(--accent-green)' : 'var(--glass-border)'}`,
                  boxShadow: focusedField === 'password' ? '0 0 20px rgba(74,222,128,0.15), var(--glass-inset-shadow)' : 'var(--glass-inset-shadow)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444',
                }}
              >
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 mt-2 relative overflow-hidden"
              style={{
                background: loading ? 'var(--glass-bg-strong)' : 'linear-gradient(135deg, #4ade80, #22c55e)',
                color: loading ? 'var(--text-muted)' : '#000',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(74,222,128,0.4), 0 0 40px rgba(74,222,128,0.15)',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : isLogin ? '→ Sign In' : '→ Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
          </div>

          {/* Switch mode link */}
          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(isLogin ? 'register' : 'login')}
              className="font-semibold transition-colors"
              style={{ color: 'var(--accent-green)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-green-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-green)'}
            >
              {isLogin ? 'Register for free' : 'Sign in'}
            </button>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-5 mt-8">
            {['🔐 Secure', '⚡ Fast', '🎯 Free'].map((badge) => (
              <span key={badge} className="text-xs" style={{ color: 'var(--text-muted)' }}>{badge}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        input::placeholder { color: var(--text-muted); }
      `}</style>
    </div>
  );
}
