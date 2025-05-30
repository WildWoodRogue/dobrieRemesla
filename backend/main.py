
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from bd import *
from telegram import *

class Class(BaseModel):
    title:str | None = None
    short_description:str | None = None
    cost:int | None = None
    description:str | None = None
    image_link:str | None = None
    date:str | None = None 
    id:int | None = None
    count:int | None = None


class User(BaseModel):
    phone:str | None = None
    name:str | None = None
    lesson:int | None = None
    message:str | None = None

app = FastAPI()


origins = [
        "http://localhost",
    "http://localhost:8000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)



@app.post("/allClass")
async def allClass(clas: Class):
    conn = get_connection()
    count = clas.count
    print(count)
    jsonArray = []
    try:
        class_info = get_all_classes(conn,count)
        
        for i in class_info:
            print(i)
            id = i[0]
            title = i[1]
            short_description=i[2]
            description=i[3]
            cost=i[4]
            date=i[5]
            image_link=i[6]
            json = {"id":id,"title":title,"short_description":short_description,"description":description,"cost":cost,"date":date,"image_link":image_link}
            jsonArray.append(json)
        
        return jsonArray
    except Exception as e:
        print(e)
        return {'answer':"false"}


@app.post("/classId")
async def classId(clas: Class):
    conn = get_connection()
    print(clas.id)
    id = clas.id
    try:
        class_info = return_class(conn,id)
        title = class_info[0]
        short_description=class_info[1]
        description=class_info[2]
        cost=class_info[3]
        date=class_info[4]
        image_link=class_info[5]
        returnedJSON = {"title":title,"short_description":short_description,"cost":cost,"description":description,"image_link":image_link,"date":date}
        return returnedJSON
    except Exception as e:
        print("Error:", e)
        return {"answer":"false"}
    


@app.post("/getPhone")
async def classId(user: User):
    conn = get_connection()
    phone = user.phone
    name = user.name
    id = user.lesson
    message = user.message
    try:
        info = return_class(conn,id)
        lesson = info[0]
    except:
        lesson = " - " 
    text = "Имя - " + name+"\n"+"\n"+"Телефон - "+phone+"\n"+"\n"+"Название занятия - "+lesson+"\n"+"\n"+"Сообщдение:"+"\n"+message
    for i in users_id:
        await send_message_to_user(i, text)


@app.post("/addClass")
async def create_class(class_data: Class):
    conn = get_connection()
    new_id = add_class(
        conn,
        class_data.title,
        class_data.short_description,
        class_data.description,
        class_data.cost,
        class_data.date,
        class_data.image_link,
    )
    return {"id": new_id, "message": "Class created successfully"}

@app.post("/updateClass")  # Changed to POST
async def update_existing_class(class_data: Class):  # Now takes the entire class, including ID
    conn = get_connection()

    update_class(
        conn,
        class_data.id,
        class_data.title,
        class_data.short_description,
        class_data.description,
        class_data.cost,
        class_data.date,
        class_data.image_link,
    )
    return {"message": f"Class with ID {class_data.id} updated successfully"}

@app.post("/deleteClass")  
async def delete_existing_class(class_data: Class): 
    conn = get_connection()
    delete_class(conn, class_data.id)


if __name__ == "__main__":
    create_classes_table()
    uvicorn.run(app, host="0.0.0.0", port=8000)