import { loadJSONDocument } from './util/io';
import { summarizeProject } from './summarize';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';

describe('summarizeProject()', () => {

    it('should summarize project', async () => {
        expect.assertions(1);

        const _id = 'some-project-id';
        const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);

        const summary = summarizeProject({_id, project});

        const expected = {
            '_id': 'some-project-id',
            'GNPSMassIVE_ID': 'MSV000078839',
            'PI_name': 'Marnix Medema',
            'submitter_name': 'Justin van der Hooft',
            'metabolights_study_id': '',
            'nr_extraction_methods': 3,
            'nr_genecluster_mspectra_links': 3,
            'nr_genome_metabolmics_links': 21,
            'nr_genomes': 3,
            'nr_growth_conditions': 3,
            'nr_instrumentation_methods': 1
        };
        expect(summary).toEqual(expected);
    });
});
