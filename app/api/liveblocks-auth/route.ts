import { Liveblocks } from '@liveblocks/node';
import { NextResponse } from 'next/server';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  try {
    const { user } = await request.json();
    
    // Create a session for the user
    const session = liveblocks.prepareSession(
      user.id,
      {
        userInfo: {
          name: user.email,
          picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}`,
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