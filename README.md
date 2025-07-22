
# VirtuDex  <img src="./public/database.png" alt="VirtuDex Logo" width="48" height="48" />

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/tauri-%2324C8DB.svg?style=for-the-badge&logo=tauri&logoColor=%23FFFFFF)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)
![Material-UI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

A personal CRM desktop application for managing your professional network and personal connections.

## Features

- **Contact Management**: Store detailed contact information including name, title, company, email, phone, and LinkedIn profiles
- **Smart Search**: Search across all fields or target specific attributes like company, location, or notes
- **Relationship Tracking**: Record when and where you met someone, add tags for categorization
- **Notes & Context**: Keep detailed notes about conversations, shared interests, or follow-up actions
- **Cross-Platform**: Built with Tauri for native desktop performance on macOS, Windows, and Linux

## Tech Stack

- **Frontend**: React with TypeScript and Material-UI
- **Backend**: Rust with Tauri framework
- **Database**: SQLite with SQLx for type-safe queries
- **Build System**: Vite for fast development and optimized builds

## Installation

### Download

Download the latest installer from the releases page:

- macOS: `.dmg` installer
- Windows: `.msi` installer (<b>Coming Soon</b>)
- Linux: `.deb` or `.rpm` packages (<b>Coming Soon</b>)

### Build from Source

#### Prerequisites

- Node.js (v16+)
- Rust (latest stable)
- Tauri CLI: `cargo install tauri-cli`

#### Setup

```bash
# Clone the repository
git clone https://github.com/Brady-Spears66/virtudex.git
cd virtudex

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Usage

1. **Add Contacts**: Click "Add Person" to create new contact entries
2. **Search & Filter**: Use the search bar to find specific contacts or filter by company, location, etc.
3. **Update Information**: Edit contact details as relationships evolve
4. **Organize with Tags**: Use tags to categorize contacts (e.g., "conference", "client", "mentor")
5. **Track Interactions**: Record meeting dates and locations for context
6. **Bulk Record Import** Click "Bulk Import JSON" to import multiple records from a json file.

## Database Schema

The application uses a local SQLite database with the following structure:

```sql
CREATE TABLE people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    title TEXT,
    company TEXT,
    email TEXT,
    phone TEXT,
    tags TEXT,
    notes TEXT,
    date_met TEXT,
    location_met TEXT,
    linkedin TEXT
);
```

## Development

### Project Structure

```
├── src/                 # React frontend
├── src-tauri/          # Rust backend
│   ├── src/main.rs     # Tauri commands and database logic
│   └── tauri.conf.json # App configuration
├── public/             # Static assets
└── package.json        # Node.js dependencies
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build frontend for production
- `npm run tauri dev` - Run Tauri app in development
- `npm run tauri build` - Build production app with installer

## Roadmap

- [ ] Export functionality (CSV, JSON)
- [ ] Contact photos and avatars

---

© 2025 Brady Spears. All rights reserved.
