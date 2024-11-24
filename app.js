const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const dbPath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())
module.exports = app
let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()
//API 1
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case priority !== undefined && status !== undefined:
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}'
          AND priority = '${priority}';
      `
      break
    case priority !== undefined:
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
          todo LIKE '%${search_q}%'
          AND priority = '${priority}';
      `
      break
    case status !== undefined:
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
          todo LIKE '%${search_q}%'
          AND status = '${status}';
      `
      break
    default:
      getTodosQuery = `
        SELECT *
        FROM todo
        WHERE
          todo LIKE '%${search_q}%';
      `
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})
//end api 1

//API 2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodosQuery4 = `
  SELECT *
  FROM todo 
  WHERE
  id=${todoId};
  `
  const todosArray4 = await db.get(getTodosQuery4)
  response.send(todosArray4)
})

app.post('/todos/', async (request, response) => {
  const districtDetails = request.body
  const {id, todo, priority, status} = districtDetails
  const addTodoQuery = `
  INSERT INTO 
  todo(id, todo,priority,status)
  VALUES(${id},'${todo}','${priority}','${status}')
  `
  await db.run(addTodoQuery)
  response.send('Todo Successfully Added')
})

//API 4

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body

  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break

    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break

    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }

  const previousTodoQuery = `
SELECT * 
FROM todo 
WHERE id=${todoId};
`
  const previousTodo = await db.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `
UPDATE todo SET
todo='${todo}',
priority='${priority}',
status='${status}'
WHERE id=${todoId};
`

  await db.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteQuery = `
  DELETE FROM todo
  WHERE id=${todoId}
  `
  await db.run(deleteQuery)
  response.send('Todo Deleted')
})
