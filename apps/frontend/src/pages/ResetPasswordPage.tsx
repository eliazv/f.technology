/**
 * Reset Password Page
 * Handles password reset with token
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordFormData } from '@ftechnology/shared';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/ui/Toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (token) {
      setValue('token', token);
    }
  }, [token, setValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.resetPassword(data);
      setIsSuccess(true);
      toast.success('Password reimpostata con successo!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Errore durante il reset della password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Link non valido" subtitle="Il link per il reset della password non è valido">
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Il link per il reset della password non è valido o è scaduto.
            </p>
            <p className="text-sm text-muted-foreground">Richiedi un nuovo link di reset.</p>
          </div>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/forgot-password">Richiedi nuovo link</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/login">Torna al login</Link>
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password reimpostata!"
        subtitle="La tua password è stata reimpostata con successo"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Ora puoi accedere con la tua nuova password.
            </p>
            <p className="text-sm text-muted-foreground">
              Verrai reindirizzato al login tra pochi secondi...
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/login">Vai al login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reimposta password"
      subtitle="Inserisci la tua nuova password"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Nuova Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register('password')}
              error={errors.password?.message}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Almeno 8 caratteri, una maiuscola e un numero
          </p>
        </div>

        {/* Confirm password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Conferma Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Reimposta password
        </Button>

        {/* Back to login */}
        <p className="text-center text-sm text-muted-foreground">
          Ricordi la tua password?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Torna al login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
