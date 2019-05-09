import fs from 'fs';
import path from 'path';

import Ajv from 'ajv';

export class Validator {
    ajv: Ajv.Ajv;
    schema: object;
    compiled: Ajv.ValidateFunction;

    constructor(schema_fn = '../../public/schema.json') { // TODO use path relative to this file
        this.ajv = new Ajv();
        this.schema = this.loadSchema(schema_fn);
        this.compiled = this.ajv.compile(this.schema);
    }

    loadSchema(schema_fn: string) {
        const fn = path.join(__dirname, schema_fn);
        return JSON.parse(fs.readFileSync(fn, 'utf-8'));
    }

    validate(data: any) {
        return this.compiled(data);
    }

    get errors(): Ajv.ErrorObject[] {
        return this.compiled.errors;
    }
}