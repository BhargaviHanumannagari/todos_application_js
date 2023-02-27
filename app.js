const express = require('express');
const path = require('path');
const {open} = require("sqlite");
const sqlite3 = require('sqlite3');
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.get('/todos/',async (request,response) => {
    const requestQuery = `SELECT * FROM todo;`;
    const responseResult = await db.all(requestQuery);
    response.send(responseResult);
})
const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
        requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
};
const hasPriorityProperty = (requestQuery) => {
    return (
        requestQuery.priority !== undefined
    );
};
const hasStatusProperty = (requestQuery) => {
    return (
        requestQuery.status !== undefined
    );
};
const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
const outPutResult = (dbObject) => {
    return {
        id: dbObject.id,
        todo: dbObject.todo,
        priority: dbObject.priority,
        status: dbObject.status,
    };
};
app.get('/todos/',async (request,response) => {
    let data = null;
    let getTodoQuery = "";
    const {search_q = "",priority,status,id,todo} = request.query;
    switch (true) {
    case hasStatusProperty(request.query):
        if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
            getTodoQuery = `SELECT * FROM todo WHERE status = '${status}';`;
            data = await db.all(getTodoQuery);
            response.send(data) ;

        } else {
            response.status(400);
            response.send("Invalid Todo Status");
        }
        break;
    case hasPriorityProperty(request.query):
        if ( priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
            getTodoQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
            data = await db.all(getTodoQuery);
            response.send(data);

        } else {
            response.status(400);
            response.send("Invalid Todo Priority");
        }
        break;
    case hasPriorityAndStatusProperties(request.query):
        if ( priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
            if ( status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
            getTodoQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}';`;
            data = await db.all(getTodoQuery);
            response.send(data);

        } else {
            response.status(400);
            response.send("Invalid Todo Priority");
        }
        break;
    case hasSearchProperty(request.query):
      getTodoQuery = `select * from todo where todo like '%${search_q}%';`;
      data = await database.all(getTodoQuery);
      response.send(data);
      break;

        }
   
});
//api2
app.get("/todos/:todoId/",async (request,response) => {
    const {todoId} = request.params;
    const getTodoQuery = `select * from todo where id=${todoId};`;
    const responseResult = await db.get(getTodoQuery);
    response.send(outPutResult(responseResult));
});
//api3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      
          const postTodoQuery = `
  INSERT INTO
    todo (id, todo, category,priority, status, due_date)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`;
          await database.run(postTodoQuery);
          //console.log(responseResult);
          response.send("Todo Successfully Added");
        }
     
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
});
//api4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  let updateTodoQuery;
  switch (true) {
    // update status
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
    UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}',
     due_date='${dueDate}' WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Status Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
 case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "LOW" || priority === "MEDIUM") {
        updateTodoQuery = `
    UPDATE todo SET todo='${todo}', priority='${priority}'
      WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Priority Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //update todo
    case requestBody.todo !== undefined:
      updateTodoQuery = `
    UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}'
      WHERE id = ${todoId};`;

      await database.run(updateTodoQuery);
      response.send(`Todo Updated`);
      break;
      //api5
      app.delete("/todos/:todoId/", async (request, response) => {
        const { todoId } = request.params;
        const deleteTodoQuery = `
        DELETE FROM
           todo
        WHERE
           id = ${todoId};`;

        await database.run(deleteTodoQuery);
        response.send("Todo Deleted");
      });

