import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { z } from 'zod';

const bodySchema = z.object({
  communityId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const { communityId } = parsed.data;
    const { joinCommunity } = await import('@/services/communityService');
    await joinCommunity(communityId, user.id);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  }
}
