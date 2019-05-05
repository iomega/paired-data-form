import { Validator } from './validate';

describe('Validator', () => {
    let validator: Validator;

    beforeEach(() => {
        validator = new Validator();
    });

    test('empty object', () => {
        const data = {'foo': 'bar'};

        const result = validator.validate(data);

        expect(validator.errors).toEqual([]);
        expect(result).toBeTruthy();
    });
});