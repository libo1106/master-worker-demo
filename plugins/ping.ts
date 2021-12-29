import { spawnSync } from 'child_process';

export async function ping(url) {
    const ping = spawnSync('ping', [url, '-c', 5])
    return ping.stdout;
}

