import { kitchenSinkDoc } from '../test.fixtures';
import { IExpander } from "./AbstractExpander";
import { InstrumentExpander } from './InstrumentExpander';

describe('with schema loaded', () => {
    let schema: any;
    beforeEach(() => {
        schema = require('../../public/schema.json');
    });

    describe('InstrumentExpander', () => {
        let expander: IExpander;

        beforeEach(() => {
            expander = new InstrumentExpander(schema, kitchenSinkDoc);
        });

        describe('headers()', () => {
            it('should return titles of sample growth section', () =>{
                const headers = expander.headers();
                const expected = ["Instrumentation", "Column details", "Instrument mode", "Mass range", "Collision energy", "Buffering", "Other instrumentation information", "Instrumentation Method Label"];
                expect(headers).toEqual(expected);
            });
        })

        describe('ths', () => {
            it('should return a number of th tags', () => {
                const ths = expander.ths(42);
                expect(ths.length).toBe(8);
            });
        })

        describe('tds', () => {
            it('should return a number of td tags', () => {
                const tds = expander.tds(kitchenSinkDoc.genome_metabolome_links[0], 0);
                expect(tds.length).toBe(8);
            })
        });
    });
});