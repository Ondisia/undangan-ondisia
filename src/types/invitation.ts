export interface Guest {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'sent' | 'opened' | 'confirmed' | 'declined';
  createdAt: Date;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'elegant' | 'modern' | 'rustic' | 'minimalist' | 'floral';
  isActive?: boolean;
}

export interface LoveStoryMilestone {
  title: string;
  date: string;
  description: string;
  icon?: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface LoveStory extends LoveStoryMilestone { }

export interface InvitationSettings {
  id?: string;
  userId?: string;

  // Basic Info
  eventName: string;
  selectedThemeId: string; // theme_id in DB
  openingQuote?: string;
  closingMessage?: string;

  // Groom Information
  groomName: string;
  groomFullName: string;
  groomTitle?: string; // S.T, S.Pd, etc
  groomDescription: string; // "Putra pertama dari", etc
  groomFatherName: string;
  groomMotherName: string;
  groomPhotoUrl?: string;

  // Bride Information
  brideName: string;
  brideFullName: string;
  brideTitle?: string;
  brideDescription: string;
  brideFatherName: string;
  brideMotherName: string;
  bridePhotoUrl?: string;

  // Akad Nikah
  akadDate: string;
  akadStartTime: string;
  akadEndTime: string;
  akadLocation: string;

  // Resepsi
  resepsiDate: string;
  resepsiStartTime: string;
  resepsiEndTime: string;
  resepsiLocation: string;

  // Maps & Location
  mapsUrl?: string;

  // Music
  musicUrl?: string;

  // Gallery
  galleryPhotos: string[];

  // Love Story
  loveStory: LoveStory[];

  // Gift Information
  bankAccounts: BankAccount[];

  // Legacy fields for backward compatibility
  eventDate: string; // Will use akadDate as default
  eventTime: string; // Will use akadStartTime as default
  eventLocation: string; // Will use akadLocation as default
}
