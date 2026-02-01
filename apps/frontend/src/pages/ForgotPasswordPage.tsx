/**
 * Forgot Password Page
 * Handles password reset request
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@ftechnology/shared';
import { authService } from '@/services/auth.service';
import { useToast } from '@/components/ui/Toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data);
      setIsSubmitted(true);
      toast.success('Email di reset inviata!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore durante l'invio dell'email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Controlla la tua email"
        subtitle={`Abbiamo inviato un link per reimpostare la password a ${getValues('email')}`}
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Se l'email è associata a un account, riceverai un link per reimpostare la password.
            </p>
            <p className="text-sm text-muted-foreground">Controlla anche la cartella spam.</p>
          </div>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link to="/login">Torna al login</Link>
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setIsSubmitted(false)}>
              Non hai ricevuto l'email? Riprova
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Password dimenticata?"
      subtitle="Inserisci la tua email per ricevere un link di reset"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="nome@esempio.com"
              className="pl-10"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
        </div>

        {/* Submit button */}
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Invia link di reset
        </Button>

        {/* Back to login */}
        <Button variant="ghost" asChild className="w-full">
          <Link to="/login" className="flex items-center justify-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna al login
          </Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
