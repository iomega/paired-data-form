import fs from 'fs';

export async function loadJSONDocument(fn: string) {
    const body = await fs.promises.readFile(fn, 'utf-8');
    return JSON.parse(body as string);
}

export async function mkdirDirOptional(dir: string) {
    const mode = fs.constants.W_OK;
    try {
        await fs.promises.access(dir, mode);
    } catch {
        await fs.promises.mkdir(dir);
    }
}