# FTechnology - Sistema di Autenticazione

Un'applicazione web full-stack con sistema di autenticazione completo, costruita con **Nx Monorepo**, **React**, **NestJS** e **Drizzle ORM**.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 📋 Indice

- [Funzionalità](#-funzionalità)
- [Tecnologie Utilizzate](#-tecnologie-utilizzate)
- [Requisiti](#-requisiti)
- [Installazione](#-installazione)
- [Configurazione Database](#-configurazione-database)
- [Avvio dell'Applicazione](#-avvio-dellapplicazione)
- [Struttura del Progetto](#-struttura-del-progetto)
- [API Documentation](#-api-documentation)
- [Scelte Implementative](#-scelte-implementative)
- [Testing](#-testing)
- [Screenshots](#-screenshots)

## ✨ Funzionalità

### Autenticazione

- ✅ Registrazione utente con validazione completa
- ✅ Login con email e password
- ✅ Funzionalità "Ricordami"
- ✅ Autenticazione JWT con token sicuro
- ✅ Protezione delle route private
- ✅ Logout sicuro

### Gestione Profilo

- ✅ Visualizzazione dati profilo
- ✅ Modifica dati personali (nome, cognome, data di nascita)
- ✅ Upload e rimozione avatar
- ✅ Cronologia ultimi 5 accessi

### UI/UX

- ✅ Design responsive (mobile-first)
- ✅ Dark/Light mode
- ✅ Animazioni fluide con Framer Motion
- ✅ Feedback visivo per tutte le azioni
- ✅ Loading states
- ✅ Gestione errori user-friendly
- ✅ Toast notifications

### Sicurezza

- ✅ Hashing password con bcrypt (12 rounds)
- ✅ Validazione lato client e server
- ✅ Protezione CORS
- ✅ Sanitizzazione input

## 🛠 Tecnologie Utilizzate

### Frontend

| Tecnologia      | Descrizione            |
| --------------- | ---------------------- |
| React 18        | Libreria UI            |
| TypeScript      | Tipizzazione statica   |
| Vite            | Build tool             |
| React Router v6 | Routing                |
| React Hook Form | Gestione form          |
| Zod             | Validazione schema     |
| Tailwind CSS    | Styling                |
| Framer Motion   | Animazioni             |
| Radix UI        | Componenti accessibili |
| Axios           | HTTP client            |
| Lucide React    | Icone                  |

### Backend

| Tecnologia      | Descrizione          |
| --------------- | -------------------- |
| NestJS          | Framework backend    |
| TypeScript      | Tipizzazione statica |
| Drizzle ORM     | Database ORM         |
| PostgreSQL      | Database             |
| Passport JWT    | Autenticazione       |
| bcryptjs        | Hashing password     |
| class-validator | Validazione DTO      |
| Multer          | Upload file          |

### Infrastruttura

| Tecnologia | Descrizione         |
| ---------- | ------------------- |
| Nx         | Monorepo management |
| Jest       | Testing framework   |

## 📦 Requisiti

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0 (locale - vedi istruzioni sotto)

## 🚀 Installazione

### 1. Setup PostgreSQL Locale

PostgreSQL può girare **completamente in locale**. Scegli un metodo (vedi [SETUP_DB.md](./SETUP_DB.md)):

#### Opzione A - Docker (CONSIGLIATO):

```bash
docker run --name ftechnology-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ftechnology -p 5432:5432 -d postgres:15
```

#### Opzione B - Installazione Windows:

1. Scarica da https://www.postgresql.org/download/windows/
2. Installa con password `password` e porta `5432`
3. Crea database `ftechnology`

### 2. Clona e Installa

```bash
git clone <repository-url>
cd ftechnology
npm install
```

### 3. Configura Database

Il file `.env` è già configurato per PostgreSQL locale. Se hai cambiato la password, modifica:

```env
DATABASE_URL=postgresql://postgres:TUA_PASSWORD@localhost:5432/ftechnology
```

### 4. Setup Tabelle

```bash
# Crea le tabelle
npm run db:push

# (Opzionale) Seed con utente test
npm run db:seed
```

Credenziali test: **test@example.com** / **Password123**

### 5. Avvia l'applicazione

```bash
# Avvia frontend e backend contemporaneamente
npm start
```

L'applicazione sarà disponibile su:

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### Comandi Utili

Avvia frontend e backend simultaneamente:

```bash
npm start
```

Oppure separatamente:

```bash
# Terminal 1 - Backend (porta 3000)
npm run start:backend

# Terminal 2 - Frontend (porta 4200)
npm run start:frontend
```

| Comando                  | Descrizione                 |
| ------------------------ | --------------------------- |
| `npm start`              | Avvia frontend + backend    |
| `npm run start:frontend` | Solo frontend (porta 4200)  |
| `npm run start:backend`  | Solo backend (porta 3000)   |
| `npm run build`          | Build produzione            |
| `npm test`               | Esegui test                 |
| `npm run lint`           | Lint del codice             |
| `npm run db:push`        | Applica schema al database  |
| `npm run db:seed`        | Popola dati di test         |
| `npm run db:studio`      | Apri Drizzle Studio (DB UI) |

### Produzione

```bash
# Build
npm run build

# I file saranno in dist/apps/frontend e dist/apps/backend
```

### URL dell'applicazione

- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

## 📁 Struttura del Progetto

```
ftechnology/
├── apps/
│   ├── backend/                 # NestJS Backend
│   │   ├── src/
│   │   │   ├── app/            # App module
│   │   │   ├── auth/           # Autenticazione
│   │   │   │   ├── dto/        # Data Transfer Objects
│   │   │   │   ├── guards/     # Auth guards
│   │   │   │   ├── strategies/ # Passport strategies
│   │   │   │   └── decorators/ # Custom decorators
│   │   │   ├── database/       # Drizzle schema e migrations
│   │   │   ├── users/          # Gestione utenti
│   │   │   └── main.ts         # Entry point
│   │   └── uploads/            # File caricati
│   │
│   └── frontend/               # React Frontend
│       ├── src/
│       │   ├── components/     # Componenti React
│       │   │   ├── ui/         # UI components (shadcn-style)
│       │   │   └── layout/     # Layout components
│       │   ├── contexts/       # React contexts
│       │   ├── hooks/          # Custom hooks
│       │   ├── pages/          # Pagine
│       │   ├── routes/         # Routing
│       │   ├── services/       # API services
│       │   ├── styles/         # CSS globali
│       │   └── lib/            # Utilities
│       └── index.html
│
├── libs/
│   └── shared/                 # Libreria condivisa
│       └── src/
│           ├── types/          # TypeScript types
│           ├── validation/     # Schema Zod
│           ├── constants/      # Costanti
│           └── utils/          # Utilities
│
├── drizzle.config.ts           # Configurazione Drizzle
├── nx.json                     # Configurazione Nx
├── package.json
└── tsconfig.base.json
```

## 📡 API Documentation

### Autenticazione

#### POST /api/auth/register

Registra un nuovo utente.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registrazione completata con successo",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Mario",
      "lastName": "Rossi",
      "dateOfBirth": "1990-05-15",
      "avatarUrl": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800000
  }
}
```

#### POST /api/auth/login

Effettua il login.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "rememberMe": true
}
```

#### GET /api/auth/me

Ottiene l'utente corrente (richiede autenticazione).

**Headers:**

```
Authorization: Bearer <token>
```

#### POST /api/auth/logout

Effettua il logout (richiede autenticazione).

### Utenti

#### GET /api/users/me

Ottiene il profilo utente.

#### PATCH /api/users/profile

Aggiorna il profilo utente.

**Request Body:**

```json
{
  "firstName": "Mario",
  "lastName": "Rossi",
  "dateOfBirth": "1990-05-15"
}
```

#### POST /api/users/avatar

Carica un nuovo avatar.

**Request:** `multipart/form-data`

- `avatar`: File immagine (max 5MB, jpg/png/gif/webp)

#### DELETE /api/users/avatar

Rimuove l'avatar corrente.

#### GET /api/users/login-history

Ottiene la cronologia degli accessi.

**Query Parameters:**

- `limit`: Numero di risultati (default: 5)

### Health Check

#### GET /api/health

Verifica lo stato dell'API.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

## 💡 Scelte Implementative

### Architettura Monorepo con Nx

Ho scelto **Nx** per gestire il monorepo perché:

- Condivisione del codice tra frontend e backend (types, validation)
- Build incrementali e caching intelligente
- Dependency graph automatico
- Generatori e plugin per React e NestJS

### Drizzle ORM

Ho scelto **Drizzle** invece di Prisma perché:

- Più leggero e veloce
- SQL-like queries per maggiore controllo
- TypeScript-first con inferenza dei tipi eccellente
- Supporto nativo per PostgreSQL

### Autenticazione JWT

Implementazione stateless con JWT per:

- Scalabilità orizzontale
- Nessuno stato sul server
- Token configurabile con "Remember Me"

### Validazione con Zod

Schema condivisi tra frontend e backend per:

- Single source of truth per le regole di validazione
- Type inference automatica
- Validazione runtime sicura

### Componenti UI (shadcn-style)

Ho creato componenti basati su Radix UI perché:

- Accessibilità built-in
- Unstyled ma completamente personalizzabili
- Composizione componenti flessibile
- Nessun vendor lock-in

### Stato dell'Autenticazione

Uso di **React Context** per:

- Semplicità di implementazione
- Performance adeguata per auth state
- Evitare dipendenze esterne (Redux, Zustand)

## 🧪 Testing

### Esegui tutti i test

```bash
npm test
```

### Test con coverage

```bash
npm test -- --coverage
```

### Test specifici

```bash
# Solo frontend
nx test frontend

# Solo backend
nx test backend
```

## 📸 Screenshots

### Login Page

Design moderno con split-screen layout, supporto dark mode.

### Register Page

Form di registrazione con upload avatar opzionale e validazione real-time.

### Dashboard

Layout responsive con sidebar, profilo utente modificabile e cronologia accessi.

## 🔒 Sicurezza

- Password hashate con bcrypt (12 salt rounds)
- JWT tokens con scadenza configurabile
- CORS configurato per ambiente specifico
- Input validation sia client che server-side
- SQL injection prevention tramite ORM
- XSS prevention tramite React

## 📝 License

MIT License - Vedi [LICENSE](LICENSE) per dettagli.

---

**Sviluppato con ❤️ per FTechnology**
