import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AdminSettings() {
    const { user, profile } = useAuth();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold font-display text-gray-900">Pengaturan Admin</h2>
                <p className="text-muted-foreground mt-1">Kelola akun administrator dan konfigurasi sistem.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Admin</CardTitle>
                        <CardDescription>Informasi akun Anda saat ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input value={user?.email || ''} disabled className="bg-muted" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <Input value={profile?.role || 'Super Admin'} disabled className="bg-muted" />
                        </div>
                        {/* Password change functionality could go here */}
                        <Button variant="outline" disabled>Ubah Password (Segera Hadir)</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Sistem</CardTitle>
                        <CardDescription>Detail teknis aplikasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Versi Aplikasi</span>
                            <span className="font-medium">v1.2.0 (Admin Release)</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Environment</span>
                            <span className="font-medium">Production (Supabase)</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Status Database</span>
                            <span className="font-medium text-green-600">Connected</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
