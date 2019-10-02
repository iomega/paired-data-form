import * as React from 'react';

interface IProps {
    iD: string;
}

// Make use of https://orcid.org/trademark-and-id-display-guidelines to render a ORCID iD
export const Orcid = ({ iD }: IProps) => (
    <span itemScope itemType="https://schema.org/Person">
        <a
            itemProp="sameAs"
            href={iD}
            target="orcid.widget"
            rel="noopener noreferrer"
            style={{ verticalAlign: 'top' }}
            title="ORCID iD"
        >
            <img
                src="https://orcid.org/sites/default/files/images/orcid_16x16.png"
                style={{ width: '1em', marginRight: '.5em' }}
                alt="ORCID iD"
            />
        </a>
    </span>
)