import { supabase } from '@/lib/supabaseClient';
import { InvitationSettings, LoveStory, BankAccount } from '@/types/invitation';

export const getInvitation = async (userId: string): Promise<InvitationSettings | null> => {
    try {
        const { data: invitation, error } = await supabase
            .from('invitations')
            .select(`
        *,
        love_story (*),
        bank_accounts (*)
      `)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        if (!invitation) return null;

        // Map DB response (snake_case) to Frontend (camelCase)
        // Note: love_story and bank_accounts are arrays attached to invitation

        // Sort separate tables if needed, though Order By in query is better
        const loveStory = (invitation.love_story || []).sort((a: any, b: any) => a.order_index - b.order_index).map((item: any) => ({
            title: item.title,
            date: item.date,
            description: item.description,
            icon: item.icon
        }));

        const bankAccounts = (invitation.bank_accounts || []).sort((a: any, b: any) => a.order_index - b.order_index).map((item: any) => ({
            bankName: item.bank_name,
            accountNumber: item.account_number,
            accountHolder: item.account_holder
        }));

        return {
            id: invitation.id,
            userId: invitation.user_id,

            // Basic Info
            eventName: invitation.event_name,
            selectedThemeId: invitation.theme_id,
            openingQuote: invitation.opening_quote,
            closingMessage: invitation.closing_message,
            musicUrl: invitation.music_url,

            // Groom
            groomName: invitation.groom_name,
            groomFullName: invitation.groom_full_name,
            groomTitle: invitation.groom_title,
            groomDescription: invitation.groom_description,
            groomFatherName: invitation.groom_father_name,
            groomMotherName: invitation.groom_mother_name,
            groomPhotoUrl: invitation.groom_photo_url,

            // Bride
            brideName: invitation.bride_name,
            brideFullName: invitation.bride_full_name,
            brideTitle: invitation.bride_title,
            brideDescription: invitation.bride_description,
            brideFatherName: invitation.bride_father_name,
            brideMotherName: invitation.bride_mother_name,
            bridePhotoUrl: invitation.bride_photo_url,

            // Akad
            akadDate: invitation.akad_date,
            akadStartTime: invitation.akad_start_time,
            akadEndTime: invitation.akad_end_time,
            akadLocation: invitation.akad_location,

            // Resepsi
            resepsiDate: invitation.resepsi_date,
            resepsiStartTime: invitation.resepsi_start_time,
            resepsiEndTime: invitation.resepsi_end_time,
            resepsiLocation: invitation.resepsi_location,

            // Maps
            mapsUrl: invitation.maps_url,

            // Arrays
            galleryPhotos: invitation.gallery_photos || [],
            loveStory,
            bankAccounts,

            // Legacy/Derived fields for backward compact
            eventDate: invitation.akad_date,
            eventTime: invitation.akad_start_time,
            eventLocation: invitation.akad_location,
        };

    } catch (error) {
        console.error('Error fetching invitation:', error);
        throw error;
    }
};

