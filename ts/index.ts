import * as http from 'http';
import * as express from 'express';
import * as httpProxy from 'http-proxy';
import * as events from 'events';

export interface TargetSettings {
    targetUrl: string;
    rejectUnauthorized?: boolean;
}

export type TargetAcquisition = (req: express.Request) => Promise<TargetSettings>;

export interface Options {
    targetAcquisition: TargetAcquisition;
    eventEmitter?: events.EventEmitter;
}

export function get(options: Options) : express.RequestHandler {
    let targetAcquisition: TargetAcquisition = (options && options.targetAcquisition ? options.targetAcquisition : null);
    if (!targetAcquisition) throw "bad target acquisition callback function";
    let eventEmitter: events.EventEmitter = (options && options.eventEmitter ? options.eventEmitter : null);
    return ((req: express.Request, res: express.Response) => {
        targetAcquisition(req)
        .then((settings: TargetSettings) => {
            let proxy = httpProxy.createProxyServer();
            let opt: httpProxy.ServerOptions = {
                target: settings.targetUrl
                ,changeOrigin: true    // change the 'host' header field to target host
            };
            if (typeof settings.rejectUnauthorized === 'boolean') opt.secure = settings.rejectUnauthorized;
            proxy.web(req, res, opt);
            proxy.on('error', (err:any, req: express.Request, res:express.Response) => {
                if (eventEmitter) eventEmitter.emit('error', err, req, res);
            });
            proxy.on('proxyReq', (proxyReq:http.ClientRequest, req: express.Request, res: express.Response, options: httpProxy.ServerOptions) => {
                if (eventEmitter) eventEmitter.emit('proxyReq', proxyReq, req, res, options);
            });
            proxy.on('proxyRes', (proxyRes:http.IncomingMessage, req: express.Request, res: express.Response) => {
                if (eventEmitter) eventEmitter.emit('proxyRes', proxyRes, req, res);
            });
        }).catch((err: any) => {
            res.status(500).json({err});
        });
    });
}