"""
backend/user_circuits_router.py — Cloud Circuit Projects API endpoints.
Provides endpoints for saving, loading, listing, duplicating, and deleting circuits from student/user accounts.
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import database
from auth_router import get_current_user

router = APIRouter(prefix="/api/circuits", tags=["user_circuits"])

class SaveCircuitRequest(BaseModel):
    id: int | None = None
    title: str = Field(..., min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)
    circuit_data: str | dict | list

class UpdateCircuitMetaRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: str = Field(default="", max_length=500)

@router.get("")
def list_circuits(current_user: dict = Depends(get_current_user)):
    """List all circuits saved to the current user's cloud account."""
    user_id = current_user["id"]
    return database.list_user_circuits(user_id)

@router.get("/{circuit_id}")
def get_circuit(circuit_id: int, current_user: dict = Depends(get_current_user)):
    """Fetch complete circuit JSON by ID."""
    user_id = current_user["id"]
    circuit = database.get_user_circuit(circuit_id, user_id=user_id)
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit project not found or access denied.")
    
    # Parse circuit_data JSON if string
    try:
        if isinstance(circuit["circuit_data"], str):
            circuit["circuit_data"] = json.loads(circuit["circuit_data"])
    except Exception:
        pass
    
    return circuit

@router.post("")
def save_circuit(req: SaveCircuitRequest, current_user: dict = Depends(get_current_user)):
    """Save or overwrite circuit in user's cloud account."""
    user_id = current_user["id"]
    
    # Serialize circuit_data if dict/list
    if isinstance(req.circuit_data, (dict, list)):
        raw_data = json.dumps(req.circuit_data)
    else:
        raw_data = str(req.circuit_data)

    res = database.save_user_circuit(
        user_id=user_id,
        title=req.title,
        circuit_data=raw_data,
        description=req.description,
        circuit_id=req.id
    )
    return {
        "status": "success",
        "message": f"Circuit '{req.title}' saved to your cloud account.",
        "project": res
    }

@router.post("/{circuit_id}/duplicate")
def duplicate_circuit(circuit_id: int, current_user: dict = Depends(get_current_user)):
    """Clone an existing circuit project."""
    user_id = current_user["id"]
    res = database.duplicate_user_circuit(circuit_id, user_id)
    if not res:
        raise HTTPException(status_code=404, detail="Circuit project not found.")
    return {
        "status": "success",
        "message": f"Circuit duplicated as '{res['title']}'.",
        "project": res
    }

@router.delete("/{circuit_id}")
def delete_circuit(circuit_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a circuit from the cloud account."""
    user_id = current_user["id"]
    deleted = database.delete_user_circuit(circuit_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Circuit project not found or already deleted.")
    return {
        "status": "success",
        "message": "Circuit project deleted successfully."
    }
