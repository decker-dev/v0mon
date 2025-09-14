# 🎮 v0mon - Pokémon Avatar Generator

Transform any X/Twitter username into a unique, AI-generated Pokémon avatar! v0mon uses Google's Gemini AI to create personalized Pokémon creatures based on usernames, complete with custom types, names, and descriptions.

![v0mon Banner](https://v0mon.vercel.app/api/og?username=example)

## ✨ Features

- **AI-Powered Generation**: Uses Google Gemini 2.5 Flash to create unique Pokémon artwork
- **Smart Type System**: Assigns 1-2 Pokémon types with personality traits matching the username
- **Creative Naming**: Generates Pokemon-style names inspired by the input username
- **Persistent Storage**: Saves generated Pokémon to prevent regeneration (one per username)
- **Social Sharing**: Built-in X/Twitter sharing functionality
- **Open Graph Support**: Custom OG images for social media previews
- **Responsive Design**: Beautiful UI that works on all devices
- **Fast Performance**: Built with Next.js 15 and optimized for speed

## 🚀 Live Demo

Visit **[v0mon.vercel.app](https://v0mon.vercel.app)** to try it out!

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **AI**: Google Gemini 2.5 Flash Image Preview
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Vercel Blob for image storage
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL database
- Google AI API key
- Vercel account (for blob storage)

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/decker-dev/v0mon.git
   cd v0mon
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Google AI API Key (required)
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
   
   # Database URL (required)
   DATABASE_URL=postgresql://username:password@localhost:5432/v0mon
   
   # Vercel Blob Storage (required for production)
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
   
   # App URL (for OG images and sharing)
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_GENAI_API_KEY` | Google AI API key for Gemini model | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token | ✅ |
| `NEXT_PUBLIC_BASE_URL` | Your app's public URL | ✅ |

### Getting API Keys

1. **Google AI API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Enable Gemini API access

2. **Vercel Blob Token**:
   - Go to your Vercel dashboard
   - Navigate to Storage → Blob
   - Create a new store and copy the token

## 📊 Database Schema

The app uses a simple PostgreSQL schema:

```sql
CREATE TABLE pokemon (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  imageUrl TEXT NOT NULL,
  type1 TEXT NOT NULL,
  type2 TEXT,
  pokemonName TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 🎨 How It Works

1. **Username Input**: User enters an X/Twitter username
2. **Type Generation**: Algorithm assigns 1-2 random Pokémon types
3. **AI Prompt Creation**: Builds a detailed prompt incorporating:
   - Username characteristics
   - Type-specific personality traits
   - Visual design requirements
4. **Image Generation**: Google Gemini creates the Pokémon artwork
5. **Name Extraction**: AI generates a creative Pokémon name
6. **Storage**: Image stored in Vercel Blob, metadata in PostgreSQL
7. **Sharing**: Users can share their Pokémon on social media

## 📁 Project Structure

```
v0mon/
├── src/
│   ├── app/
│   │   ├── [username]/          # Dynamic user pages
│   │   ├── api/
│   │   │   ├── generate-pokemon/ # Pokemon generation API
│   │   │   └── og/              # Open Graph image generation
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx             # Homepage
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   └── lib/
│       ├── db/                  # Database configuration
│       └── utils.ts
├── drizzle/                     # Database migrations
├── public/                      # Static assets
└── package.json
```

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## 🛠️ Development Scripts

```bash
# Development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code with Biome
pnpm lint

# Format code with Biome
pnpm format

# Generate database migrations
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Pokémon](https://www.pokemon.com/) for the inspiration
- [Google AI](https://ai.google.dev/) for the Gemini model
- [Vercel](https://vercel.com/) for hosting and storage
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components

## 📞 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/decker-dev/v0mon/issues) on GitHub.

---

**Made with ❤️ by [decker](https://github.com/decker-dev)**

*Generate your Pokémon today at [v0mon.vercel.app](https://v0mon.vercel.app)!*
