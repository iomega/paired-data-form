import fs from 'fs';

import Ajv from 'ajv';
import { loadSchema } from './util/schema';

export class Validator {
    ajv: Ajv.Ajv;
    schema: object;
    compiled: Ajv.ValidateFunction;

    constructor(schema = loadSchema()) {
        this.ajv = new Ajv();
        this.compiled = this.ajv.compile(schema);
    }

    validate(data: any) {
        return this.compiled(data);
    }

    validateFile(fn: string) {
        const data = JSON.parse(fs.readFileSync(fn, 'utf-8'));
        const is_valid = this.validate(data);
        if (is_valid) {
            console.log(`${fn} OK`);
        } else {
            console.log(`${fn} BAD`);
            console.error(`${fn} validation errors:`);
            console.error(JSON.stringify(this.errors, undefined, 2));
        }
        return is_valid;
    }

    get errors(): Ajv.ErrorObject[] {
        return this.compiled.errors;
    }
}