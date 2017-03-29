"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var httpProxy = require("http-proxy");
function get(options) {
    var targetAcquisition = (options && options.targetAcquisition ? options.targetAcquisition : null);
    if (!targetAcquisition)
        throw "bad target acquisition callback function";
    var eventEmitter = (options && options.eventEmitter ? options.eventEmitter : null);
    return (function (req, res) {
        targetAcquisition(req)
            .then(function (settings) {
            var proxy = httpProxy.createProxyServer();
            var opt = {
                target: settings.targetUrl,
                changeOrigin: true // change the 'host' header field to target host
            };
            if (typeof settings.rejectUnauthorized === 'boolean')
                opt.secure = settings.rejectUnauthorized;
            proxy.web(req, res, opt);
            proxy.on('error', function (err, req, res) {
                if (eventEmitter)
                    eventEmitter.emit('error', err, req, res);
            });
            proxy.on('proxyReq', function (proxyReq, req, res, options) {
                if (eventEmitter)
                    eventEmitter.emit('proxyReq', proxyReq, req, res, options);
            });
            proxy.on('proxyRes', function (proxyRes, req, res) {
                if (eventEmitter)
                    eventEmitter.emit('proxyRes', proxyRes, req, res);
            });
        }).catch(function (err) {
            res.status(500).json({ err: err });
        });
    });
}
exports.get = get;
