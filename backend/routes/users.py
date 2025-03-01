from fastapi import APIRouter
from database import get_db_connection
from queries import get_all_users_query, insert_user_query

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def get_users():
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = str(get_all_users_query())  # Convert PyPika query to SQL
    cur.execute(query)
    users = cur.fetchall()
    
    conn.close()
    return users

@router.post("/")
def create_user(name: str, email: str):
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = str(insert_user_query(name, email))
    cur.execute(query)
    
    conn.commit()
    conn.close()
    return {"message": "User created successfully"}
