import { useEffect, useState } from 'react';
import { getDashboardStats } from '@/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Palette, Activity, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalThemes: 0, activeThemes: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to load stats:', error);
                toast.error('Gagal memuat statistik dashboard');
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const statItems = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            description: 'Pengguna terdaftar',
            color: 'text-blue-500',
        },
        {
            title: 'Total Tema',
            value: stats.totalThemes,
            icon: Palette,
            description: 'Template tersedia',
            color: 'text-purple-500',
        },
        {
            title: 'Tema Aktif',
            value: stats.activeThemes,
            icon: Activity,
            description: 'Siap digunakan',
            color: 'text-green-500',
        },
        {
            title: 'Status Sistem',
            value: 'Online',
            icon: ShieldCheck,
            description: 'Semua layanan normal',
            color: 'text-gold',
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold font-display text-gray-900">Admin Dashboard</h2>
                <p className="text-muted-foreground mt-1">Ringkasan aktivitas dan status sistem.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {item.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${item.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {loading ? '...' : item.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Placeholder for future charts or activity logs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Log aktivitas akan segera hadir.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">Pintasan cepat untuk admin.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
