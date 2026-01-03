import { useState, useEffect } from 'react';
import { UserProfile, getAllUsers, toggleUserStatus, assignThemeToUser, getThemes, Theme } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AdminUserManager() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [assigningTheme, setAssigningTheme] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, themesData] = await Promise.all([
                getAllUsers(),
                getThemes()
            ]);
            setUsers(usersData);
            setThemes(themesData);
        } catch (error) {
            toast.error('Gagal memuat data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await toggleUserStatus(userId, !currentStatus);
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
            toast.success(`User berhasil di-${!currentStatus ? 'aktifkan' : 'non-aktifkan'}`);
        } catch (error) {
            toast.error('Gagal mengubah status user');
        }
    };

    const handleAssignTheme = async (userId: string, themeId: string | null) => {
        try {
            await assignThemeToUser(userId, themeId);
            setUsers(users.map(u => u.id === userId ? { ...u, assigned_theme_id: themeId } : u));
            toast.success('Tema berhasil ditugaskan ke user');
            setAssigningTheme(null);
        } catch (error) {
            toast.error('Gagal menugaskan tema');
            console.error(error);
        }
    };

    const getThemeName = (themeId: string | null | undefined) => {
        if (!themeId) return '-';
        const theme = themes.find(t => t.id === themeId);
        return theme ? theme.name : '-';
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-display text-gold">Kelola User</h2>
                    <p className="text-muted-foreground">Pantau dan kelola akses pengguna serta tentukan tema mereka.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari user..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Tema yang Ditugaskan</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Memuat data...</TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">Tidak ada user ditemukan</TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.full_name || 'Tanpa Nama'}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        {assigningTheme === user.id ? (
                                            <div className="flex gap-2 items-center min-w-[250px]">
                                                <Select 
                                                    value={user.assigned_theme_id || ''}
                                                    onValueChange={(value) => handleAssignTheme(user.id, value || null)}
                                                >
                                                    <SelectTrigger className="h-8 text-sm">
                                                        <SelectValue placeholder="Pilih tema..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">Tidak ada (Bebas pilih)</SelectItem>
                                                        {themes.map(theme => (
                                                            <SelectItem key={theme.id} value={theme.id}>
                                                                {theme.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setAssigningTheme(null)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {getThemeName(user.assigned_theme_id)}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setAssigningTheme(user.id)}
                                                    className="h-8 px-2 text-xs"
                                                >
                                                    Ubah
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-sm">{user.is_active ? 'Aktif' : 'Non-Aktif'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Label htmlFor={`switch-${user.id}`} className="text-xs text-muted-foreground hidden sm:inline-block">
                                                {user.is_active ? 'Matikan' : 'Hidupkan'}
                                            </Label>
                                            <Switch
                                                id={`switch-${user.id}`}
                                                checked={user.is_active}
                                                onCheckedChange={() => handleToggleStatus(user.id, user.is_active)}
                                                disabled={user.role === 'super_admin'}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
