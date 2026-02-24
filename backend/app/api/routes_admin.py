# Purpose: Admin API routes for dev interactions
from fastapi import APIRouter
import subprocess
import os
import sys

router = APIRouter(prefix="/admin", tags=["Admin"])
SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "scripts", "generate_dummy_data.py")

@router.post("/reset-dummy-data")
def reset_dummy_data(rows: int = 10000):
    """ Developer-only endpoint to trigger dummy data generation. """
    try:
        # We run the script in a subprocess to reuse the existing generation logic
        result = subprocess.run(
            [sys.executable, SCRIPT_PATH, "--rows", str(rows)],
            capture_output=True, text=True, check=True
        )
        return {"status": "success", "message": "Dummy data regenerated successfully.", "output": result.stdout}
    except subprocess.CalledProcessError as e:
        return {"status": "error", "message": "Data generation failed.", "output": e.stderr}

def register_routes(app):
    app.include_router(router)

