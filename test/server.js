const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')

http.createServer((req, res) => {
  var pathname= url.parse(req.url).pathname

  if (pathname === '/') {
    pathname = '/__test__/index.html'
  }

  console.log("Request for "+ pathname + "  received.")

  const filepath = path.resolve(__dirname, '..', '.' + pathname)
  const filetype = filepath.split('.').pop()

  const contentType = filetype === 'js' ? 'application/javascript' : filetype === 'html' ? 'text/html' : 'text/plain'

  fs.readFile(filepath, (err, data) => {
      if(err) {
          console.error(err)
          res.writeHead(404, { 'Content-Type': contentType })
      }
      else {
          res.writeHead(200,{ 'Content-Type': contentType })
          res.write(data.toString())
      }
      res.end()
  })
}).listen(8081)

console.log('Server running at http://127.0.0.1:8081/')
