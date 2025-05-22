import { createClient, LiveList, LiveObject } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'

if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY is not configured')
}

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
  throttle: 16, // 60fps
  async resolveUsers({ userIds }) {
    // Used only for Presence. Returns the current user's info.
    return userIds.map((userId) => ({
      id: userId,
      info: {
        name: userId,
        picture: `https://ui-avatars.com/api/?name=${userId}&background=random`,
      },
    }))
  },
})

// Room type definition
type Presence = {
  id: string
  cursor: { x: number; y: number } | null
  name: string
  color: string
  content: string
}

type Storage = {
  content: LiveList<string>
}

type UserMeta = {
  id: string
  info: {
    name: string
    picture: string
  }
}

type RoomEvent = {
  type: 'NOTIFICATION'
  message: string
}

export const {
  RoomProvider,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useRoom,
  useStorage,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client) 