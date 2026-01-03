import { Guest, Theme, InvitationSettings } from '@/types/invitation';

export const mockThemes: Theme[] = [
  {
    id: '1',
    name: 'Elegant Gold',
    description: 'Tema mewah dengan sentuhan emas yang elegan',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    category: 'elegant',
    isActive: true,
  },
  {
    id: '2',
    name: 'Garden Romance',
    description: 'Tema romantis dengan nuansa taman bunga',
    thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop',
    category: 'floral',
  },
  {
    id: '3',
    name: 'Modern Minimalist',
    description: 'Desain bersih dan modern untuk pasangan kontemporer',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    category: 'minimalist',
  },
  {
    id: '4',
    name: 'Rustic Charm',
    description: 'Tema hangat dengan nuansa pedesaan yang menawan',
    thumbnail: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400&h=300&fit=crop',
    category: 'rustic',
  },
  {
    id: '5',
    name: 'Royal Blue',
    description: 'Tema kerajaan dengan warna biru yang megah',
    thumbnail: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&h=300&fit=crop',
    category: 'elegant',
  },
  {
    id: '6',
    name: 'Sunset Blush',
    description: 'Gradasi warna sunset yang romantis',
    thumbnail: 'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=400&h=300&fit=crop',
    category: 'modern',
  },
];

export const mockGuests: Guest[] = [];

export const previewSettings: InvitationSettings = {
  eventName: 'The Wedding of Budi & Shanti',
  selectedThemeId: '1',
  openingQuote: '"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang."',
  closingMessage: 'Terima kasih atas doa restu Anda.',
  groomName: 'Budi',
  groomFullName: 'Budi Santoso, S.T.',
  groomDescription: 'Putra pertama dari Bapak Ahmad & Ibu Siti',
  groomFatherName: 'Ahmad',
  groomMotherName: 'Siti',
  groomPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  brideName: 'Shanti',
  brideFullName: 'Shanti Lestari, S.Pd.',
  brideDescription: 'Putri bungsu dari Bapak Hartono & Ibu Aminah',
  brideFatherName: 'Hartono',
  brideMotherName: 'Aminah',
  bridePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
  akadDate: '2026-05-20',
  akadStartTime: '08:00',
  akadEndTime: '10:00',
  akadLocation: 'Masjid Agung Al-Azhar, Jakarta',
  resepsiDate: '2026-05-20',
  resepsiStartTime: '11:00',
  resepsiEndTime: '13:00',
  resepsiLocation: 'Balai Kartini, Jakarta Selatan',
  mapsUrl: 'https://goo.gl/maps/example',
  musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  galleryPhotos: [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800'
  ],
  loveStory: [
    { title: 'Pertama Bertemu', date: '2020', description: 'Kami bertemu pertama kali di sebuah acara seminar kampus.', icon: '🎓' },
    { title: 'Menjalin Hubungan', date: '2022', description: 'Setelah sekian lama berteman, kami memutuskan untuk berkomitmen.', icon: '❤️' }
  ],
  bankAccounts: [
    { bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'Budi Santoso' },
    { bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'Shanti Lestari' }
  ],
  eventDate: '2026-05-20',
  eventTime: '08:00',
  eventLocation: 'Masjid Agung Al-Azhar, Jakarta'
};
