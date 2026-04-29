from fastapi import APIRouter
from app.schemas.task import TaskCreate
from app.models.task import create_task, get_tasks_by_user, mark_task_complete

router = APIRouter()

@router.post("/add")
def add_task(task: TaskCreate):
    result = create_task(
        task.user_id,
        task.course_name,
        task.task_name,
        task.task_type,
        task.deadline,
        task.estimated_time,
        task.notes
    )
    return result

@router.get("/{user_id}")
def get_tasks(user_id: int):
    tasks = get_tasks_by_user(user_id)
    if not tasks:
        return {"success": False, "message": "No tasks found", "tasks": []}
    return {"success": True, "tasks": tasks}

@router.put("/complete/{task_id}")
def complete_task(task_id: int):
    result = mark_task_complete(task_id)
    return result