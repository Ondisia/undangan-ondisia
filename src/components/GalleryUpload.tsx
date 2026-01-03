import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/supabaseClient';

interface GalleryUploadProps {
    bucket: string;
    pathPrefix: string;
    photos: string[];
    onPhotosChange: (urls: string[]) => void;
}

export const GalleryUpload = ({
    bucket,
    pathPrefix,
    photos = [],
    onPhotosChange
}: GalleryUploadProps) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setUploading(true);
        const newPhotos = [...photos];
        let successCount = 0;

        try {
            for (const file of acceptedFiles) {
                if (file.size > 2 * 1024 * 1024) {
                    toast.error(`File ${file.name} terlalu besar (Max 2MB)`);
                    continue;
                }

                const path = `${pathPrefix}/${Date.now()}-${file.name}`;
                const publicUrl = await uploadImage(bucket, file, path);
                newPhotos.push(publicUrl);
                successCount++;
            }

            onPhotosChange(newPhotos);

            if (successCount > 0) {
                toast.success(`${successCount} foto berhasil ditambahkan ke galeri`);
            }
        } catch (error: any) {
            console.error('Gallery upload failed:', error);
            toast.error('Gagal upload beberapa foto');
        } finally {
            setUploading(false);
        }
    }, [bucket, pathPrefix, photos, onPhotosChange]);

    const removePhoto = (indexToRemove: number) => {
        const newPhotos = photos.filter((_, index) => index !== indexToRemove);
        onPhotosChange(newPhotos);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        multiple: true,
        disabled: uploading
    });

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer hover:border-gold/50 hover:bg-gold/5 text-center ${isDragActive ? 'border-gold bg-gold/10' : 'border-border'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-gold mx-auto mb-4" />
                ) : (
                    <div className="h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                        <Upload className="h-7 w-7 text-gold" />
                    </div>
                )}

                <h3 className="text-lg font-semibold mb-1">
                    {uploading ? 'Sedang mengupload...' : 'Upload Foto Galeri'}
                </h3>
                <p className="text-sm text-muted-foreground">
                    Drag & drop banyak foto sekaligus, atau klik untuk memilih
                </p>
            </div>

            {/* Grid Preview */}
            {photos.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            {photos.length} Foto Tersimpan
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="group relative aspect-square rounded-lg overflow-hidden border border-border shadow-sm">
                                <img
                                    src={photo}
                                    alt={`Gallery ${index}`}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-9 w-9 rounded-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removePhoto(index);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
