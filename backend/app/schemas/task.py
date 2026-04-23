from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    user_id: int
    course_name: str
    task_name: str
    task_type: str
    deadline: datetime
    estimated_time: float
    notes: Optional[str] = None