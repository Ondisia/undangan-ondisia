import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Heart, Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Password tidak cocok!');
            return;
        }

        if (password.length < 6) {
            toast.error('Password minimal 6 karakter!');
            return;
        }

        setLoading(true);

        try {
            const { session } = await signUp(email, password, fullName);

            if (session) {
                // User is auto-logged in (Email confirmation disabled)
                toast.success('Registrasi berhasil!');
                navigate('/dashboard');
            } else {
                // Email confirmation required
                setSuccess(true);
                toast.success('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registrasi gagal. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Registrasi Berhasil!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Kami telah mengirim email verifikasi ke <strong>{email}</strong>.
                        Silakan cek inbox Anda dan klik link verifikasi.
                    </p>
                    <Button onClick={() => navigate('/login')} variant="gold">
                        Kembali ke Login
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4"
                    >
                        <Heart className="w-8 h-8 text-gold fill-gold" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Buat Akun Baru</h1>
                    <p className="text-muted-foreground">
                        Mulai buat undangan digital Anda sekarang
                    </p>
                </div>

                <Card className="shadow-elegant border-gold/20">
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>
                            Isi data diri Anda untuk membuat akun
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nama Lengkap</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nama@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimal 6 karakter"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Ulangi password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full"
                                variant="gold"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mendaftar...
                                    </>
                                ) : (
                                    'Daftar Sekarang'
                                )}
                            </Button>

                            <p className="text-sm text-center text-muted-foreground">
                                Sudah punya akun?{' '}
                                <Link to="/login" className="text-gold hover:underline font-medium">
                                    Login di sini
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Dengan mendaftar, Anda menyetujui{' '}
                    <a href="#" className="text-gold hover:underline">
                        Syarat & Ketentuan
                    </a>{' '}
                    kami
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
