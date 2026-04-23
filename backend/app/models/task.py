from app.database import get_connection

def create_task(user_id, course_name, task_name, task_type, deadline, estimated_time, notes):
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
                INSERT INTO tasks (user_id, course_name, task_name, task_type, deadline, estimated_time, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(query, (user_id, course_name, task_name, task_type, deadline, estimated_time, notes))
            connection.commit()
            return {"success": True, "message": "Task created successfully!"}
        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            cursor.close()
            connection.close()
    else:
        return {"success": False, "message": "Database connection failed"}

def get_tasks_by_user(user_id):
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT * FROM tasks 
                WHERE user_id = %s AND is_completed = FALSE
                ORDER BY deadline ASC, estimated_time ASC
            """
            cursor.execute(query, (user_id,))
            tasks = cursor.fetchall()
            return tasks
        except Exception as e:
            return []
        finally:
            cursor.close()
            connection.close()
    else:
        return []

def mark_task_complete(task_id):
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = "UPDATE tasks SET is_completed = TRUE WHERE id = %s"
            cursor.execute(query, (task_id,))
            connection.commit()
            return {"success": True, "message": "Task marked as complete!"}
        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            cursor.close()
            connection.close()
    else:
        return {"success": False, "message": "Database connection failed"}