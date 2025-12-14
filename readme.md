# Full Stack Monorepo: Next.js + FastAPI

This is a polyglot monorepo combining a modern **Next.js (React)** frontend with a high-performance **FastAPI (Python)** backend.

It is orchestrated from the root using **Yarn** and **Concurrently**.

## 📂 Project Structure

```text
.
├── package.json         # Root orchestrator (scripts)
├── .gitignore           # Global git ignore rules
│
├── frontend/            # Next.js 15 + Tailwind CSS v4 + TypeScript
│   ├── src/app          # App Router
│   ├── src/components   # Atomic Design System
│   └── next.config.ts   # API Proxy Configuration
│
└── backend/             # FastAPI + Python 3
    ├── main.py          # API Entry Point
    ├── venv/            # Virtual Environment (Auto-generated)
    └── requirements.txt # Python Dependencies
```

## 🚀 Quick Start

### 1. Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18+)
- **Yarn**
- **Python** (v3.8+)

### 2. One-Command Setup

This command installs Node dependencies, creates the Python virtual environment (`venv`), and installs Python requirements.

```bash
yarn setup (setup-mac for macOS)
```

### 3. Run Development Server

Start both the Frontend (Next.js) and Backend (FastAPI) simultaneously.

```bash
yarn dev (dev-mac for macOS)
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Development Workflow

### Adding Frontend Libraries

Since the frontend is its own workspace:

```bash
cd frontend
yarn add <package-name>
# Example: yarn add framer-motion
```

### Adding Backend Libraries

Activate the virtual environment manually to add packages:

```bash
cd backend

# Mac/Linux
source venv/bin/activate
pip install <package-name>
pip freeze > requirements.txt

# Windows
.\venv\Scripts\activate
pip install <package-name>
pip freeze > requirements.txt
```

---

## 📜 Scripts Reference (Root)

| Command             | Description                                       |
| :------------------ | :------------------------------------------------ |
| `yarn setup`        | Installs everything (Node modules + Python venv). |
| `yarn dev`          | Runs both servers in parallel.                    |
| `yarn dev:frontend` | Runs only Next.js.                                |
| `yarn dev:backend`  | Runs only FastAPI.                                |
