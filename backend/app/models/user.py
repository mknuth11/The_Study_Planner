from app.database import get_connection

def create_user(username, email, password_hash):
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
                INSERT INTO users (username, email, password_hash)
                VALUES (%s, %s, %s)
            """
            cursor.execute(query, (username, email, password_hash))
            connection.commit()
            return {"success": True, "message": "User created successfully!"}
        except Exception as e:
            return {"success": False, "message": str(e)}
        finally:
            cursor.close()
            connection.close()
    else:
        return {"success": False, "message": "Database connection failed"}

def get_user_by_username(username):
    connection = get_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = "SELECT * FROM users WHERE username = %s"
            cursor.execute(query, (username,))
            user = cursor.fetchone()
            return user
        except Exception as e:
            return None
        finally:
            cursor.close()
            connection.close()
    else:
        return None