import { Liveblocks } from '@liveblocks/node';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

if (!process.env.LIVEBLOCKS_SECRET_KEY) {
  throw new Error('LIVEBLOCKS_SECRET_KEY is not configured');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase configuration is missing');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

export async function POST(request: Request) {
  try {
    // Get the session from the request
    const cookieStore = cookies();
    const supabaseCookie = cookieStore.get('sb-access-token');
    
    if (!supabaseCookie) {
      console.error('No Supabase cookie found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseCookie.value);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create a session for the user
    const session = liveblocks.prepareSession(
      user.id,
      {
        userInfo: {
          name: user.email || 'Anonymous',
          picture: user.user_metadata?.avatar_url || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'Anonymous')}`,
        },
      }
    );

    // Give the user access to the room
    const { body, status } = await session.authorize();
    return new NextResponse(body, { status });
  } catch (error) {
    console.error('Error in liveblocks-auth:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 