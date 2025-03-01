from pypika import Query, Table

users = Table("users")

def get_all_users_query():
    return Query.from_(users).select(users.id, users.name, users.email)

def insert_user_query(name, email):
    return Query.into(users).columns("name", "email").insert(name, email)
