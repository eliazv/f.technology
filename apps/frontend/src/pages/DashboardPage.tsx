/**
 * Dashboard Page
 * User's personal dashboard with profile management
 */

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Edit2,
  Save,
  X,
  Clock,
  Monitor,
  MapPin,
  Camera,
  Trash2,
} from 'lucide-react';
import {
  updateUserSchema,
  UpdateUserFormData,
  LoginHistory,
  formatDateTime,
  getRelativeTime,
  calculateAge,
} from '@ftechnology/shared';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { userService } from '@/services/user.service';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Separator } from '@/components/ui/Separator';
import { Spinner } from '@/components/ui/Spinner';

export function DashboardPage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dateOfBirth: user?.dateOfBirth || '',
    },
  });

  // Fetch login history on mount
  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const history = await userService.getLoginHistory(5);
        setLoginHistory(history);
      } catch (error) {
        console.error('Error fetching login history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchLoginHistory();
  }, []);

  // Reset form when user changes or editing is cancelled
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
      });
    }
  }, [user, reset, isEditing]);

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const handleProfileUpdate = async (data: UpdateUserFormData) => {
    setIsLoading(true);
    try {
      const updatedUser = await userService.updateProfile(data);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profilo aggiornato con successo!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore durante l'aggiornamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'immagine non può superare i 5MB");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      toast.error('Formato immagine non supportato');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { avatarUrl } = await userService.uploadAvatar(file);
      if (user) {
        updateUser({ ...user, avatarUrl });
      }
      toast.success('Avatar aggiornato con successo!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore durante il caricamento');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarRemove = async () => {
    setIsUploadingAvatar(true);
    try {
      const updatedUser = await userService.removeAvatar();
      updateUser(updatedUser);
      toast.success('Avatar rimosso con successo!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Errore durante la rimozione');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const parseUserAgent = (userAgent: string) => {
    // Simple parsing - in production use a proper UA parser
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Browser';
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold">Ciao, {user?.firstName}! 👋</h1>
          <p className="text-muted-foreground mt-1">Benvenuto nella tua dashboard personale</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card - Left sidebar on large screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.firstName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <Spinner size="sm" className="text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <CardTitle>
                    {user?.firstName} {user?.lastName}
                  </CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar actions */}
                <div className="flex justify-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Cambia
                  </Button>
                  {user?.avatarUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarRemove}
                      disabled={isUploadingAvatar}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Rimuovi
                    </Button>
                  )}
                </div>

                <Separator />

                {/* User info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {user?.dateOfBirth && (
                        <>
                          {new Date(user.dateOfBirth).toLocaleDateString('it-IT')}
                          <span className="text-muted-foreground ml-1">
                            ({calculateAge(user.dateOfBirth)} anni)
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Membro dal{' '}
                      {user?.createdAt && new Date(user.createdAt).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informazioni Profilo
                    </CardTitle>
                    <CardDescription>Gestisci i tuoi dati personali</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Modifica
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          disabled={!isEditing}
                          error={errors.firstName?.message}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Cognome</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          disabled={!isEditing}
                          error={errors.lastName?.message}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        L'email non può essere modificata
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Data di nascita</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...register('dateOfBirth')}
                        disabled={!isEditing}
                        error={errors.dateOfBirth?.message}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" isLoading={isLoading} disabled={!isDirty}>
                          <Save className="mr-2 h-4 w-4" />
                          Salva modifiche
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="mr-2 h-4 w-4" />
                          Annulla
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Login History Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Cronologia Accessi
                  </CardTitle>
                  <CardDescription>Ultimi 5 accessi al tuo account</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : loginHistory.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nessun accesso registrato
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {loginHistory.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.1 }}
                          className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="p-2 rounded-full bg-primary/10">
                            <Monitor className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{parseUserAgent(entry.userAgent)}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                IP: {entry.ipAddress}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getRelativeTime(entry.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(entry.createdAt)}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
