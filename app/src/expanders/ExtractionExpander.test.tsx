import { kitchenSinkDoc } from '../test.fixtures';
import { IExpander } from "./AbstractExpander";
import { ExtractionExpander } from './ExtractionExpander';

describe('with schema loaded', () => {
    let schema: any;
    beforeEach(() => {
        schema = require('../../public/schema.json');
    });

    describe('ExtractionExpander', () => {
        let expander: IExpander;

        beforeEach(() => {
            expander = new ExtractionExpander(schema, kitchenSinkDoc);
        });

        describe('headers()', () => {
            it('should return titles of sample growth section', () =>{
                const headers = expander.headers();
                const expected = ["Extraction solvent", "Other extraction details", "Extraction Method Label"];
                expect(headers).toEqual(expected);
            });
        })

        describe('ths', () => {
            it('should return a number of th tags', () => {
                const ths = expander.ths(42);
                expect(ths.length).toBe(3);
            });
        })

        describe('tds', () => {
            it('should return a number of td tags', () => {
                const tds = expander.tds(kitchenSinkDoc.genome_metabolome_links[0], 0);
                expect(tds.length).toBe(3);
            })
        });
    });
});