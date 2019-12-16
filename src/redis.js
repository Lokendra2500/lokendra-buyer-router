var redis = process.env.NODE_ENV === 'test' ? require('fakeredis') : require('redis')
var REDIS_PORT = process.env.REDIS_PORT || 6379

var client = redis.createClient(REDIS_PORT, '127.0.0.1')

// on: Connect to redis database
client.on('connect', function () { console.log('Connected to redis') })

module.exports = client
