import { Liveblocks } from '@liveblocks/node';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const { user } = await request.json();
    
    if (!user || !user.id) {
      console.error('No user provided in request');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user details from Supabase auth.users table
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id);
    
    if (authError || !authUser) {
      console.error('Error fetching user:', authError);
      return new NextResponse('User not found', { status: 404 });
    }

    // Create a session for the user
    const session = liveblocks.prepareSession(
      user.id,
      {
        userInfo: {
          name: authUser.user.email || 'Anonymous',
          picture: authUser.user.user_metadata?.avatar_url || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user.email || 'Anonymous')}`,
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