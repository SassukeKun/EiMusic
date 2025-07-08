import { getSupabaseBrowserClient } from '@/utils/supabaseClient'
import uploadService from './uploadService'

/**
 * Service that centralises profile–related mutations for users and artists.
 * Keeps UI components thin.
 */
class ProfileService {
  /**
   * Upload a new avatar to Cloudinary and persist URL in Supabase `users` table.
   * @param userId – UUID from auth.user.id (maps to `users` row)
   * @param file – browser `File` chosen by the user
   */
  async updateUserAvatar(userId: string, file: File) {
    if (!file) throw new Error('File is required')

    // 1. Upload to Cloudinary
    const uploadRes = await uploadService.uploadImage(userId, file, 'avatar', false)

    // 2. Save URL in Supabase
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('users')
      .update({ profile_image_url: uploadRes.url })
      .eq('id', userId)

    if (error) {
      console.log('Supabase updateUserAvatar', error)
      throw error
    }

    return uploadRes.url
  }

  /**
   * Upload a new avatar for an artist and store URL in `artists` table.
   * @param artistId – UUID in `artists` table (same as auth.user.id for artist accounts)
   */
  async updateArtistAvatar(artistId: string, file: File) {
    if (!file) throw new Error('File is required')

    const uploadRes = await uploadService.uploadImage(artistId, file, 'avatar', true)

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('artists')
      .update({ profile_image_url: uploadRes.url })
      .eq('id', artistId)

    if (error) {
      console.log('Supabase updateArtistAvatar', error)
      throw error
    }

    return uploadRes.url
  }
}

const profileService = new ProfileService()
export default profileService
