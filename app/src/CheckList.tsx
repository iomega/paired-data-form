import React from 'react';

export const CheckList = () => (
    <div>
        <p>It is great that you want to contribute to the Paired omics Data Platform! Please use provided checklist of what you will need at hand before starting your submission:</p>
        <ul>
            <li>Deposit your metabolomics data in MASSive or MetaboLights and make the data publically available</li>
            <li>Deposit your assembled genomes/metagenomes in a public database (GenBank, ENA, DDBJ, IMG-JGI or MGnify) and make them publically available</li>
            <li>Have the basic methods used available for reference</li>
            <li>Locate the URLs for each metabolomics sample in the repository</li>
        </ul>
        <p>Only if connecting one or more biosynthetic gene clusters to molecules/molecular families:</p>
        <ul>
            <li>
                Deposit the gene cluster in MIBiG and have the accession number available</li>
            <li>
                Have the SMILES (textual representation of the chemical structure) of the metabolites available</li>
            <li>
                Locate the MS2 scan or molecular family ID in GNPS</li>
        </ul>
        <p>Pro Tips:</p>
        <ul>
            <li>Load the sample data to get an idea of how to fill out the form.</li>
            <li>
                Fill out the form in order from section 1 to 6.</li>
            <li>
                To save your work, complete sections 1-4 for at least one sample and make at least one link in section 5, then press the Preview button, scroll down to the table created and press the Download button. You can later use the Upload button to upload this file to continue working. Validation errors may appear at the top of the page and must be resolved before you can download the file.
        </li>
        </ul>
    </div>
);