import { authClient } from '@/lib/auth-client';
import { useState } from 'react';

type Props = {
  onSubmit: (signUp: boolean) => void;
};

export default function LoginForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message!);
      return;
    }
    // Redirect after successful sign in
    location.href = browser.runtime.getURL('/host.html')
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm text-right">
      <h1 className="text-4xl btn-primary font-semibold text-center pb-2">Sign In</h1>

      <div className="space-y-1 pt-8">
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none right-2"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (

            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (

            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full rounded-xl text-lg shadow-lg shadow-blue-200"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <p className="pt-4 text-[15px] text-gray-600 text-center leading-relaxed px-2">
        Don't have an account yet?
        <button
         onClick={() => onSubmit(true)}
          disabled={loading}
          className="btn btn-soft w-full rounded-xl text-lg shadow-lg shadow-blue-200"
        >
          Sign Up!
        </button>
      </p>

    </form>
  );
}