export const getInvitationById = async (id: string): Promise<InvitationSettings | null> => {
    try {
        const { data: invitation, error } = await supabase
            .from('invitations')
            .select(`
        *,
        love_story (*),
        bank_accounts (*)
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        if (!invitation) return null;

        // Map DB response
        const loveStory = (invitation.love_story || []).sort((a: any, b: any) => a.order_index - b.order_index).map((item: any) => ({
            title: item.title,
            date: item.date,
            description: item.description,
            icon: item.icon
        }));

        const bankAccounts = (invitation.bank_accounts || []).sort((a: any, b: any) => a.order_index - b.order_index).map((item: any) => ({
            bankName: item.bank_name,
            accountNumber: item.account_number,
            accountHolder: item.account_holder
        }));

        return {
            id: invitation.id,
            userId: invitation.user_id,

            eventName: invitation.event_name,
            selectedThemeId: invitation.theme_id,
            openingQuote: invitation.opening_quote,
            closingMessage: invitation.closing_message,
            musicUrl: invitation.music_url,

            groomName: invitation.groom_name,
            groomFullName: invitation.groom_full_name,
            groomTitle: invitation.groom_title,
            groomDescription: invitation.groom_description,
            groomFatherName: invitation.groom_father_name,
            groomMotherName: invitation.groom_mother_name,
            groomPhotoUrl: invitation.groom_photo_url,

            brideName: invitation.bride_name,
            brideFullName: invitation.bride_full_name,
            brideTitle: invitation.bride_title,
            brideDescription: invitation.bride_description,
            brideFatherName: invitation.bride_father_name,
            brideMotherName: invitation.bride_mother_name,
            bridePhotoUrl: invitation.bride_photo_url,

            akadDate: invitation.akad_date,
            akadStartTime: invitation.akad_start_time,
            akadEndTime: invitation.akad_end_time,
            akadLocation: invitation.akad_location,

            resepsiDate: invitation.resepsi_date,
            resepsiStartTime: invitation.resepsi_start_time,
            resepsiEndTime: invitation.resepsi_end_time,
            resepsiLocation: invitation.resepsi_location,

            mapsUrl: invitation.maps_url,
            galleryPhotos: invitation.gallery_photos || [],
            loveStory,
            bankAccounts,

            eventDate: invitation.akad_date,
            eventTime: invitation.akad_start_time,
            eventLocation: invitation.akad_location,
        };

    } catch (error) {
        console.error('Error fetching invitation by ID:', error);
        throw error;
    }
};

export const createOrUpdateInvitation = async (userId: string, settings: InvitationSettings) => {
    try {
        console.log('🔵 Starting save process...', { userId, settings });

        // STRATEGY 1: Atomic RPC (Best)
        // Try to save everything in one transaction using the Postgres function.
        console.log('🔵 Attempting RPC save...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('save_invitation_complete', {
            p_user_id: userId,
            p_settings: settings
        });

        if (!rpcError) {
            console.log('✅ RPC Save SUCCESS!', { invitationId: rpcData });
            return { id: rpcData };
        }

        // If RPC fails because function doesn't exist, FALLBACK to legacy client-side method
        console.warn("⚠️ RPC Save failed, falling back to Client-Side Save...", rpcError);
        console.error('RPC Error Details:', {
            message: rpcError.message,
            code: rpcError.code,
            details: rpcError.details,
            hint: rpcError.hint
        });

        // STRATEGY 2: Client-Side Upsert (Fallback)
        // 1. Upsert Invitation
        console.log('🔵 Attempting client-side upsert...');
        const { data: invitation, error: invError } = await supabase
            .from('invitations')
            .upsert({
                user_id: userId,
                event_name: settings.eventName,
                theme_id: settings.selectedThemeId,
                opening_quote: settings.openingQuote,
                closing_message: settings.closingMessage,
                music_url: settings.musicUrl,

                groom_name: settings.groomName,
                groom_full_name: settings.groomFullName,
                groom_title: settings.groomTitle,
                groom_description: settings.groomDescription,
                groom_father_name: settings.groomFatherName,
                groom_mother_name: settings.groomMotherName,
                groom_photo_url: settings.groomPhotoUrl,

                bride_name: settings.brideName,
                bride_full_name: settings.brideFullName,
                bride_title: settings.brideTitle,
                bride_description: settings.brideDescription,
                bride_father_name: settings.brideFatherName,
                bride_mother_name: settings.brideMotherName,
                bride_photo_url: settings.bridePhotoUrl,

                akad_date: settings.akadDate,
                akad_start_time: settings.akadStartTime,
                akad_end_time: settings.akadEndTime,
                akad_location: settings.akadLocation,

                resepsi_date: settings.resepsiDate,
                resepsi_start_time: settings.resepsiStartTime,
                resepsi_end_time: settings.resepsiEndTime,
                resepsi_location: settings.resepsiLocation,

                maps_url: settings.mapsUrl,
                gallery_photos: settings.galleryPhotos,

                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (invError) {
            console.error('❌ INVITATION UPSERT FAILED:', {
                message: invError.message,
                code: invError.code,
                details: invError.details,
                hint: invError.hint
            });
            throw invError;
        }
        if (!invitation) {
            console.error('❌ Invitation returned null/undefined');
            throw new Error('Failed to create/update invitation');
        }

        console.log('✅ Invitation upserted successfully:', invitation.id);
        const invitationId = invitation.id;

        // 2. Handle Love Story 
        console.log('🔵 Deleting old love story entries...');
        await supabase.from('love_story').delete().eq('invitation_id', invitationId);

        if (settings.loveStory.length > 0) {
            console.log('🔵 Inserting love story entries:', settings.loveStory.length);
            const { error: lsError } = await supabase.from('love_story').insert(
                settings.loveStory.map((story, index) => ({
                    invitation_id: invitationId,
                    title: story.title,
                    date: story.date,
                    description: story.description,
                    icon: story.icon,
                    order_index: index
                }))
            );
            if (lsError) {
                console.error('❌ LOVE STORY INSERT FAILED:', {
                    message: lsError.message,
                    code: lsError.code,
                    details: lsError.details,
                    hint: lsError.hint
                });
                throw lsError;
            }
            console.log('✅ Love story saved');
        }

        // 3. Handle Bank Accounts
        console.log('🔵 Deleting old bank accounts...');
        await supabase.from('bank_accounts').delete().eq('invitation_id', invitationId);

        if (settings.bankAccounts.length > 0) {
            console.log('🔵 Inserting bank accounts:', settings.bankAccounts.length);
            const { error: baError } = await supabase.from('bank_accounts').insert(
                settings.bankAccounts.map((bank, index) => ({
                    invitation_id: invitationId,
                    bank_name: bank.bankName,
                    account_number: bank.accountNumber,
                    account_holder: bank.accountHolder,
                    order_index: index
                }))
            );
            if (baError) {
                console.error('❌ BANK ACCOUNTS INSERT FAILED:', {
                    message: baError.message,
                    code: baError.code,
                    details: baError.details,
                    hint: baError.hint
                });
                throw baError;
            }
            console.log('✅ Bank accounts saved');
        }

        console.log('✅ CLIENT-SIDE SAVE COMPLETE!');
        return invitation;

    } catch (error) {
        console.error('❌❌❌ CRITICAL SAVE ERROR:', error);
        throw error;
    }
};
