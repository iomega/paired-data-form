import { Validator } from './validate';
import { loadJSONDocument } from './util/io';

describe('Validator', () => {
    let validator: Validator;

    beforeEach(() => {
        validator = new Validator();
    });

    test('empty object', () => {
        const data = { 'foo': 'bar' };

        const result = validator.validate(data);

        const expectedErrors = [{ 'dataPath': '', 'keyword': 'additionalProperties', 'message': 'should NOT have additional properties', 'params': { 'additionalProperty': 'foo' }, 'schemaPath': '#/additionalProperties' }];
        expect(validator.errors).toEqual(expectedErrors);
        expect(result).toBeFalsy();
    });

    test('proper document', async () => {
        const data = await loadJSONDocument('../public/examples/paired_datarecord_MSV000078839_example.json');
        const result = validator.validate(data);

        expect(validator.errors).toBeFalsy();
        expect(result).toBeTruthy();
    });
});