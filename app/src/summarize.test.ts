import { compareProjectSummary, ProjectSummary } from "./summarize";

describe('compareProjectSummary()', () => {

    describe('a === a', () => {
        test.each([
            ['_id'],
            ['met_id'],
            ['PI_name'],
            ['submitters'],
            ['nr_genomes'],
            ['nr_growth_conditions'],
            ['nr_extraction_methods'],
            ['nr_instrumentation_methods'],
            ['nr_genome_metabolmics_links'],
            ['nr_genecluster_mspectra_links'],
        ])('%s', (key: string) => {
            const comparer = compareProjectSummary(key);
            const a: ProjectSummary ={
                _id: 'id1',
                GNPSMassIVE_ID: 'somegnpsid',
                metabolights_study_id: '',
                PI_name: 'somepi',
                submitters: 'somesubmitter',
                nr_genomes: 3,
                nr_growth_conditions: 4,
                nr_extraction_methods: 5,
                nr_instrumentation_methods: 2,
                nr_genome_metabolmics_links: 123,
                nr_genecluster_mspectra_links: 42,
            };
            const result = comparer(a, a);
            expect(result).toEqual(0);
        });
    });

    describe('when key is given which is not part of ProjectSummary', () => {
        it('should throw an Error', () => {
            expect(() => compareProjectSummary('wrongkey')).toThrowError(/wrongkey/);
        });
    });
});
