var body = require('body/json')
var send = require('send-data/json')
var client = require('../src/redis')
var URL = require('url')
var querystring = require('querystring')

module.exports = {
  get: get,
  post: post,
  route: route
}

/**
 * function for getting details
 * @param {*} req
 * @param {*} res
 * @param {*} opts
 * @param {*} cb
 */
function get (req, res, opts, cb) {
  // smembers: Get all the members in a set
  client.smembers('buyers', function (err, result) {
    if (err) return send(err)
    for (let i = 0; i < result.length; i++) {
      if (JSON.parse(result[i]).id === opts.params.id) {
        res.statusCode = 200
        opts.body = JSON.parse(result[i])
      }
    }
    send(req, res, opts.body, cb)
  })
} // end of get function

/**
 * function for saving data
 * @param {*} req
 * @param {*} res
 * @param {*} opts
 * @param {*} cb
 */
function post (req, res, opts, cb) {
  body(req, res, function (err, data) {
    if (err) return cb(err)

    // sadd: Add one or more members to a set
    client.sadd('buyers', JSON.stringify(data), function (err, result) {
      if (err) return send(err)
      if (result === 0) {
        res.statusCode = 200
        opts.body = {
          message: 'Buyer already exist.'
        }
        send(req, res, opts.body, cb)
      } else {
        res.statusCode = 201
        opts.body = {
          message: 'Buyer successfully added',
          data: data
        }
        send(req, res, opts.body, cb)
      }
    })
  })
} // end of post function...

/**
 * function for route the traffic to the highest value matching location
 * on the basis of giving parameters
 * @param {*} req
 * @param {*} res
 * @param {*} opts
 * @param {*} cb
 */
function route (req, res, opts, cb) {
  const parsed = URL.parse(req.url)
  const query = querystring.parse(parsed.query)
  const qdevice = query.device
  const qstate = query.state
  const qday = new Date(query.timestamp).getUTCDay()
  const qhour = new Date(query.timestamp).getUTCHours()
  let location
  let value = 0
  client.smembers('buyers', function (err, result) {
    if (err) return send(err)
    for (let i = 0; i < result.length; i++) {
      const tempElement = JSON.parse(result[i])
      for (let j = 0; j < tempElement.offers.length; j++) {
        const device = tempElement.offers[j].criteria.device
        const state = tempElement.offers[j].criteria.state
        const hour = tempElement.offers[j].criteria.hour
        const day = tempElement.offers[j].criteria.day
        if (device.includes(qdevice) && state.includes(qstate) && hour.includes(qhour) && day.includes(qday)) {
          if (value < tempElement.offers[j].value) {
            value = tempElement.offers[j].value
            location = tempElement.offers[j].location
          }
        }
      }
    }
    res.statusCode = 302
    res.setHeader('location', location)
    send(req, res, cb)
  })
} // end of route function
