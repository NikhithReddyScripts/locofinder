# Locofinder Backend

**What this directory is for:**
This directory contains the `backend` part of the Locofinder monorepo. It is built with FastAPI and Redis.

**How to run locally:**

1. **Start Redis:**
   From the monorepo root, run:
   ```bash
   docker-compose up -d redis
   ```

2. **Install dependencies:**
   It is recommended to use a virtual environment.
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`. You can check the health endpoint at `http://localhost:8000/health`.

**What files live here and what each does:**
- `app/main.py`: FastAPI application entrypoint.
- `app/api/`: API routes (e.g., `/health`).
- `app/core/`: Application configuration and logging.
- `app/db/`: Database and Redis connection management.
- `Dockerfile`: Container definition.
- `requirements.txt`: Python dependencies.

**How work in this directory is expected to be implemented:**
Implement small, testable modules with clear boundaries. Every endpoint must validate request/response with Pydantic models.

**Outputs:**
Outputs are validated JSON payloads served by the API.

**Ownership:**
backend team
