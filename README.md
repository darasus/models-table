# LLM Models Table

Browse and compare LLM models from [models.dev](https://models.dev) in a sortable, filterable data table built with Next.js and shadcn/ui.

## Environment

Create `.env.local` with your Artificial Analysis API key to load intelligence scores:

```bash
ARTIFICIAL_ANALYSIS_API_KEY=your_api_key
```

Get a key at [artificialanalysis.ai/data-api](https://artificialanalysis.ai/data-api). The free tier exposes the Intelligence Index, Coding Index, and Agentic Index.

## Architecture

Data fetching runs in React Server Components:

- `lib/data/get-llm-models.ts` — cached server fetch (`React.cache`)
- `components/models/models-table-section.tsx` — async Server Component
- `components/models/models-data-table.tsx` — client island for sorting, filtering, and pagination

## Setup

```bash
bun install
```

## Development

Dev server runs through [portless](https://portless.sh/) at **https://models-table.localhost** (HTTPS on port 443, no port number to remember).

```bash
bun dev
```

On first run, portless may prompt to trust its local CA and bind port 443 (sudo on macOS/Linux). Use plain HTTP if needed:

```bash
bunx portless run --no-tls next dev
```

To bypass portless and use Next.js directly on `http://localhost:3000`:

```bash
bun run dev:next
```

## Scripts

```bash
bun run build      # production build
bun run start      # start production server
bun run lint       # eslint
bun run typecheck  # tsc --noEmit
bun run format     # prettier
```

## Adding components

```bash
bunx shadcn@latest add button
```

Components are placed in the `components` directory.
