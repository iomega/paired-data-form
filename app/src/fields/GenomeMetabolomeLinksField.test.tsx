import * as React from 'react';

import { FieldProps } from 'react-jsonschema-form';
import { render, RenderResult, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect'

import { GenomeMetabolomeLinksField } from './GenomeMetabolomeLinksField';

describe('GenomeMetabolomeLinksField', () => {
    let props: FieldProps;
    let comp: RenderResult;
    let onChange: () => void;
    let formContext: any;

    beforeEach(() => {
        formContext = {};
        const uiSchema = {};
        onChange = jest.fn();
        const registry = {
            fields: {},
            widgets: {},
            definitions: {},
            formContext
        };
        const schema = {};

        comp = render(<GenomeMetabolomeLinksField
            {...props}
            uiSchema={uiSchema}
            onChange={onChange}
            schema={schema}
            registry={registry}
            formContext={formContext}
        />);
    })

    it('should render upload button', () => {
        expect(comp.getAllByText('Upload links')).toBeTruthy();
    });

    describe('Upload links', () => {

        describe('upload no file', () => {
            it('should render upload error', () => {
                const input = comp.getByTestId('links-upload-input');

                fireEvent.change(input, { target: {} });

                expect(comp.getByRole('alert')).toHaveTextContent('No file selected');
            });
        });



        describe('upload a csv file with single link', () => {
            it('should trigger props.formContext.uploadGenomeMetabolomeLinks', async () => {
                const formUpdater = jest.fn();
                formContext.uploadGenomeMetabolomeLinks = formUpdater;
                const lines = [
                    'Genome/Metagenome\tLocation of metabolomics data file\tSample Growth Conditions\tExtraction Method\tInstrumentation Method\n',
                    'Streptomyces sp. CNB091\tftp://massive.ucsd.edu/MSV000078839/spectrum/A1/CNB091_A1_B.mzXML\tA1\tButanol\tToF\n',
                ];
                const file = new File(lines, 'paired-preview_id-genome-metabolome.tsv', { type: 'text/tab-separated-values' })
                const input = comp.getByTestId('links-upload-input');

                userEvent.upload(input, file);

                const expected = [{
                    'Genome/Metagenome': 'Streptomyces sp. CNB091',
                    'Location of metabolomics data file': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/A1/CNB091_A1_B.mzXML',
                    'Sample Growth Conditions': 'A1',
                    'Extraction Method': 'Butanol',
                    'Instrumentation Method': 'ToF',
                }];
                await waitFor(
                    () => expect(formUpdater).toHaveBeenCalledWith(expected)
                );
            });
        });

        describe('upload file with wrong colums', () => {
            it('should render parse error', async () => {
                const msg = "Parse error";
                const formUpdater = jest.fn(() => {
                    throw new Error(msg);
                });
                formContext.uploadGenomeMetabolomeLinks = formUpdater;
                const lines = [
                    'col1\tcol2\tcol3\tcol4\tcol4\n',
                    'Streptomyces sp. CNB091\tftp://massive.ucsd.edu/MSV000078839/spectrum/A1/CNB091_A1_B.mzXML\tA1\tButanol\tToF\n',
                ];
                const file = new File(lines, 'paired-preview_id-genome-metabolome.tsv', { type: 'text/tab-separated-values' })
                const input = comp.getByTestId('links-upload-input');

                userEvent.upload(input, file);

                await waitFor(
                    () => {
                        expect(formContext.uploadGenomeMetabolomeLinks).toHaveBeenCalledTimes(1);
                        expect(comp.getByRole('alert')).toHaveTextContent(msg);
                    }
                );
            });
        });

    });
});
