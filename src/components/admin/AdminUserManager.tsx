import { useState, useEffect } from 'react';
import { UserProfile, getAllUsers, toggleUserStatus, assignThemeToUser, getThemes, Theme } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { adminCreateUser, deleteUser } from '@/services/adminService';
import { UserPlus, Search, X, Loader2, Trash2 } from 'lucide-react';

export function AdminUserManager() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [assigningTheme, setAssigningTheme] = useState<string | null>(null);
    
    // Create User Form State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        themeId: ''
    });

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

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await adminCreateUser(formData);
            toast.success('User berhasil dibuat!');
            setIsAddUserOpen(false);
            setFormData({ fullName: '', email: '', password: '', themeId: '' });
            loadData(); // Refresh list
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Gagal membuat user');
        } finally {
            setIsCreating(false);
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

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini secara PERMANEN? Semua data undangan user ini akan ikut terhapus.')) return;
        
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            toast.success('User berhasil dihapus secara permanen');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Gagal menghapus user');
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
                
                <div className="flex items-center gap-3">
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button variant="gold" className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                <span className="hidden sm:inline">Tambah Customer</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Tambah Customer Baru</DialogTitle>
                                <DialogDescription>
                                    Buat akun customer baru dan tentukan tema undangan mereka.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="Contoh: Budi & Shanti" 
                                        required 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="email@pelanggan.com" 
                                        required 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        placeholder="Min. 6 karakter" 
                                        required 
                                        minLength={6}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Pilih Tema (Sesuai Pesanan)</Label>
                                    <Select 
                                        value={formData.themeId}
                                        onValueChange={(value) => setFormData({...formData, themeId: value})}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tema persembahan..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {themes.map(theme => (
                                                <SelectItem key={theme.id} value={theme.id}>
                                                    {theme.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" className="w-full" variant="gold" disabled={isCreating}>
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : 'Buat Akun & Tugaskan Tema'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

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
                                        <div className="flex justify-end items-center gap-4">
                                            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
                                                <Label htmlFor={`switch-${user.id}`} className="text-xs text-muted-foreground hidden sm:inline-block">
                                                    {user.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </Label>
                                                <Switch
                                                    id={`switch-${user.id}`}
                                                    checked={user.is_active}
                                                    onCheckedChange={() => handleToggleStatus(user.id, user.is_active)}
                                                    disabled={user.role === 'super_admin'}
                                                />
                                            </div>
                                            
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={user.role === 'super_admin'}
                                                title="Hapus User Permanen"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
