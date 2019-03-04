import { kitchenSinkDoc } from '../test.fixtures';
import { IExpander } from "./AbstractExpander";
import { SampleGrowthConditionsExpander } from './SampleGrowthConditionsExpander';

describe('with schema loaded', () => {
    let schema: any;
    beforeEach(() => {
        schema = require('../../public/schema.json');
    });

    describe('SampleGrowthConditionsExpander', () => {
        let expander: IExpander;

        beforeEach(() => {
            expander = new SampleGrowthConditionsExpander(schema, kitchenSinkDoc);
        });

        describe('headers()', () => {
            it('should return titles of sample growth section', () =>{
                const headers = expander.headers();
                const expected = ["Medium type", "Growth medium", "Growth temperature", "Aeration", "Growth time", "Growth phase or OD", "Other growth conditions", "Metagenome details", "Metagenomic sample description", "Sample Growth Conditions Label"];
                expect(headers).toEqual(expected);
            });
        })

        describe('ths', () => {
            it('should return a number of th tags', () => {
                const ths = expander.ths(42);
                expect(ths.length).toBe(10);
            });
        })

        describe('tds', () => {
            it('should return a number of td tags', () => {
                const tds = expander.tds(kitchenSinkDoc.genome_metabolome_links[0], 0);
                expect(tds.length).toBe(10);
            })
        });
    });
});