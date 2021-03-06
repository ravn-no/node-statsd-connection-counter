var http = require("http")

// replace dots with dashes and colon with blank as not to conflict with graphite/statsd
function filterHostname(host) {
  return host.replace(/\./gi, "_").replace(/:/gi, "")
}

module.exports = function (sdc, server, interval, agent) {
  interval = interval || 5000
  agent = agent || http.globalAgent

  setInterval(function() {
    server.getConnections(function(err, count) {
      if (!err && count) {
        sdc.gauge("connections.server_in", count)
      }
    })
    for (var host in agent.sockets) {
      var cons = agent.sockets[host]
      sdc.gauge("connections.out_by_host." + filterHostname(host), cons.length)
    }
    for (var host in agent.requests) {
      var queue = agent.requests[host]
      sdc.gauge("connections.out_queue_by_host." + filterHostname(host), queue.length)
    }
  }, interval)
}
