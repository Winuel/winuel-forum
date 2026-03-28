# Winuel Forum

> **⚠️ This repository has been migrated to a new organization architecture**

> This project has been split into multiple independent repositories and migrated to the **Winuel** organization. Please see the migration notice below.

<div align="center">

![Winuel Logo](https://img.shields.io/badge/Winuel-Forum-blue)
![Vue](https://img.shields.io/badge/Vue-3.5.30-4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020)
![License](https://img.shields.io/badge/License-MIT-green)

A modern lightweight forum system built on Cloudflare Workers Serverless platform

[Website](https://www.winuel.com) • [Documentation](https://docs.winuel.com) • [Demo](https://hub.winuel.com) • [Contribute](https://github.com/Winuel/winuel-forum/contributing)

</div>

## 📦 Project Migration (Important)

This project was split and migrated on **March 26, 2026**. Please visit the new repository addresses:

### New Repository Addresses

| Repository Name | URL | Purpose |
|----------------|-----|---------|
| **winuel-packages** | [github.com/Winuel/winuel-packages](https://github.com/Winuel/winuel-packages) | Shared Packages |
| **winuel-forum** | [github.com/Winuel/winuel-forum](https://github.com/Winuel/winuel-forum) | Forum System |
| **winuel-admin** | [github.com/Winuel/winuel-admin](https://github.com/Winuel/winuel-admin) | Admin Dashboard |
| **winuel-docs** | [github.com/Winuel/winuel-docs](https://github.com/Winuel/winuel-docs) | Documentation Site |
| **winuel-website** | [github.com/Winuel/winuel-website](https://github.com/Winuel/winuel-website) | Official Website |

### Why Split?

To better manage the project and promote collaboration, we split the project into multiple independent repositories:
- **Modular Management**: Each project is managed independently with clear responsibilities
- **Better Collaboration**: Different teams can develop and deploy independently
- **Version Control**: Each project can release versions independently
- **Clear Dependencies**: Shared packages as independent projects can be referenced by multiple projects

### How to Use After Migration?

1. **Develop Forum System**: Visit [Winuel/winuel-forum](https://github.com/Winuel/winuel-forum)
2. **Manage Forum**: Visit [Winuel/winuel-admin](https://github.com/Winuel/winuel-admin) (Admin Dashboard)
3. **Use Shared Packages**: Visit [Winuel/winuel-packages](https://github.com/Winuel/winuel-packages)
4. **View Documentation**: Visit [docs.winuel.com](https://docs.winuel.com)
5. **Learn About Product**: Visit [www.winuel.com](https://www.winuel.com)

> **Note**: This repository only retains historical records. For future development, please visit the new repositories above.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technical Architecture](#technical-architecture)
- [Core Features](#core-features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Security Features](#security-features)
- [Performance Metrics](#performance-metrics)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Winuel Forum is a modern lightweight forum system with a front-end and back-end separation architecture, built on the Cloudflare Workers Serverless platform. It features high performance, low cost, and easy deployment, making it suitable for small to medium-sized communities.

### Key Features

- 🚀 **Serverless Architecture**: No server management, automatic scaling
- 🌍 **Global Deployment**: Cloudflare global edge network, low latency access
- 💰 **Cost-Effective**: Pay-as-you-go pricing, zero operational cost
- 🔒 **Secure and Reliable**: Multi-layer security protection, industry-standard security
- 📱 **Responsive Design**: Perfect adaptation for mobile, tablet, and desktop devices
- 🎨 **Modern UI**: Clean and beautiful interface, supports dark/light themes
- 🧩 **Modular Design**: Highly modular, easy to maintain and extend

## Technical Architecture

### Frontend Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| Vue | 3.5.30 | Progressive JavaScript Framework |
| TypeScript | 5.9.3 | JavaScript superset with type safety |
| Vite | 8.0.0 | Next-generation frontend build tool |
| Pinia | 3.0.4 | Vue official state management library |
| Vue Router | 5.0.3 | Vue official router |
| TailwindCSS | 3.4.17 | Atomic CSS framework |

### Backend Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| Hono | 4.12.8 | Lightweight web framework |
| TypeScript | 5.9.3 | Type-safe JavaScript |
| Cloudflare Workers | - | Serverless computing platform |
| D1 | - | Cloudflare edge database |
| KV | - | Cloudflare key-value storage |
| R2 | - | Cloudflare object storage (reserved) |

## Core Features

### User System
- ✅ User registration/login (email verification)
- ✅ JWT token authentication
- ✅ Profile management
- ✅ User permission management (user, admin, moderator)

### Post System
- ✅ Create posts (Markdown support)
- ✅ Edit/delete posts
- ✅ Post list (pagination, sorting, filtering)
- ✅ Post detail display
- ✅ Post likes
- ✅ Tag system

### Comment System
- ✅ Post/edit/delete comments
- ✅ Nested reply support
- ✅ Comment likes
- ✅ Comment count

### Category Management
- ✅ Board/category management
- ✅ Category browsing
- ✅ Category filtering

### Notification System
- ✅ System notifications
- ✅ Reply notifications
- ✅ Like notifications
- ✅ Unread indicators

### UI/UX Features
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark/light theme toggle
- ✅ Smooth animations
- ✅ Accessibility support
- ✅ Loading state indicators
- ✅ Error notification components

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Wrangler CLI (for backend deployment)

### Install Dependencies

```bash
# Clone project
git clone git@github.com:LemonStudio-hub/winuel.git
cd winuel

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Local Development

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend will start at `http://localhost:5173`.

#### Start Backend Development Server

```bash
cd backend
npm run build
wrangler dev
```

Backend will start at `http://localhost:8787`.

### Environment Variable Configuration

#### Frontend Environment Variables

Create `frontend/.env.development`:

```env
VITE_API_BASE_URL=http://localhost:8787
```

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://api.winuel.com
```

#### Backend Environment Variables

Set JWT secret:

```bash
cd backend
wrangler secret put JWT_SECRET
# Enter at least 32 characters for the secret
```

## Project Structure

```
winuel/
├── frontend/              # Frontend project
│   ├── src/
│   │   ├── api/          # API wrapper
│   │   ├── assets/       # Static resources
│   │   ├── components/   # Components
│   │   ├── composables/  # Composable functions
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   ├── router/       # Router configuration
│   │   ├── stores/       # Pinia state management
│   │   ├── styles/       # Global styles
│   │   ├── utils/        # Utility functions
│   │   ├── App.vue       # Root component
│   │   └── main.ts       # Entry file
│   ├── public/           # Public resources
│   ├── index.html        # HTML template
│   ├── package.json      # Frontend dependencies
│   ├── vite.config.ts    # Vite configuration
│   ├── tailwind.config.js # TailwindCSS configuration
│   └── tsconfig.json     # TypeScript configuration
├── backend/              # Backend project
│   ├── src/
│   │   ├── routes/       # Route modules
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Middleware
│   │   ├── utils/        # Utility functions
│   │   ├── db/           # Database related
│   │   ├── types.ts      # Type definitions
│   │   └── index.ts      # Entry file
│   ├── package.json      # Backend dependencies
│   ├── wrangler.toml     # Cloudflare Workers configuration
│   └── tsconfig.json     # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [API Documentation](./API.md)
- [Deployment Documentation](./DEPLOYMENT.md)

## Deployment

### Frontend Deployment

Frontend can be deployed to any static hosting service, such as Cloudflare Pages, Vercel, Netlify, etc.

```bash
cd frontend
npm run build
# Deploy the dist directory to static hosting service
```

### Backend Deployment

Deploy to Cloudflare Workers using Wrangler CLI:

```bash
cd backend
npm run build
wrangler deploy
```

For detailed deployment steps, please refer to [Deployment Documentation](./DEPLOYMENT.md).

## Security Features

### Implemented Security Measures

- ✅ JWT token authentication (environment variable manages secret)
- ✅ Password strength validation (at least 8 characters, letters and numbers only, includes weak password check)
- ✅ Rate limiting (prevents brute force attacks)
- ✅ CORS whitelist mechanism
- ✅ Input validation and sanitization
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Standardized error messages (no sensitive information leakage)
- ✅ HTTPS enforced encryption

### Security Configuration

| Configuration | Value |
|--------------|-------|
| Auth endpoint rate limit | 5 requests/minute |
| Normal endpoint rate limit | 100 requests/15 minutes |
| Password hash algorithm | bcrypt (10 rounds) |
| JWT expiration time | 7 days |
| JWT algorithm | HS256 |

## Performance Metrics

| Metric | Value |
|--------|-------|
| Worker startup time | 14 ms |
| Average API response time | < 100 ms |
| Database query latency | < 50 ms (edge) |
| KV cache read | < 10 ms |
| Frontend bundle size | 42 KB (gzip) |

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

- Follow ESLint and Prettier configuration
- Use TypeScript strict mode
- Write clear commit messages
- Add tests for new features

## Development Roadmap

### ✅ Completed

- [x] User authentication system
- [x] Post management
- [x] Comment system
- [x] Category management
- [x] Basic UI
- [x] Security features
- [x] Responsive design

### 🚧 In Progress

- [ ] Search functionality
- [ ] File upload (R2)
- [ ] User follow system

### 📋 Planned

- [ ] Private messaging
- [ ] Recommendation algorithm
- [ ] Admin panel
- [ ] PWA support
- [ ] Unit tests
- [ ] Multi-language support
- [ ] AI feature integration

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

- Project Homepage: [https://github.com/LemonStudio-hub/winuel](https://github.com/LemonStudio-hub/winuel)
- Issue Tracker: [Issues](https://github.com/LemonStudio-hub/winuel/issues)

---

<div align="center">

**Made with ❤️ by Lemon Studio**

</div>