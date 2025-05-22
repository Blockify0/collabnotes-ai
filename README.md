# CollabNotes AI

A real-time AI-powered collaboration notebook built with Next.js, Supabase, Liveblocks, and OpenAI.

## Features

- 🔄 Real-time collaboration with live cursors
- 🤖 AI-powered content summarization and transcription
- 📝 Rich text editor with collaborative features
- 🎥 YouTube video transcription and summarization
- 📄 PDF and audio file support
- 👥 Team presence indicators
- 🔒 Secure authentication with Supabase
- 🎨 Modern, responsive UI

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Real-time**: Liveblocks
- **AI**: OpenAI GPT-4
- **UI Components**: Radix UI

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/collabnotes-ai.git
   cd collabnotes-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your-liveblocks-public-key
   LIVEBLOCKS_SECRET_KEY=your-liveblocks-secret-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
collabnotes-ai/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   └── workspace/         # Workspace pages
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── supabase.ts       # Supabase client
│   └── liveblocks.ts     # Liveblocks configuration
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
