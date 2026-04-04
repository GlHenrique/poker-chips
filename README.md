<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/GlHenrique/poker-chips/master/src/assets/poker-chips-logo.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/GlHenrique/poker-chips/master/src/assets/poker-chips-logo-light.svg" />
    <img src="https://raw.githubusercontent.com/GlHenrique/poker-chips/master/src/assets/poker-chips-logo.svg" alt="Poker Chips Logo" height="120" />
  </picture>
  <p><strong>Smartly manage poker chips — distribute, configure and time your games.</strong></p>

  <p>
    <a href="https://poker-chips-lemon.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/i18n-pt--BR%20%7C%20en%20%7C%20es-orange?style=for-the-badge" alt="i18n" />
  </p>
</div>

---

## About

**Poker Chips** is a web app designed for groups that play poker in person and need a practical way to calculate chip distribution among players and track round durations.

Unlike generic calculators, the app lets you **fully configure the chip set** (name, value, quantity and color), set each player's initial stack value, and automatically calculate the best chip combination per player — using a backtracking algorithm that respects stock limits.

---

## Features

### Chip Distribution

- Configure custom chips with name, value, quantity and color
- Calculate the ideal chip distribution per player based on stack value, small blind and big blind
- Backtracking algorithm with multiple reserve levels to guarantee valid combinations
- Visual result display with colored chip badges and informative tooltips
- Chip config and form state persist throughout the session

### Timer

- Configurable countdown (minutes and seconds)
- Start, pause, resume and stop controls
- Timer state persists in `localStorage` — keeps running even if you leave and return to the page
- Audio alarm and vibration (on supported devices) when time runs out
- Run history with start and end timestamps

### Internationalization (i18n)

- Full support for **Portuguese (pt-BR)**, **English (en)** and **Spanish (es)**
- Automatic browser language detection
- Language preference saved in `localStorage`
- Currency adapted per language: **BRL**, **USD** and **EUR**
- Default chip names automatically translated when switching languages

### UX & Accessibility

- Light, dark and system-adaptive theme
- Fully responsive layout — works on desktop and mobile
- Smooth fade-in/out animations
- `aria-live` on the timer display for screen reader support

---

## Tech Stack

| Technology                  | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| **React 19**                | UI and state management                          |
| **TypeScript**              | Static typing across the entire project          |
| **Vite**                    | Bundler and dev server                           |
| **Tailwind CSS v4**         | Utility-first styling                            |
| **Radix UI**                | Accessible primitives (Dropdown, Tooltip, Label) |
| **React Router v7**         | Client-side routing                              |
| **i18next + react-i18next** | Internationalization and language detection      |
| **Lucide React**            | Icons                                            |

---

## Project Structure

```
src/
├── components/
│   ├── app/
│   │   ├── ThemeProvider/       # Theme context (light/dark/system)
│   │   ├── ToggleMode/          # Theme toggle button
│   │   └── LanguageSwitcher/    # Language selector dropdown
│   ├── layout/
│   │   └── Layout.tsx           # Header, nav, footer and Outlet
│   └── ui/                      # Base components (Button, Input, Label…)
├── context/
│   └── TimerContext.tsx          # Global timer state with persistence
├── hooks/
│   └── useCurrencyFormatter.ts  # Currency formatting reactive to language
├── locales/
│   ├── pt-BR/translation.json
│   ├── en/translation.json
│   └── es/translation.json
├── pages/
│   ├── Home.tsx
│   ├── Timer.tsx
│   └── ManagePlayers/
│       ├── index.tsx
│       ├── constants.ts         # Default chips with i18n support
│       ├── types.ts
│       └── components/
│           ├── ChipConfigCard.tsx
│           ├── ChipRow.tsx
│           ├── DistributionForm.tsx
│           ├── DistributionResult.tsx
│           └── DistributionError.tsx
└── utils/
    ├── calculateDistribution.ts  # Backtracking algorithm
    ├── formatCurrency.ts
    ├── color.ts
    └── scrollToElement.ts
```

---

## Distribution Algorithm

The chip calculation uses **backtracking with multiple reserve levels**:

1. Converts all values to cents to avoid floating-point errors
2. Tests 4 stock reserve levels: 25%, 20%, 15% and 0%
3. For each level, recursively searches for an exact chip combination that sums to the target stack value
4. Returns the first valid combination found — or an empty array if none is possible

---

## Running Locally

**Requirements:** Node.js 20+ and pnpm

```bash
# Clone the repository
git clone https://github.com/GlHenrique/poker-chips.git
cd poker-chips

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

```bash
# Production build
pnpm build

# Preview the build
pnpm preview
```

---

## Deployment

The project is configured for automatic deployment on **Vercel** via `vercel.json`, which rewrites all routes to `index.html` — required for React Router's client-side routing to work correctly.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <p>Made with ♠ by <a href="https://github.com/GlHenrique">GlHenrique</a></p>
</div>
