/**
 * Auth Layout Component
 * Wrapper for authentication pages (login, register)
 */

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/Button";
import { Sun, Moon } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div>
            <h1 className="text-3xl font-bold">FTechnology</h1>
          </div>
          <div>
            <blockquote className="space-y-2">
              <p className="text-lg">
                "La tecnologia al servizio delle tue idee. Sicurezza e
                innovazione per il tuo business."
              </p>
              <footer className="text-sm opacity-80">— Team FTechnology</footer>
            </blockquote>
          </div>
          <div className="flex gap-4 text-sm opacity-80">
            <span>© 2024 FTechnology</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md space-y-6"
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-2xl font-bold text-primary">FTechnology</h1>
            </div>

            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
