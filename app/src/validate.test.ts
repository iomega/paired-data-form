import { kitchenSinkDoc } from './test.fixtures';
import { injectForeignKeySearchMethods, validateDocument } from './validate';
import { FormValidation } from 'react-jsonschema-form';

function mockApp() {
    return {
        formRef: {
            current: {
                state: {
                    formData: kitchenSinkDoc
                }
            }
        }
    };
}

describe('with uischema loaded', () => {
    let uiSchema: any;
    beforeEach(() => {
        uiSchema = require('../public/uischema.json');
    });
    let app: any;
    beforeEach(() => {
        app = mockApp();
    })

    describe('injectForeignKeySearchMethods()', () => {
        beforeEach(() => {
            injectForeignKeySearchMethods(uiSchema, app);
        })

        it('should fetch genome labels', () => {
            const labels = uiSchema.genome_metabolome_links.items.genome_label.foreignKey.search('genome_label');
            const expected: string[] = ["Streptomyces coelicolor A3(2)"];
            expect(labels).toEqual(expected);
        })

        it('should fetch sample labels', () => {
            const labels = uiSchema.genome_metabolome_links.items.sample_preparation_label.foreignKey.search('sample_preparation_label');
            const expected: string[] = ["agar", "blod"];
            expect(labels).toEqual(expected);
        })

        it('should fetch extraction labels', () => {
            const labels = uiSchema.genome_metabolome_links.items.extraction_method_label.foreignKey.search('extraction_method_label');
            const expected: string[] = ["meth", "beer"];
            expect(labels).toEqual(expected);
        })

        it('should fetch instrument labels', () => {
            const labels = uiSchema.genome_metabolome_links.items.instrumentation_method_label.foreignKey.search('instrumentation_method_label');
            const expected: string[] = ["quad", "bh"];
            expect(labels).toEqual(expected);
        })
    });
});

describe('validateDocument', () => {
    it('should validate kitchen sink OK', () => {
        const errors = jest.fn();
        validateDocument(kitchenSinkDoc, errors);
        expect(errors).toHaveBeenCalledTimes(0);
    })

    it('should complain about duplicate genome label', () => {
        const errors = {
            genomes: [
                { genome_label: { addError: jest.fn() } },
                { genome_label: { addError: jest.fn() } }
            ]
        };
        const doc = JSON.parse(JSON.stringify(kitchenSinkDoc));
        // duplicate genome
        doc.genomes.push(doc.genomes[0]);

        validateDocument(doc, errors);
        expect(errors.genomes[0].genome_label.addError).toHaveBeenCalledTimes(0);
        expect(errors.genomes[1].genome_label.addError).toHaveBeenCalledWith('Non-unique label');
    })
});
