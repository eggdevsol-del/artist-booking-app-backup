import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Calendar, MessageCircle, Sparkles, Users, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="glass-card p-6">
          <div className="animate-pulse text-[var(--accent-blue)] text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-nav px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10 rounded-xl glass-avatar" />
            )}
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-10 fade-in">
          {/* Logo & Title */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 glass-card">
              <Sparkles className="w-12 h-12 text-[var(--accent-teal)]" />
            </div>
            <div>
              <h2 className="text-5xl font-bold text-gradient mb-3">
                Welcome to {APP_TITLE}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xl">
                Connect, book, and manage appointments seamlessly
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4">
            <div className="glass-card slide-up">
              <div className="flex items-start gap-4">
                <div className="glass-card p-3 flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-[var(--accent-blue)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Real-time Chat
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Instant messaging with clients for bookings and consultations
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start gap-4">
                <div className="glass-card p-3 flex-shrink-0">
                  <Calendar className="w-6 h-6 text-[var(--accent-purple)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Smart Calendar
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Easy-to-read calendar with week and day views for appointments
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-4">
                <div className="glass-card p-3 flex-shrink-0">
                  <Users className="w-6 h-6 text-[var(--accent-pink)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    For Artists & Clients
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Tailored experience for both service providers and customers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => setLocation("/login")}
              className="glass-button h-14 text-lg font-semibold flex items-center justify-center gap-2"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLocation("/signup")}
              className="glass-button-primary h-14 text-lg font-semibold flex items-center justify-center gap-2"
            >
              Create Account
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
