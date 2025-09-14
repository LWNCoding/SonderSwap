# SonderSwap

A modern React + TypeScript + TailwindCSS project built with Vite.

## Features

- ⚡ **Vite** - Lightning fast build tool
- ⚛️ **React 18** - Latest React with hooks
- 🔷 **TypeScript** - Type-safe development
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 🧭 **React Router** - Client-side routing
- 📱 **Responsive Design** - Mobile-first approach
- 🎯 **Modern UI** - Clean and professional design

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── Button.tsx      # Reusable button component
│   └── Navbar.tsx      # Responsive navigation
├── layouts/            # Page layouts
│   └── DefaultLayout.tsx
├── pages/              # Page-level components
│   ├── Home.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   ├── About.tsx
│   └── Contact.tsx
├── types/              # TypeScript interfaces
│   └── index.ts
├── lib/                # Utilities and helpers
│   └── utils.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Customization

### Colors
The project uses a custom color palette defined in `tailwind.config.ts`:
- Primary: Indigo-based colors
- Secondary: Purple-based colors

### Components
- All components are built with TypeScript
- Responsive design using TailwindCSS utilities
- Mobile-first approach with hamburger menu for navigation

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Router DOM** - Routing
- **clsx & tailwind-merge** - Conditional styling utilities

## License

MIT



