import React from 'react';

export const CheckList = () => (
    <div>
        <p>Checklist before starting your submission:</p>
        <ul>
            <li>Deposit metabolomics data in MASSive or MetaboLights and make the data publically available</li>
            <li>Deposit assembled genomes/metagenomes to a public database (NCBI, JGI, MGnify) and make them publically available</li>
            <li>Have the basic methods used available for reference</li>
            <li>Locate the URLs for each metabolomics sample in the repository</li>
        </ul>
        <p>Only if connecting a BGC to molecule/molecular family:</p>
        <ul>
            <li>Deposit the cluster in MIBiG and have the BGC ID number available</li>
            <li>Have the SMILES (textual representation of the structure) available</li>
            <li>Locate the MS2 scan or molecular family ID</li>
        </ul>
        <p>Pro Tips:</p>
        <ul>
            <li>Load the sample data to get an idea of how to fill out the form.</li>
            <li>To save your work, complete section 2 for at least one sample and make one link, then press the Preview button, scroll down to the table created and press the Download button. You can later Upload this file to continue working. All validation errors must be resolved before you can download the file.</li>
        </ul>
    </div>
);