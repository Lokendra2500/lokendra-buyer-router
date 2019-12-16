var name = require('./package.json').name
require('productionize')(name)

var server = require('./lib/server')
var PORT = process.env.PORT || 3000

server().listen(PORT)
console.log(name, 'Listning on port: ', PORT)
