var format = require("date-fns/format");
var isValid = require("date-fns/isValid");
const express = require("express");

const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at 3000 port.....");
    });
  } catch (e) {
    console.log(`Database Error Message : ${e}`);
  }
};

initializeDBAndServer();

//API 1 Get Todo lists API based on the requirement

app.get("/todos", async (req, res) => {
  const params = req.query;
  const { search_q = "", status = "", priority = "", category = "" } = params;
  const isValidPriority =
    priority === "HIGH" ||
    priority === "MEDIUM" ||
    priority === "LOW" ||
    priority === "";
  const isValidStatus =
    status === "TO DO" ||
    status === "IN PROGRESS" ||
    status === "DONE" ||
    status === "";
  const isValidCategory =
    category === "WORK" ||
    category === "HOME" ||
    category === "LEARNING" ||
    category === "";

  if (isValidPriority && isValidStatus && isValidCategory) {
    const getTodoDetails = `
        select id,todo,priority,status,category,due_date as dueDate
        from todo
        where todo LIKE '%${search_q}%' and status like '%${status}%' and priority like '%${priority}%' and category like '%${category}%';`;
    const result = await db.all(getTodoDetails);

    res.send(result);
  } else if (isValidPriority === false) {
    // invalid priority
    res.status(400);
    res.send("Invalid Todo Priority");
  } else if (isValidStatus === false) {
    // invalid status
    res.status(400);
    res.send("Invalid Todo Status");
  } else if (isValidCategory === false) {
    // invalid category
    res.status(400);
    res.send("Invalid Todo Category");
  }
});

// api 2 get todo by id
app.get("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const getTodoById = `
     select id,todo,priority,status,category,due_date as dueDate
     from todo 
     where id=${todoId};`;
  const result = await db.get(getTodoById);
  res.send(result);
});

// api 3 get agenda by date

app.get("/agenda", async (req, res) => {
  const { date } = req.query;
  console.log(date);
  const isValidDate = isValid(new Date(date));
  if (isValidDate) {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    console.log(formattedDate);
    const getTodosByDate = `
        select id,todo,priority,status,category,due_date as dueDate
        from todo
        where due_date='${formattedDate}';`;
    const result = await db.all(getTodosByDate);
    res.send(result);
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

//a pi 4 Creating todo

app.post("/todos", async (req, res) => {
  const todoDetails = req.body;
  console.log(todoDetails);
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  const isValidDate = isValid(new Date(dueDate));
  const isValidPriority =
    priority === "HIGH" || priority === "MEDIUM" || priority === "LOW";
  const isValidStatus =
    status === "TO DO" || status === "IN PROGRESS" || status === "DONE";
  const isValidCategory =
    category === "WORK" || category === "HOME" || category === "LEARNING";

  if (isValidPriority && isValidStatus && isValidCategory && isValidDate) {
    // Given status, priority, category and dueDate are valid then we need to add this todo
    const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
    console.log(formattedDate);
    const createTodo = `
    insert into todo
    (id,todo,priority,status,category,due_date)
    values (${id},'${todo}','${priority}','${status}','${category}','${formattedDate}')`;
    await db.run(createTodo);
    res.send("Todo Successfully Added");
  } else if (isValidPriority === false) {
    // invalid priority
    res.status(400);
    res.send("Invalid Todo Priority");
  } else if (isValidStatus === false) {
    // invalid status
    res.status(400);
    res.send("Invalid Todo Status");
  } else if (isValidCategory === false) {
    // invalid category
    res.status(400);
    res.send("Invalid Todo Category");
  } else if (isValidDate === false) {
    // invalid date
    res.status(400);
    res.send("Invalid Due Date");
  }
});

//api 5 update todo

app.put("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const todoUpdateDetails = req.body;
  const { todo, status, priority, category, dueDate } = todoUpdateDetails;
  const upTodo = todo;
  const upStatus = status;
  const upPriority = priority;
  const upCategory = category;
  const upDueDate = dueDate;

  // const allUpdate = todo !== undefined && status !== undefined && priority !== undefined && category !== undefined && dueDate!== undefined
  const getTodoDetailsById = `
    select  id,todo,priority,status,category,due_date as dueDate
    from todo
    where id=${todoId};`;
  const preTodoDetails = await db.get(getTodoDetailsById);

  if (upTodo !== undefined) {
    const updateStatus = `
        update todo
        set todo='${upTodo}'
        where id=${todoId}`;
    await db.run(updateStatus);
    res.send("Todo Updated");
  } else if (upStatus !== undefined) {
    const isValidStatus =
      upStatus === "TO DO" || upStatus === "IN PROGRESS" || upStatus === "DONE";
    if (isValidStatus) {
      const updateStatus = `
        update todo
        set status='${upStatus}'
        where id=${todoId}`;
      await db.run(updateStatus);
      res.send("Status Updated");
    } else {
      res.status(400);
      res.send("Invalid Todo Status");
    }
  } else if (upPriority !== undefined) {
    const isValidPriority =
      upPriority === "HIGH" || upPriority === "MEDIUM" || upPriority === "LOW";
    if (isValidPriority) {
      const updateStatus = `
        update todo
        set priority='${upPriority}'
        where id=${todoId}`;
      await db.run(updateStatus);
      res.send("Priority Updated");
    } else {
      res.status(400);
      res.send("Invalid Todo Priority");
    }
  } else if (upCategory !== undefined) {
    const isValidCategory =
      upCategory === "WORK" ||
      upCategory === "HOME" ||
      upCategory === "LEARNING";
    if (isValidCategory) {
      const updateCategory = `
        update todo
        set category='${upCategory}'
        where id=${todoId}`;
      await db.run(updateCategory);
      res.send("Category Updated");
    } else {
      res.status(400);
      res.send("Invalid Todo Category");
    }
  } else if (upDueDate !== undefined) {
    const isValidDate = isValid(new Date(upDueDate));
    if (isValidDate) {
      const formattedDate = format(new Date(upDueDate), "yyyy-MM-dd");
      const updateStatus = `
        update todo
        set due_date='${formattedDate}'
        where id=${todoId}`;
      await db.run(updateStatus);
      res.send("Due Date Updated");
    } else {
      res.status(400);
      res.send("Invalid Due Date");
    }
  } else {
    res.status(400);
    res.send("Something went Wrong!!!");
  }
});

// api 6 delete todo by id

app.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const deleteTodoById = `
    delete from todo
    where id=${todoId};`;
  await db.run(deleteTodoById);
  res.send("Todo Deleted");
});

module.exports = app;
