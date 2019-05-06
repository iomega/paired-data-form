import fs from 'fs';

export function loadJSONDocument(fn: string) {
    const body = fs.readFileSync(fn, 'utf-8');
    return JSON.parse(body);
}