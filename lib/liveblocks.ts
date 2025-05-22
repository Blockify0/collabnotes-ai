import { createClient, LiveList, LiveObject } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'

const client = createClient({
  authEndpoint: '/api/liveblocks-auth',
  throttle: 16, // 60fps
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
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client) 