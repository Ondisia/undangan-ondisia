import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Music, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadImage, deleteImage } from '@/lib/supabaseClient';

interface MusicUploadProps {
    bucket: string;
    path: string;
    currentMusic?: string;
    onUpload: (url: string) => void;
    onDelete?: () => void;
    label?: string;
}

export const MusicUpload = ({
    bucket,
    path,
    currentMusic,
    onUpload,
    onDelete,
    label = "Upload Musik"
}: MusicUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio] = useState(new Audio(currentMusic));

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) { // 10MB limit for audio
            toast.error('Ukuran musik maksimal 10MB');
            return;
        }

        setUploading(true);
        try {
            // Reuse uploadImage since it handles file upload generically
            const publicUrl = await uploadImage(bucket, file, path);
            onUpload(publicUrl);
            toast.success('Musik berhasil diupload!');
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error('Gagal upload musik: ' + error.message);
        } finally {
            setUploading(false);
        }
    }, [bucket, path, onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        maxFiles: 1,
        disabled: uploading
    });

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentMusic) return;

        if (window.confirm('Hapus musik ini?')) {
            try {
                await deleteImage(bucket, currentMusic); // Reuse deleteImage
                if (onDelete) onDelete();
                toast.success('Musik dihapus');
                // Stop audio if playing
                audio.pause();
                setIsPlaying(false);
            } catch (error) {
                toast.error('Gagal menghapus musik');
            }
        }
    };

    const togglePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentMusic) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.src = currentMusic;
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer hover:border-gold/50 hover:bg-gold/5 ${isDragActive ? 'border-gold bg-gold/10' : 'border-border'
                    } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />

                {currentMusic ? (
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Music className="h-5 w-5 text-gold" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-foreground">Musik Terpasang</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {currentMusic.split('/').pop()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full"
                                onClick={togglePreview}
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8 rounded-full"
                                onClick={handleRemove}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        {uploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-gold mb-3" />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-3">
                                <Music className="h-6 w-6 text-gold" />
                            </div>
                        )}
                        <p className="text-sm font-medium text-foreground">
                            {uploading ? 'Mengupload...' : label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Drag & drop audio file (MP3, WAV) (Max 10MB)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
