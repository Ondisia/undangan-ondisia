import { supabase } from '@/lib/supabaseClient';
import { Guest } from '@/types/invitation';

export const getGuests = async (invitationId: string): Promise<Guest[]> => {
    const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('invitation_id', invitationId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((g: any) => ({
        id: g.id,
        name: g.name,
        phone: g.phone,
        email: g.email || '',
        status: g.status,
        createdAt: new Date(g.created_at)
    }));
};

export const addGuest = async (invitationId: string, guest: Omit<Guest, 'id' | 'createdAt' | 'status'>): Promise<Guest> => {
    const { data, error } = await supabase
        .from('guests')
        .insert({
            invitation_id: invitationId,
            name: guest.name,
            phone: guest.phone,
            status: 'pending' // Default status
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        status: data.status,
        createdAt: new Date(data.created_at)
    };
};

export const deleteGuest = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// Optional: Update guest status (e.g. valid phone number, or manual status change)
export const updateGuestStatus = async (id: string, status: Guest['status']): Promise<void> => {
    const { error } = await supabase
        .from('guests')
        .update({ status })
        .eq('id', id);

    if (error) throw error;
};
