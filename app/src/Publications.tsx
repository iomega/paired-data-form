import * as React from 'react';

interface IProps {
    publications: string;
}

function publicationLink(p: string) {
    let href = 'https://identifiers.org/pubmed:' + p;
    if (p.indexOf('/') !== -1) {
        href = 'https://doi.org/' + p;
    }
    return href;
}

export function publicationLinks(publications: string) {
    const splitted = publications.split(/[, ]\s*/);
    const linked: [string, string][] = splitted.map(p => [p, publicationLink(p)]);
    return linked;
}

export const Publications = ({publications}: IProps) => {
    if (!publications) {
        return <></>;
    }
    const links = publicationLinks(publications).map(
        ([text, href]) => <span key={text}><a href={href}>{text}</a>&nbsp;</span>
    );
    return (
        <>{links}</>
    );
};
