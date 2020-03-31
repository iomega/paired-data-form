import { loadJSONDocument } from './util/io';
import { summarizeProject, compareMetaboliteID } from './summarize';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';

describe('summarizeProject()', () => {

    it('should summarize project', async () => {
        expect.assertions(1);

        const _id = 'some-project-id';
        const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);

        const summary = summarizeProject({ _id, project });

        const expected = {
            '_id': 'some-project-id',
            'GNPSMassIVE_ID': 'MSV000078839',
            'PI_name': 'Marnix Medema',
            'submitters': 'Justin van der Hooft',
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

    describe('with second submitter', () => {
        it('should summarize project', async () => {
            expect.assertions(1);

            const _id = 'some-project-id';
            const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            project.personal.submitter_email_secondary = 's.verhoeven@esciencecenter.nl';
            project.personal.submitter_name_secondary = 'Stefan Verhoeven';

            const summary = summarizeProject({ _id, project });

            const expected = {
                '_id': 'some-project-id',
                'GNPSMassIVE_ID': 'MSV000078839',
                'PI_name': 'Marnix Medema',
                'submitters': 'Justin van der Hooft & Stefan Verhoeven',
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
});

describe('compareMetaboliteID()', () => {
    test.each([
        ['MSV000078839', '', 'MSV000078839', '', 0],
        ['MSV000098839', '', 'MSV000078839', '', 1],
        ['MSV000078839', '', 'MSV000098839', '', -1],
        ['', 'MTBLS1302', '', 'MTBLS1302', 0],
        ['', 'MTBLS2302', '', 'MTBLS1302', 1],
        ['', 'MTBLS1302', '', 'MTBLS2302', -1],
    ])('%s,%s,%s,%s,%i', (a_gnps: string, a_metabolights: string, b_gnps: string, b_metabolights: string, expected: number) => {
      const a = {
            '_id': 'some-project-id',
            'GNPSMassIVE_ID': '',
            'PI_name': 'Marnix Medema',
            'submitters': 'Justin van der Hooft & Stefan Verhoeven',
            'metabolights_study_id': '',
            'nr_extraction_methods': 3,
            'nr_genecluster_mspectra_links': 3,
            'nr_genome_metabolmics_links': 21,
            'nr_genomes': 3,
            'nr_growth_conditions': 3,
            'nr_instrumentation_methods': 1
        };
        if (a_gnps) {
            a['GNPSMassIVE_ID'] = a_gnps;
        } else {
            delete a['GNPSMassIVE_ID'];
        }
        if (a_metabolights) {
            a['metabolights_study_id'] = a_metabolights;
        } else {
            delete a['metabolights_study_id'];
        }
        const b = {
            '_id': 'some-project-id',
            'PI_name': 'Marnix Medema',
            'GNPSMassIVE_ID': '',
            'submitters': 'Justin van der Hooft & Stefan Verhoeven',
            'metabolights_study_id': '',
            'nr_extraction_methods': 3,
            'nr_genecluster_mspectra_links': 3,
            'nr_genome_metabolmics_links': 21,
            'nr_genomes': 3,
            'nr_growth_conditions': 3,
            'nr_instrumentation_methods': 1
        };
        if (b_gnps) {
            b['GNPSMassIVE_ID'] = b_gnps;
        } else {
            delete b['GNPSMassIVE_ID'];
        }
        if (b_metabolights) {
            b['metabolights_study_id'] = b_metabolights;
        } else {
            delete b['metabolights_study_id'];
        }
        expect(compareMetaboliteID(a, b)).toEqual(expected);
    });
});