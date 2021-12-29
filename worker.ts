import { ping } from './plugins/ping';

export interface IMsgReady {
    type: 'ready',
    payload: string
}

export interface IMsgRequest {
    type: 'request',
    payload: string
}

export interface IMsgJob {
    type: 'job',
    payload: string
}

export interface IMsgFinish {
    type: 'finish',
    payload: string
}

export type IMsg = IMsgReady & IMsgRequest & IMsgJob & IMsgFinish

class Worker {
    job: (arg0: string) => Promise<Buffer>;

    constructor(job) {
        this.job = job;
        process.on('message', (message: IMsg) => this.onMessage(message))
        this.ready();
    }

    public ready() {

        setTimeout(() => {
            process.send({
                type: 'ready',
                payload: process.pid
            })
        }, 1000 * 10)

    }

    private onMessage(message): void {

        try {
            switch (message) {
                case 'job':
                    this.job(message.payload).then(() => this.jobFinish(message.payload))
                    break;
                default:
                    break;
            }
        } catch (error) {
            this.logError(error);
        }


    }

    private jobFinish(data) {
        process.send({type: 'finish', payload: data })
    }

    private logError(error) {
        process.send({
            type: 'error',
            payload: JSON.stringify(error)
        })
    }

}

new Worker(ping);
