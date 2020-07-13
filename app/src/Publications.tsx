import * as React from 'react';

interface IProps {
    publications: string;
}

export function publicationLink(p: string) {
    let href = 'https://identifiers.org/pubmed:' + p;
    if (p.indexOf('/') !== -1) {
        href = 'https://doi.org/' + p;
    }
    return href;
}

export const Publications = ({publications}: IProps) => {
    if (!publications) {
        return <></>;
    }
    const pubs = publications.split(/,/);
    const lis = pubs.map(p => {
        const href = publicationLink(p);
        return <span key={p}><a href={href}>{p}</a>&nbsp;</span>;
    });
    return (
        <>{lis}</>
    );
};
