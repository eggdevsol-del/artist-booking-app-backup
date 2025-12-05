import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"artist" | "client">("artist");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      // Store JWT token in localStorage
      localStorage.setItem("authToken", data.token);
      
      // Store user info
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success("Account created successfully!");
      
      // Redirect based on role
      setLocation(role === "artist" ? "/conversations" : "/client-dashboard");
      
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Please try again.");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    registerMutation.mutate({ name, email, password, role });
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="glass-container max-w-md w-full fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="glass-card w-20 h-20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-[var(--accent-purple)]" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)' }} className="text-lg">
            Join us to book appointments and connect
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
              disabled={isLoading}
              required
            />
          </div>

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
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input pr-12"
                disabled={isLoading}
                required
                minLength={8}
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

          {/* Confirm Password Input */}
          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-semibold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="glass-input pr-12"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label 
              className="block text-sm font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("artist")}
                className={`glass-card p-5 transition-all ${
                  role === "artist" ? "ring-2 ring-[var(--accent-blue)]" : ""
                }`}
                disabled={isLoading}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🎨</div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Artist</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Manage bookings
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`glass-card p-5 transition-all ${
                  role === "client" ? "ring-2 ring-[var(--accent-blue)]" : ""
                }`}
                disabled={isLoading}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Client</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Book appointments
                  </div>
                </div>
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="glass-divider my-6" />

        {/* Login Link */}
        <div className="text-center">
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-3">
            Already have an account?
          </p>
          <button
            type="button"
            className="glass-button w-full h-12"
            onClick={() => setLocation("/login")}
            disabled={isLoading}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
