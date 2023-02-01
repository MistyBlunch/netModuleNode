const parser = require('http-string-parser')
const net = require('net')
const port = 8000

const users = {}

getMethods = (res, socket) => {
  const uriArr = res.uri.split('/')
  const uri = uriArr[1]

  if (uri === 'hello') socket.write('HTTP/1.1 200 OK\n\nholi!!!')
  else if (uri === 'users') {
    const usersJsonResponse = JSON.stringify(users, null, 2)
    socket.write(`HTTP/1.1 200 OK\n\n${usersJsonResponse}`)
  } else if (uri === 'user') {
    const idUserString = returnValidId(uriArr, socket)
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
  const uriArr = res.uri.split('/')
  const uri = uriArr[1]

  if (uri === 'user') {
    const userJson = JSON.parse(res.body)
    let user = userJson
    let idUser = returnValidId(uriArr, socket)

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

returnValidId = (uriArr, socket) => {
  const idPos = uriArr.length - 1
  const idUser = uriArr[idPos]

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
