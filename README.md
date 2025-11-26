# Brickie

A mobile-first quick-estimate tool for UK bricklayers. Snap a photo, enter one dimension, and get AI-powered material and labour estimates in seconds.

## Features

- **AI-Powered Estimates**: Upload a photo, and GPT-4 Vision analyzes the job to provide material and labour estimates
- **Multiple Job Types**: Brickwork, Blockwork, Repointing, Demo+Rebuild
- **PDF Quote Generation**: Generate professional PDF quotes for customers
- **Save & Review**: Store estimates locally or in the cloud
- **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Web App**: Next.js 14 (App Router)
- **Mobile App**: Expo React Native
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4o Vision
- **Styling**: Tailwind CSS (web), NativeWind (mobile)
- **State**: Zustand

## Project Structure

```
brickie/
├── apps/
│   ├── web/              # Next.js web application
│   ├── mobile/           # Expo React Native app
│   └── backend/          # Supabase SQL, migrations, functions
├── packages/
│   ├── lib/              # Shared business logic & types
│   └── ui/               # Shared UI components
├── scripts/              # Utility scripts
├── turbo.json            # Turborepo configuration
└── package.json          # Root package.json
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase CLI (for local development)
- OpenAI API key

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/brickie.git
   cd brickie
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Root .env
   cp .env.example .env

   # Web app
   cp apps/web/.env.local.example apps/web/.env.local

   # Mobile app
   cp apps/mobile/.env.example apps/mobile/.env
   ```

4. **Configure your API keys**

   Edit the `.env` files with your actual values:
   - `OPENAI_API_KEY`: Your OpenAI API key (get from [platform.openai.com](https://platform.openai.com/api-keys))
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Running the Apps

### Web App (Next.js)

```bash
# Development
pnpm dev:web

# Build
pnpm build --filter=@brickie/web

# Start production server
cd apps/web && pnpm start
```

The web app will be available at `http://localhost:3000`

### Mobile App (Expo)

```bash
# Development
pnpm dev:mobile

# Or directly
cd apps/mobile
pnpm start

# Run on specific platform
pnpm ios      # iOS Simulator
pnpm android  # Android Emulator
pnpm web      # Web browser
```

### Both Apps Simultaneously

```bash
pnpm dev
```

## Supabase Setup

### Option 1: Local Development

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Start local Supabase**
   ```bash
   cd apps/backend
   supabase start
   ```

3. **Run migrations**
   ```bash
   supabase db push
   ```

4. **Get local credentials**
   ```bash
   supabase status
   ```
   Copy the API URL and anon key to your `.env` files.

### Option 2: Supabase Cloud

1. Create a new project at [supabase.com](https://supabase.com)

2. Go to Project Settings > API and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

3. Run migrations:
   ```bash
   cd apps/backend
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

## Deployment

### Deploy Web to Vercel

1. **Connect your repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository

2. **Configure build settings**
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm build --filter=@brickie/web`
   - Install Command: `pnpm install`

3. **Add environment variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`

### Deploy Supabase

1. Push database to production:
   ```bash
   cd apps/backend
   supabase db push --linked
   ```

2. Deploy Edge Functions:
   ```bash
   supabase functions deploy estimate
   ```

### Build Mobile App

```bash
cd apps/mobile

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

## Testing

### Run the Test Script

Tests 3 sample job estimations:

```bash
pnpm test:estimate
```

Note: Requires `OPENAI_API_KEY` to be set.

### Type Check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

## API Usage

### OpenAI Integration

The app uses GPT-4o Vision to analyze job photos. The system prompt is designed for UK bricklayers and produces JSON estimates including:

- Estimated area (m²)
- Brick count range
- Materials (sand, cement, other)
- Labour hours range
- Recommended price range (GBP)
- Assumptions and exclusions

### Supabase Tables

**profiles**
- User account information
- Company name, day rate, disclaimer text

**jobs**
- Saved job estimates
- Photo URL, inputs (JSONB), outputs (JSONB)

## Configuration

### Job Types
- **Brickwork**: New brick wall construction
- **Blockwork**: Concrete block construction
- **Repointing**: Mortar joint restoration (no new bricks)
- **Demo+Rebuild**: Full demolition and rebuild

### Difficulty Levels
- **Easy**: Standard access, simple layout (±10-15% range)
- **Standard**: Typical job complexity (±15-25% range)
- **Tricky**: Difficult access or complex work (±25-35% range)

## Limitations

- Estimates are for guidance only - always verify on-site
- Photo quality affects estimate accuracy
- Internet connection required for AI estimation
- API costs apply for OpenAI usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private - All rights reserved.

---

Built for the trades. Made in the UK.
