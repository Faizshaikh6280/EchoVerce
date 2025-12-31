src/
├─ main.tsx
├─ App.tsx
│
├─ routes/
│ ├─ index.tsx # route config
│ ├─ Home.tsx
│ └─ Avatar.tsx
│
├─ layout/
│ └─ MainLayout.tsx
│
├─ components/
│ ├─ avatar/
│ │ ├─ AvatarCanvas.tsx
│ │ ├─ AvatarModel.tsx
│ │ ├─ AvatarController.tsx
│ │ ├─ AvatarAnimations.ts
│ │ └─ constants.ts
│ │
│ ├─ audio/
│ │ ├─ AudioPlayer.tsx
│ │ └─ useAudio.ts
│ │
│ ├─ chat/
│ │ ├─ ChatBox.tsx
│ │ └─ MessageBubble.tsx
│ │
│ └─ ui/
│ ├─ Button.tsx
│ └─ Loader.tsx
│
├─ store/
│ ├─ avatar.store.ts
│ └─ audio.store.ts
│
├─ hooks/
│ ├─ useLipSync.ts
│ └─ useAvatarMode.ts
│
├─ lib/
│ ├─ three.ts
│ ├─ audio.ts
│ └─ minimax.ts
│
├─ types/
│ ├─ avatar.ts
│ └─ audio.ts
│
├─ assets/
│ ├─ models/
│ │ └─ avatar.glb
│ └─ audio/
│
└─ styles/
└─ index.css
