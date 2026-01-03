import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadImage, deleteImage } from '@/lib/supabaseClient';

interface ImageUploadProps {
    bucket: string;
    path: string;
    currentImage?: string;
    onUpload: (url: string) => void;
    onDelete?: () => void;
    label?: string;
}

export const ImageUpload = ({
    bucket,
    path,
    currentImage,
    onUpload,
    onDelete,
    label = "Upload Foto"
}: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('Ukuran foto maksimal 2MB');
            return;
        }

        setUploading(true);
        try {
            // If there's an existing image, try to delete it first (optional)
            if (currentImage) {
                // await deleteImage(bucket, currentImage);
            }

            const publicUrl = await uploadImage(bucket, file, path);
            onUpload(publicUrl);
            toast.success('Foto berhasil diupload!');
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error('Gagal upload foto: ' + error.message);
        } finally {
            setUploading(false);
        }
    }, [bucket, path, currentImage, onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
        disabled: uploading
    });

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentImage) return;

        if (window.confirm('Hapus foto ini?')) {
            try {
                await deleteImage(bucket, currentImage); // Clean up from storage
                if (onDelete) onDelete();
                toast.success('Foto dihapus');
            } catch (error) {
                toast.error('Gagal menghapus foto');
            }
        }
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer hover:border-gold/50 hover:bg-gold/5 ${isDragActive ? 'border-gold bg-gold/10' : 'border-border'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />

                {currentImage ? (
                    <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-lg overflow-hidden shadow-md">
                        <img
                            src={currentImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        {/* Always visible delete button for mobile/touch */}
                        <div className="absolute top-2 right-2 md:hidden">
                            <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8 rounded-full"
                                onClick={handleRemove}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {uploading && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        {uploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-gold mb-3" />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                                <Upload className="h-6 w-6 text-gold" />
                            </div>
                        )}
                        <p className="text-sm font-medium text-foreground">
                            {uploading ? 'Mengupload...' : label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Drag & drop atau klik untuk pilih (Max 2MB)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
