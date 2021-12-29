import { cpus } from 'os';
import { fork, ChildProcess } from 'child_process';
import {createServer, IncomingMessage, Server} from "http";
import { URL } from 'url';

import { IMsgJob } from "./worker";

export class Master {

    private pools = {}
    private queue = []
    private server: Server;

    constructor() {
        this.server = createServer(this.onRequest)
        return this;
    }

    private initWorker() {

        // CPU 核心数
        const max_workers = cpus().length;
        // const max_workers = 3;

        for (let i = 1; i < max_workers; i++) {
            const worker = fork('./worker');
            this.pools[worker.pid] = worker;

            worker.on('message', (msg) => this.onWorkerMessage(msg))
        }

    }

    private onWorkerMessage(msg) {
        switch (msg) {
            case 'ready':
                this.onReady(msg.payload);
                break;
            default:
                break;
        }
    }

    private onReady(pid) {
        const value = this.queue.shift()
        const worker: ChildProcess = this.pools[pid];

        worker.send({
            type: 'job',
            payload: value
        })
    }

    private onRequest(req: IncomingMessage, res) {
        const rawURL = new URL(`http://${req.url}`)
        const value = rawURL.searchParams.get('url')
        this.queue.push(value);
        res.send(200)
    }

    public start(port = 3000): void {
        this.initWorker();

        this.server.listen(port)

        console.log(`pools: ${Object.keys(this.pools)}`)
    }

}