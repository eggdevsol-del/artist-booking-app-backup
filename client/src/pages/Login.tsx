import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      // Store JWT token in localStorage
      localStorage.setItem("authToken", data.token);
      
      // Store user info
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success("Welcome back!");
      
      // Redirect based on onboarding status
      if (!data.user.hasCompletedOnboarding) {
        setLocation("/role-selection");
      } else {
        setLocation("/conversations");
      }
      
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Login failed. Please try again.");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="glass-container max-w-md w-full fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="glass-card w-20 h-20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[var(--accent-blue)]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
            Sign in to continue your journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input"
              disabled={isLoading}
              required
            />
          </div>
          
          {/* Password Input */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pr-12"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="glass-button-primary w-full h-14 text-lg font-semibold flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="glass-divider my-6" />

        {/* Sign Up Link */}
        <div className="text-center mb-4">
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
            Don't have an account?
          </p>
          <button
            type="button"
            className="glass-button w-full h-12"
            onClick={() => setLocation("/signup")}
            disabled={isLoading}
          >
            Create Account
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-center">
          <button
            type="button"
            className="text-[var(--accent-blue)] text-sm font-medium hover:underline"
            onClick={() => setLocation("/forgot-password")}
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
