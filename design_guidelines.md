# Design Guidelines: Real-Time Hangout Platform

## Design Approach
**System-Based with Reference Inspiration**
- Primary: Fluent Design System for video communication interfaces
- References: Discord (chat/voice UI), Zoom (video layouts), Netflix (media player), Linear (modern minimalism)
- Rationale: Utility-focused real-time communication platform requiring reliability, clarity, and performance

## Core Design Principles
1. **Dark-First Design**: Optimized for extended viewing sessions
2. **Content Priority**: UI recedes when media is active
3. **Instant Clarity**: All controls immediately discoverable
4. **Responsive Density**: Adapts from solo viewing to group hangouts

## Color Palette

**Dark Mode (Primary)**
- Background Base: 220 15% 8%
- Surface Elevated: 220 13% 12%
- Surface Hover: 220 12% 15%
- Border Subtle: 220 10% 20%
- Text Primary: 0 0% 98%
- Text Secondary: 220 5% 70%
- Primary Brand: 260 85% 65% (vibrant purple for active states)
- Primary Hover: 260 80% 60%
- Accent Success: 142 70% 50% (for active mic/camera)
- Accent Danger: 0 75% 60% (for mute/end call)
- Accent Warning: 38 90% 55% (for screen sharing active)

**Light Mode (Secondary)**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text Primary: 220 15% 15%
- Primary Brand: 260 80% 55%

## Typography
- **Primary Font**: Inter (Google Fonts) - clean, readable for UI
- **Accent Font**: Outfit (Google Fonts) - friendly, modern for headings
- **Hierarchy**:
  - Hero: text-5xl md:text-6xl font-bold (Outfit)
  - Section Headers: text-3xl md:text-4xl font-semibold (Outfit)
  - Component Headers: text-xl font-semibold (Inter)
  - Body: text-base (Inter)
  - UI Labels: text-sm font-medium (Inter)
  - Captions: text-xs (Inter)

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 8, 12, 16 (p-2, m-4, gap-8, py-12, space-x-16)
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Grid gaps: gap-4 to gap-8
- Container max-width: max-w-7xl

**Application Layout**:
- Full viewport experience (h-screen)
- Sidebar: 280px fixed width (chat/participants)
- Main content: flex-1 (video grid/screen share)
- Control bar: 80px fixed height (bottom controls)

**Landing Page Layout**:
- Hero: 90vh with video preview
- Features: 3-column grid (lg:grid-cols-3 md:grid-cols-2)
- Use Cases: 2-column alternating (image + content)
- Footer: 4-column links + newsletter

## Component Library

### Navigation
- Top bar: Transparent over hero, solid bg-surface-elevated on scroll
- Logo left, nav center, CTA right
- Mobile: Hamburger menu with slide-in drawer

### Hero Section
- Full-width video demo/screenshot showing platform in action
- Centered heading + subheading + dual CTA (Start Room / Learn More)
- Floating video preview with subtle shadow and glow
- Particle/gradient background animation (subtle)

### Video Components
- **Video Grid**: Dynamic 1x1, 2x2, 3x3 layouts based on participants
- **Video Tile**: Rounded corners (rounded-lg), subtle border, name overlay
- **Active Speaker**: Primary brand color border (border-2)
- **Screen Share**: Full-screen takeover with minimal UI overlay
- **Video Player**: Custom controls, progress bar, volume slider

### Chat Interface
- Message bubbles: bg-surface-elevated, rounded-2xl
- Own messages: bg-primary/20 aligned right
- Timestamp: text-xs text-secondary above bubbles
- Input: Fixed bottom, rounded-full with send button

### Control Bar
- Centered icon buttons (mic, camera, screen share, settings, leave)
- Icon size: w-12 h-12
- Active states: bg-success text-white
- Inactive: bg-surface-hover text-secondary
- Danger action (leave): bg-danger text-white

### Feature Cards
- bg-surface-elevated, rounded-xl, p-8
- Icon top (w-12 h-12 text-primary)
- Heading: text-xl font-semibold
- Description: text-secondary
- Hover: scale-105 transition, subtle glow

### Buttons
- Primary: bg-primary hover:bg-primary-hover, rounded-full, px-8 py-3
- Secondary: bg-surface-elevated border border-subtle
- Outline on images: backdrop-blur-md bg-white/10 border border-white/20
- Icon buttons: rounded-full p-3

### Forms (Room Creation)
- Input fields: bg-surface-elevated border border-subtle rounded-lg px-4 py-3
- Focus: border-primary ring-2 ring-primary/20
- Labels: text-sm font-medium mb-2
- Generate Link button: bg-primary full-width

### Status Indicators
- Participant count: pill badge (bg-success/20 text-success)
- Connection quality: colored dots (red/yellow/green)
- Recording indicator: pulsing red dot

## Images
- **Hero Image**: Platform screenshot showing active video call with 4 participants, screen share visible, chat sidebar open. Should demonstrate the full experience. Place as background with overlay gradient.
- **Feature Illustrations**: Custom illustrations for each feature (video chat, screen sharing, watch together). Modern, colorful, slightly abstract style.
- **Use Case Screenshots**: Real scenarios - friends watching movie, team collaboration, gaming session

## Animations
**Sparingly Used**:
- Page load: Fade in hero content (0.6s)
- Video tiles: Gentle scale on hover (transform scale-105)
- Connection pulse: Subtle pulse on active mic/camera icons
- Message send: Slide up animation
- NO complex scroll animations or parallax

## Accessibility
- WCAG AA contrast ratios maintained
- Focus indicators on all interactive elements (ring-2 ring-primary/50)
- Keyboard navigation for all controls
- Screen reader labels on icon-only buttons
- Captions support for video content

## Landing Page Structure
1. **Hero**: Video demo + headline "Watch Together, Anywhere" + dual CTA
2. **Features Grid**: 3 cards (Video Chat, Screen Share, Watch Party)
3. **How It Works**: 3-step process with illustrations
4. **Use Cases**: 2-column alternating scenarios
5. **Privacy & Security**: Single column with trust badges
6. **CTA Section**: Create room CTA with room preview
7. **Footer**: Links + social + newsletter

## Application Interface Structure
- **Main View**: Video grid OR screen share OR media player (dynamic)
- **Right Sidebar**: Chat + participant list (collapsible)
- **Bottom Control Bar**: Always visible media controls
- **Top Bar**: Room name, invite link, settings (minimal)