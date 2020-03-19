import { kitchenSinkDoc, minimalDoc, bgcms2linkDoc } from './test.fixtures';
import { injectForeignKeySearchMethods, validateDocument } from './validate';

describe('with uischema loaded', () => {
    let uiSchema: any;
    beforeEach(() => {
        uiSchema = require('../public/uischema.json');
    });
    let formRef: any;
    beforeEach(() => {
        formRef = {
            current: {
                state: {
                    formData: kitchenSinkDoc
                }
            }
        };
    })

    describe('injectForeignKeySearchMethods()', () => {
        beforeEach(() => {
            injectForeignKeySearchMethods(uiSchema, formRef);
        })

        it('should fetch genome labels', () => {
            const labels = uiSchema.genome_metabolome_links.items.genome_label.foreignKey.search('genome_label');
            const expected: string[] = [
                "Streptomyces sp. CNB091",
                "Streptomyces sp. CNH099",
                "Salinispora arenicola CNB527"
            ];
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

    it('should validate minimal sink OK', () => {
        const errors = jest.fn();
        validateDocument(minimalDoc, errors);
        expect(errors).toHaveBeenCalledTimes(0);
    });

    it('should validate bgc-ms2 link OK', () => {
        const errors = jest.fn();
        validateDocument(bgcms2linkDoc, errors);
        expect(errors).toHaveBeenCalledTimes(0);
    });

    it('should complain about duplicate genome label', () => {
        const errors = {
            genomes: [
                { genome_label: { addError: jest.fn() } },
                { genome_label: { addError: jest.fn() } },
                { genome_label: { addError: jest.fn() } },
                { genome_label: { addError: jest.fn() } }
            ]
        };
        const doc = JSON.parse(JSON.stringify(kitchenSinkDoc));
        // duplicate genome
        doc.genomes.push(doc.genomes[0]);

        validateDocument(doc, errors);
        expect(errors.genomes[0].genome_label.addError).toHaveBeenCalledTimes(0);
        expect(errors.genomes[1].genome_label.addError).toHaveBeenCalledTimes(0);
        expect(errors.genomes[2].genome_label.addError).toHaveBeenCalledTimes(0);
        expect(errors.genomes[3].genome_label.addError).toHaveBeenCalledWith('Non-unique label');
    });

    it('should complain about duplicate sample preperation label', () => {
        const errors = {
            experimental: {
                sample_preparation: [
                    { sample_preparation_method: { addError: jest.fn() } },
                    { sample_preparation_method: { addError: jest.fn() } },
                    { sample_preparation_method: { addError: jest.fn() } },
                ]
            }
        };
        const doc = JSON.parse(JSON.stringify(kitchenSinkDoc));
        // duplicate sample
        doc.experimental.sample_preparation.push(doc.experimental.sample_preparation[0]);

        validateDocument(doc, errors);
        expect(errors.experimental.sample_preparation[0].sample_preparation_method.addError).toHaveBeenCalledTimes(0);
        expect(errors.experimental.sample_preparation[1].sample_preparation_method.addError).toHaveBeenCalledTimes(0);
        expect(errors.experimental.sample_preparation[2].sample_preparation_method.addError).toHaveBeenCalledWith('Non-unique label');
    });

    it('should complain about duplicate extraction method label', () => {
        const errors = {
            experimental: {
                extraction_methods: [
                    { extraction_method: { addError: jest.fn() } },
                    { extraction_method: { addError: jest.fn() } },
                    { extraction_method: { addError: jest.fn() } },
                ]
            }
        };
        const doc = JSON.parse(JSON.stringify(kitchenSinkDoc));
        // duplicate method
        doc.experimental.extraction_methods.push(doc.experimental.extraction_methods[0]);

        validateDocument(doc, errors);
        expect(errors.experimental.extraction_methods[0].extraction_method.addError).toHaveBeenCalledTimes(0);
        expect(errors.experimental.extraction_methods[1].extraction_method.addError).toHaveBeenCalledTimes(0);
        expect(errors.experimental.extraction_methods[2].extraction_method.addError).toHaveBeenCalledWith('Non-unique label');
    });

    it('should complain about duplicate instrumentation method label', () => {
        const errors = {
            experimental: {
                instrumentation_methods: [
                    { instrumentation_method: { addError: jest.fn() } },
                    { instrumentation_method: { addError: jest.fn() } },
                    { instrumentation_method: { addError: jest.fn() } },
                ]
            }
        };
        const doc = JSON.parse(JSON.stringify(kitchenSinkDoc));
        // duplicate method
        doc.experimental.instrumentation_methods.push(doc.experimental.instrumentation_methods[0]);

        validateDocument(doc, errors);
        expect(errors.experimental.instrumentation_methods[0].instrumentation_method.addError).toHaveBeenCalledTimes(0);
        expect(errors.experimental.instrumentation_methods[1].instrumentation_method.addError).toHaveBeenCalledTimes(0);
        expect(errors.experimental.instrumentation_methods[2].instrumentation_method.addError).toHaveBeenCalledWith('Non-unique label');
    });

});
