import fs from 'fs';
import tmp from 'tmp';

import { Validator } from './validate';
import { loadJSONDocument } from './util/io';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';

describe('Validator', () => {
    let validator: Validator;

    beforeEach(() => {
        validator = new Validator();
    });

    describe('validate()', () => {
        test('empty object', () => {
            const data = { 'foo': 'bar' };

            const result = validator.validate(data);

            const expectedErrors = [{ 'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': { 'additionalProperty': 'foo' }, 'schemaPath': '#/additionalProperties' }];
            expect(validator.errors).toEqual(expectedErrors);
            expect(result).toBeFalsy();
        });

        test('proper document', async () => {
            const data = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            const result = validator.validate(data);

            expect(validator.errors).toBeFalsy();
            expect(result).toBeTruthy();
        });
    });

    describe('validateFile()', () => {
        test('proper document', async () => {
            console.log = jest.fn();

            const result = validator.validateFile(EXAMPLE_PROJECT_JSON_FN);

            expect(result).toBeTruthy();
            expect(console.log).toHaveBeenCalledWith(`${EXAMPLE_PROJECT_JSON_FN} OK`);
        });

        describe('empty object', () => {
            let fn: string;
            let logSpy: jest.SpyInstance;
            let errorSpy: jest.SpyInstance;

            beforeEach(() => {
                const data = JSON.stringify({ 'foo': 'bar' });
                fn = tmp.tmpNameSync();
                fs.writeFileSync(fn, data);
                logSpy = jest.spyOn(console, 'log').mockImplementation();
                errorSpy = jest.spyOn(console, 'error').mockImplementation();
            });

            afterEach(() => {
                logSpy.mockRestore();
                errorSpy.mockRestore();
                fs.unlinkSync(fn);
            });

            test('should complain in console', () => {
                console.log = jest.fn();
                console.error = jest.fn();

                const result = validator.validateFile(fn);

                expect(result).toBeFalsy();
                // Check console
                const expectedErrors = [[{ 'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': { 'additionalProperty': 'foo' }, 'schemaPath': '#/additionalProperties' }]];
                expect(console.log).toHaveBeenCalledWith(`${fn} BAD`);
                expect(console.error).toHaveBeenCalledWith(`${fn} validation errors:`);
                const errors = (console.error as jest.Mock).mock.calls[1];
                expect(errors).toEqual(expectedErrors);
            });
        });
    });
});