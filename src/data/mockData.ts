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

// Empty mock settings as we now use Supabase
// Exported just in case of any lingering imports, but should be unused
export const mockSettings: InvitationSettings = {
  eventName: '',
  selectedThemeId: '1',
  groomName: '',
  groomFullName: '',
  groomDescription: '',
  groomFatherName: '',
  groomMotherName: '',
  brideName: '',
  brideFullName: '',
  brideDescription: '',
  brideFatherName: '',
  brideMotherName: '',
  akadDate: '',
  akadStartTime: '',
  akadEndTime: '',
  akadLocation: '',
  resepsiDate: '',
  resepsiStartTime: '',
  resepsiEndTime: '',
  resepsiLocation: '',
  loveStory: [],
  bankAccounts: [],
  galleryPhotos: [],
  // Legacy
  eventDate: '',
  eventTime: '',
  eventLocation: ''
};
