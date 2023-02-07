const parser = require('http-string-parser')
const qs = require('querystring')
const net = require('net')
const port = 8000

const users = {}

getMethods = (res, socket) => {
  const pathArr = res.uri.split('/')
  const path = pathArr[1]
  const pathQuery = path.split('?')
  const pathFromQuery = pathQuery[0]
  const query = pathQuery[1]

  if (path === 'hello' || pathFromQuery === 'hello') {
    const q = qs.parse(query)
    socket.write(`HTTP/1.1 200 OK\n\nholi${' ' + q.name}!!!`)
  } else if (path === 'users' || pathFromQuery === 'users') {
    const usersJsonResponse = JSON.stringify(users, null, 2)
    socket.write(`HTTP/1.1 200 OK\n\n${usersJsonResponse}`)
  } else if (path === 'user') {
    const idUserString = returnValidId(pathArr, socket)
    const idUser = parseInt(idUserString)
    const result = users[idUser]

    if (!result) {
      socket.write(
        `HTTP/1.1 404 ERROR DE MOTOMAMI\n\nDon't exists an user with that id`
      )
      return
    }

    const resultJson = JSON.stringify(result, null, 2)
    socket.write(`HTTP/1.1 200 OK\n\n${resultJson}`)
  } else socket.write('HTTP/1.1 404 ERROR DE MOTOMAMI\n\nnot found')
}

postMethods = (res, socket) => {
  const pathArr = res.uri.split('/')
  const path = pathArr[1]

  if (path === 'user') {
    const userJson = JSON.parse(res.body)
    let user = userJson
    let idUser = returnValidId(pathArr, socket)

    if (!idUser) return

    user.id = parseInt(idUser)

    if (users[user.id]) {
      socket.write(
        `HTTP/1.1 404 ERROR DE MOTOMAMI\n\nUser exists with this id`
      )
      return
    }

    users[user.id] = user

    socket.write(`HTTP/1.1 200 OK\n\nuser created!\n`)
  } else socket.write('HTTP/1.1 404 ERROR DE MOTOMAMI\n\nnot found')
}

returnValidId = (pathArr, socket) => {
  const idPos = pathArr.length - 1
  let idUser = pathArr[idPos]

  if (isNaN(idUser)) {
    const IdQuery = idUser.split('?')[0]
    idUser = IdQuery
  }

  if (idUser === '' || isNaN(idUser)) {
    socket.write('HTTP/1.1 404 ERROR DE MOTOMAMI\n\nIt needs an id')
    return
  }

  return idUser
}

const server = net.createServer((socket) => {
  socket.on('data', (buffer) => {
    const data = buffer.toString('utf-8')
    const res = parser.parseRequest(data)

    if (res.method === 'GET') getMethods(res, socket)
    if (res.method === 'POST') postMethods(res, socket)

    socket.end((err) => {
      if (err) console.log(err)
    })
  })
})

server.listen(port, () => {
  console.log('listening on port ' + port)
})
