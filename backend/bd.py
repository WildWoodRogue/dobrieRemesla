import psycopg





def get_connection():
    return psycopg.connect(
        dbname="remesla",
        user="postgres",
        password="1234",
        host="localhost",
        port="5432"
    )

def update_class(conn, id: int, title: str, short_description: str, description: str, cost: int, date: str, image_link: str):
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE classes
                SET title = %s,
                    short_description = %s,
                    description = %s,
                    cost = %s,
                    date = %s,
                    image_link = %s
                WHERE id = %s
            """,
                (title, short_description, description, cost, date, image_link, id),
            )
        conn.commit()
    except psycopg.Error as e:
        print(f"Error updating class with ID {id}: {e}")
        conn.rollback()
        raise

def get_all_classes(conn, count=3):
    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT id, title, short_description, description, cost, date, image_link
            FROM classes
            ORDER BY id
            LIMIT %s
        """, (count,))
        classes = cur.fetchall()
    return classes


def delete_class(conn, id):
    with conn.cursor() as cur:
        cur.execute(f"DELETE FROM classes WHERE id = {id}")
    conn.commit()

def return_class(conn, id):
    with conn.cursor() as cur:
        cur.execute("""SELECT title, short_description, description, cost, date, image_link
            FROM classes
            WHERE id = %s
                    """, (id,))
        returned_class = cur.fetchone()
    conn.commit()
    return returned_class


def add_class(conn, title, short_description, description, cost, date, image_link):
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO classes 
                    (title, short_description, description, cost, date, image_link)
                VALUES 
                    (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (title, short_description, description, cost, date, image_link))
            new_id = cur.fetchone()[0]
        conn.commit()
    except  Exception as e:
        print(e)  
    return new_id






def create_classes_table():
    conn = get_connection()
    try:
        with conn.cursor() as cur:  
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS classes (
                    id SERIAL PRIMARY KEY,  -- Auto-incrementing primary key
                    title VARCHAR(255),
                    short_description TEXT,
                    cost INTEGER,
                    description TEXT,
                    image_link TEXT,
                    date VARCHAR(255)
                )
                """
            )
            conn.commit()  # Commit the transaction
            print("Table 'classes' created successfully.")

    except psycopg.Error as e:
        print(f"Error creating table: {e}")
        conn.rollback()  # Rollback in case of an error

