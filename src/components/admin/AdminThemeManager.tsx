import { useState, useEffect } from 'react';
import { Theme, getThemes, createTheme, updateTheme, deleteTheme, uploadThemeThumbnail } from '@/services/adminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function AdminThemeManager() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<Partial<Theme>>({});
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to storage
        setUploading(true);
        try {
            const publicUrl = await uploadThemeThumbnail(file);
            setCurrentTheme({ ...currentTheme, thumbnail_url: publicUrl });
            toast.success('Gambar berhasil diunggah');
        } catch (error) {
            toast.error('Gagal mengunggah gambar');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!currentTheme.name || !currentTheme.slug) {
            toast.error('Nama dan Slug tema wajib diisi');
            return;
        }

        try {
            // Clean the object to only send defined fields
            const themeToSave: any = {
                name: currentTheme.name,
                slug: currentTheme.slug,
                description: currentTheme.description || '',
                category: currentTheme.category || '',
                thumbnail_url: currentTheme.thumbnail_url || '',
                is_active: currentTheme.is_active ?? true
            };

            console.log('🔵 Attempting to Save Theme:', themeToSave);

            if (currentTheme.id) {
                console.log('🔵 Updating existing theme ID:', currentTheme.id);
                await updateTheme(currentTheme.id, themeToSave);
                toast.success('Tema berhasil diperbarui');
            } else {
                console.log('🔵 Creating new theme');
                await createTheme(themeToSave);
                toast.success('Tema berhasil dibuat');
            }
            setIsEditing(false);
            setCurrentTheme({});
            setPreviewImage(null);
            loadThemes();
        } catch (error: any) {
            console.error('❌ Error saving theme:', error);
            const errorMessage = error?.message || 'Error tidak diketahui';
            toast.error(`Gagal menyimpan tema: ${errorMessage}`);
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

    const handlePreview = (themeId: string) => {
        // We can create a special preview route or just use the invitation route with a mock ID
        // For now, let's open the invitation page with a flag
        window.open(`/invitation/preview?theme=${themeId}`, '_blank');
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-display text-gold">{currentTheme.id ? 'Edit Tema' : 'Tambah Tema Baru'}</h2>
                    <Button variant="ghost" onClick={() => { setIsEditing(false); setPreviewImage(null); }}>
                        <X className="mr-2 h-4 w-4" /> Batal
                    </Button>
                </div>

                <Card className="border-gold/20 shadow-elegant">
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="theme-name">Nama Tema</Label>
                                    <Input
                                        id="theme-name"
                                        value={currentTheme.name || ''}
                                        onChange={e => setCurrentTheme({ ...currentTheme, name: e.target.value })}
                                        placeholder="Contoh: Elegant Gold"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="theme-slug">Slug Layout (ID Komponen)</Label>
                                    <Input
                                        id="theme-slug"
                                        value={currentTheme.slug || ''}
                                        onChange={e => setCurrentTheme({ ...currentTheme, slug: e.target.value })}
                                        placeholder="Contoh: elegant-gold"
                                    />
                                    <div className="bg-gold/5 border border-gold/10 rounded-lg p-3 space-y-2 mt-1">
                                        <p className="text-[10px] font-bold text-gold uppercase tracking-wider">Tersedia di Sistem:</p>
                                        <div className="flex flex-wrap gap-2">
                                            <code className="text-[10px] bg-white px-2 py-0.5 rounded border border-gold/20 text-muted-foreground">elegant-gold</code>
                                            <code className="text-[10px] bg-white px-2 py-0.5 rounded border border-gold/20 text-muted-foreground">modern-minimalist</code>
                                            <code className="text-[10px] bg-white px-2 py-0.5 rounded border border-gold/20 text-muted-foreground">rustic-floral</code>
                                        </div>
                                        <p className="text-[9px] text-muted-foreground italic leading-tight">
                                            *Pastikan slug sama persis untuk menghubungkan tampilan tema.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="theme-category">Kategori</Label>
                                    <Input
                                        id="theme-category"
                                        value={currentTheme.category || ''}
                                        onChange={e => setCurrentTheme({ ...currentTheme, category: e.target.value })}
                                        placeholder="Contoh: Minimalist, Luxury"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Thumbnail Desain</Label>
                                <div 
                                    className="border-2 border-dashed border-gold/20 rounded-xl aspect-video flex flex-col items-center justify-center relative overflow-hidden bg-muted/30 group"
                                    onClick={() => document.getElementById('theme-thumbnail-input')?.click()}
                                >
                                    {previewImage || currentTheme.thumbnail_url ? (
                                        <>
                                            <img 
                                                src={previewImage || currentTheme.thumbnail_url} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-sm font-medium">Ganti Gambar</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="h-10 w-10 text-gold/40 mb-2" />
                                            <p className="text-sm text-muted-foreground">Klik untuk upload thumbnail</p>
                                        </>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-gold" />
                                        </div>
                                    )}
                                </div>
                                <input 
                                    id="theme-thumbnail-input"
                                    type="file" 
                                    accept="image/*"
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="theme-desc">Deskripsi</Label>
                            <Textarea
                                id="theme-desc"
                                value={currentTheme.description || ''}
                                onChange={e => setCurrentTheme({ ...currentTheme, description: e.target.value })}
                                placeholder="Jelaskan karakteristik tema ini..."
                                rows={3}
                            />
                        </div>

                        <Button 
                            onClick={handleSave} 
                            disabled={uploading}
                            className="w-full bg-gold text-white hover:bg-gold-dark mt-4"
                        >
                            {uploading ? 'Memproses Gambar...' : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Simpan Tema
                                </>
                            )}
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
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="flex-1 border-gold/20 hover:bg-gold/5" 
                                        onClick={() => { setCurrentTheme(theme); setIsEditing(true); }}
                                    >
                                        <Edit className="h-4 w-4 mr-1 text-gold" /> Edit
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="aspect-square p-0 border-gold/20 hover:bg-gold/5" 
                                        onClick={() => handlePreview(theme.id)}
                                        title="Preview Tema"
                                    >
                                        <Eye className="h-4 w-4 text-gold" />
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="destructive" 
                                        onClick={() => handleDelete(theme.id)}
                                        className="aspect-square p-0"
                                    >
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
