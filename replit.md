# WatchTogether - Real-Time Hangout Platform

## Overview
WatchTogether is a personalized real-time communication platform that enables users to watch content together, share screens, video chat, and collaborate remotely. It's designed as a streamlined alternative to platforms like Kosmi.io, focusing on intimate group experiences.

## Recent Changes (2025-10-19)
- Initial MVP implementation completed
- Full-stack real-time communication system with WebSockets
- Dark-first UI design optimized for media viewing
- Room-based collaboration with participant management
- Real-time chat messaging
- Synchronized video player for watching content together
- Screen sharing capabilities
- Video/audio controls (mute, camera on/off)

## Project Architecture

### Frontend (React + TypeScript + Tailwind CSS)
- **Pages:**
  - `home.tsx` - Landing page with hero section and feature showcase
  - `room-connected.tsx` - Main room interface with video grid, chat, and controls
  - `not-found.tsx` - 404 page

- **Components:**
  - `theme-provider.tsx` - Dark/light mode management
  - `create-room-modal.tsx` - Room creation dialog
  - `video-grid.tsx` - Responsive video participant layout
  - `video-tile.tsx` - Individual participant video display
  - `chat-sidebar.tsx` - Real-time messaging interface
  - `participant-list.tsx` - Active participants display
  - `control-bar.tsx` - Media controls (mic, camera, screen share, leave)
  - `video-player.tsx` - Synchronized video playback controls

- **Hooks:**
  - `use-websocket.ts` - WebSocket connection management and message handling

### Backend (Express + WebSocket)
- **WebSocket Server:** Real-time bidirectional communication for:
  - Room join/leave events
  - Chat message broadcasting
  - Participant state synchronization
  - Media state updates
  - WebRTC signaling (offer/answer/ICE candidates)

- **Storage:** In-memory storage for:
  - Active rooms
  - Participants
  - Chat messages
  - Media state

### Data Models
- **Room:** id, name, createdAt, hostId
- **Participant:** id, roomId, username, isHost, isMuted, isCameraOff, isSharingScreen, joinedAt
- **ChatMessage:** id, roomId, senderId, senderUsername, content, timestamp
- **MediaState:** isPlaying, currentTime, url

## Key Features (Implemented)
1. ✅ Beautiful dark-themed UI optimized for media viewing
2. ✅ Room creation with shareable links
3. ✅ Real-time text chat with message history
4. ✅ Participant list with live connection status
5. ✅ Synchronized video player for watching content together
6. ✅ Local camera/microphone capture with getUserMedia
7. ✅ WebSocket-based real-time communication
8. ✅ Responsive design for mobile and desktop
9. ✅ Control UI for mic, camera, screen share, and video player

## Features Requiring Additional Implementation
1. ⏳ WebRTC peer-to-peer connections for remote video/audio streams
2. ⏳ Screen sharing capture (requires getDisplayMedia + WebRTC)
3. ⏳ STUN/TURN server integration for NAT traversal
4. ⏳ Multi-party mesh or SFU architecture for video routing

## Design System
- **Fonts:** Inter (UI), Outfit (headings)
- **Color Palette:** Dark-first with vibrant purple primary (#8B7FFF)
- **Components:** Shadcn UI with custom styling
- **Spacing:** Consistent 4px grid system
- **Interactions:** Subtle hover/active states with elevation system

## User Preferences
- User prefers dark mode for extended viewing sessions
- Clean, minimal UI that recedes when media is active
- Instant room creation without sign-up friction
- Simple shareable links for inviting friends

## Technical Notes
- WebSocket path: `/ws` (separate from Vite HMR)
- Room IDs: 8-character random strings
- Participant IDs: UUIDs generated server-side
- Automatic reconnection with exponential backoff
- Heartbeat mechanism to detect stale connections
- Room cleanup when last participant leaves

## Next Steps for Full Video Chat Functionality

### WebRTC Implementation (High Priority)
To enable actual video/audio streaming between participants:

1. **RTCPeerConnection Setup:**
   - Create peer connections for each participant pair
   - Handle connection state lifecycle
   - Manage track addition/removal

2. **Signaling via WebSocket:**
   - Extend WebSocket messages for SDP offer/answer exchange
   - Handle ICE candidate trickling
   - Coordinate peer discovery

3. **Media Stream Management:**
   - Attach remote tracks to VideoTile elements
   - Handle track mute/unmute events
   - Implement screen sharing with getDisplayMedia()

4. **Network Traversal:**
   - Configure STUN servers for public IP discovery
   - Add TURN server fallback for restrictive NATs
   - Handle connection failures gracefully

### Additional Enhancements
- File sharing for local video playback
- YouTube and streaming service integrations
- Customizable room themes
- Persistent room history
- User profiles and authentication
- Screen annotation tools
- Recording capabilities
