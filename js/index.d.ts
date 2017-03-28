/// <reference types="express" />
/// <reference types="node" />
import * as express from 'express';
import * as events from 'events';
export interface TargetSettings {
    targetUrl: string;
    rejectUnauthorized?: boolean;
}
export declare type TargetAcquisition = (req: express.Request) => Promise<TargetSettings>;
export interface Options {
    targetAcquisition: TargetAcquisition;
    eventEmitter?: events.EventEmitter;
}
export declare function get(options: Options): express.RequestHandler;
