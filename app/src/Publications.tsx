import * as React from 'react';

interface IProps {
    publications: string;
}

export const Publications = ({publications}: IProps) => {
    const pubs = publications.split(/,/);
    const lis = pubs.map(p => {
        let href = 'https://www.ncbi.nlm.nih.gov/pubmed/' + p;
        if (p.indexOf('/') !== -1) {
            href = 'https://doi.org/' + p;
        }
        return <span key={p}><a href={href}>{p}</a>&nbsp;</span>;
    });
    return (
        <>{lis}</>
    );
};
