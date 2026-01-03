import { useState, useEffect } from 'react';
import { Theme, getThemes, createTheme, updateTheme, deleteTheme } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export function AdminThemeManager() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<Partial<Theme>>({});

    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        setLoading(true);
        try {
            const data = await getThemes();
            setThemes(data);
        } catch (error) {
            toast.error('Gagal memuat tema');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (currentTheme.id) {
                await updateTheme(currentTheme.id, currentTheme);
                toast.success('Tema berhasil diperbarui');
            } else {
                await createTheme(currentTheme as any);
                toast.success('Tema berhasil dibuat');
            }
            setIsEditing(false);
            setCurrentTheme({});
            loadThemes();
        } catch (error) {
            toast.error('Gagal menyimpan tema');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus tema ini?')) return;
        try {
            await deleteTheme(id);
            toast.success('Tema berhasil dihapus');
            loadThemes();
        } catch (error) {
            toast.error('Gagal menghapus tema');
        }
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-display">{currentTheme.id ? 'Edit Tema' : 'Tambah Tema Baru'}</h2>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}><X className="mr-2 h-4 w-4" /> Batal</Button>
                </div>

                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <div className="grid gap-2">
                            <Label>Nama Tema</Label>
                            <Input
                                value={currentTheme.name || ''}
                                onChange={e => setCurrentTheme({ ...currentTheme, name: e.target.value })}
                                placeholder="Contoh: Elegant Gold"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Kategori</Label>
                            <Input
                                value={currentTheme.category || ''}
                                onChange={e => setCurrentTheme({ ...currentTheme, category: e.target.value })}
                                placeholder="Contoh: Minimalist, Luxury"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>URL Thumbnail</Label>
                            <Input
                                value={currentTheme.thumbnail_url || ''}
                                onChange={e => setCurrentTheme({ ...currentTheme, thumbnail_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Deskripsi</Label>
                            <Textarea
                                value={currentTheme.description || ''}
                                onChange={e => setCurrentTheme({ ...currentTheme, description: e.target.value })}
                                placeholder="Deskripsi singkat tema..."
                            />
                        </div>
                        <Button onClick={handleSave} className="w-full bg-gold text-white hover:bg-gold-dark mt-4">
                            <Save className="mr-2 h-4 w-4" /> Simpan Tema
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-display text-gold">Kelola Tema</h2>
                    <p className="text-muted-foreground">Tambah atau edit template undangan.</p>
                </div>
                <Button onClick={() => { setCurrentTheme({}); setIsEditing(true); }} className="bg-gold text-white hover:bg-gold-dark">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Tema
                </Button>
            </div>

            {loading ? (
                <p>Memuat...</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {themes.map(theme => (
                        <Card key={theme.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video w-full bg-gray-100 relative">
                                {theme.thumbnail_url ? (
                                    <img src={theme.thumbnail_url} alt={theme.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                                {!theme.is_active && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">Non-Aktif</div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-lg">{theme.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{theme.description}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setCurrentTheme(theme); setIsEditing(true); }}>
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(theme.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
