const http = require('http')
const https = require('https')
const net = require('net')
const parseUrl = require('url').parse
const SniSpoofer = require('./sni-spoofer')

function forwardRequest(reqUrl, clientReq, clientRes) {
    const options = {
        hostname: reqUrl.hostname,
        port: reqUrl.port,
        path: reqUrl.path,
        method: clientReq.method,
        headers: clientReq.headers //TODO: use clientReq.rawHeaders?
    }
    const httpModule = /https/.test(reqUrl.protocol) ? https : http
    const serverReq = httpModule.request(options, serverRes => {
        //TODO: use serverRes.rawHeaders?
        clientRes.writeHead(serverRes.statusCode, serverRes.statusMessage, serverRes.headers)
        serverRes.pipe(clientRes)
    })
    clientReq.pipe(serverReq)
}

const createProxyConnectHandler = httpsProxyPort =>
    (clientReq, clientSocket, head) => {
        let reqUrl = parseUrl(`http://${clientReq.url}`)
        //if intercept
        reqUrl = parseUrl(`https://127.0.0.1:${httpsProxyPort}`)
        const serverSocket = net.connect(reqUrl.port, reqUrl.hostname, () => {
            clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
            serverSocket.write(head)
            clientSocket.pipe(serverSocket).pipe(clientSocket)
        })
    }

const createHttpProxy = httpsProxyPort =>
    http.createServer((clientReq, clientRes) => {
        const reqUrl = parseUrl(clientReq.url)
        forwardRequest(reqUrl, clientReq, clientRes)
    }).on('connect', createProxyConnectHandler(httpsProxyPort))

const createHttpsInterceptProxy = async (caCert, caKey) =>
    https.createServer({
        SNICallback: new SniSpoofer(caCert, caKey).callback()
    }, (clientReq, clientRes) => {
        const host = clientReq.headers['host']
        const reqUrl = parseUrl(`https://${host}${clientReq.url}`)
        forwardRequest(reqUrl, clientReq, clientRes)
    })

class Proxy {
    constructor(opts) {
        this.opts = opts
    }

    async start() {
        const opts = this.opts
        const httpProxy = await createHttpProxy(opts.interceptorPort)
        const interceptorProxy = await createHttpsInterceptProxy(opts.caCert, opts.caKey)

        httpProxy.listen(opts.proxyPort)
        interceptorProxy.listen(opts.interceptorPort)
    }
}

module.exports = Proxy
