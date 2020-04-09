import fs from 'fs';
import path from 'path';

import Ajv from 'ajv';

export const loadSchema = (schema_fn = '../../app/public/schema.json') => {
    const fn = path.join(__dirname, schema_fn);
    return JSON.parse(fs.readFileSync(fn, 'utf-8'));
};

export class Validator {
    ajv: Ajv.Ajv;
    schema: object;
    compiled: Ajv.ValidateFunction;

    constructor(schema_fn = '../../app/public/schema.json') { // TODO use path relative to this file
        this.ajv = new Ajv();
        this.schema = loadSchema(schema_fn);
        this.compiled = this.ajv.compile(this.schema);
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