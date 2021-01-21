import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Publications } from './Publications';

describe('<Publications>', () => {

    const table: [string, [string, string][]][] = [
        ['23402329', [
            ['23402329', 'https://identifiers.org/pubmed:23402329']
        ]],
        ['29873888,29943987', [
            ['29873888', 'https://identifiers.org/pubmed:29873888'],
            ['29943987', 'https://identifiers.org/pubmed:29943987'],
        ]],
        ['29873888, 29943987', [
            ['29873888', 'https://identifiers.org/pubmed:29873888'],
            ['29943987', 'https://identifiers.org/pubmed:29943987'],
        ]],
        ['29873888 29943987', [
            ['29873888', 'https://identifiers.org/pubmed:29873888'],
            ['29943987', 'https://identifiers.org/pubmed:29943987'],
        ]],
        ['10.1016/s1074-5521(03)00120-0', [
            ['10.1016/s1074-5521(03)00120-0', 'https://doi.org/10.1016/s1074-5521(03)00120-0']
        ]],
        ['10.1016/s1074-5521(03)00120-0,10.1073/pnas.1008285107', [
            ['10.1016/s1074-5521(03)00120-0', 'https://doi.org/10.1016/s1074-5521(03)00120-0'],
            ['10.1073/pnas.1008285107', 'https://doi.org/10.1073/pnas.1008285107']
        ]],
        ['10.1016/s1074-5521(03)00120-0, 10.1073/pnas.1008285107', [
            ['10.1016/s1074-5521(03)00120-0', 'https://doi.org/10.1016/s1074-5521(03)00120-0'],
            ['10.1073/pnas.1008285107', 'https://doi.org/10.1073/pnas.1008285107']
        ]],
        ['10.1016/s1074-5521(03)00120-0 10.1073/pnas.1008285107', [
            ['10.1016/s1074-5521(03)00120-0', 'https://doi.org/10.1016/s1074-5521(03)00120-0'],
            ['10.1073/pnas.1008285107', 'https://doi.org/10.1073/pnas.1008285107']
        ]],
    ];
    test.each(table)('Renders with %s links(s)', (publications, links) => {
        const container = render(<Publications publications={publications}/>);
        expect.assertions(links.length);
        links.forEach(([text, href]) => {
            expect(container.getByText(text)).toHaveAttribute('href', href);
        });
    });
});
