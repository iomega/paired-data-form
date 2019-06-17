import * as React from 'react';

export const Help = () => (
    <div>
        <h1>List projects</h1>
        <h1>View single project</h1>
        <h1>Adding a project</h1>
        <h2>1. Submitter Information </h2>
        <h2>2. Overall metabolomics project details </h2>
        <h2>3. All metagenome/genomes </h2>
        <h2>4. Metabolomics experimental details </h2>
        <h2>5. Links between genomes and metabolomics data </h2>
        <h2>6. Linked gene clusters and MS2 spectra </h2>
        <h2>Actions</h2>
        There are several action buttons at the bottom of the page.
    <ul>
            <li>Example: Loads an example project into the form</li>
            <li>Upload: Upload a JSON formatted file that adheres to the <a href="/schema.json">JSON schema</a>, instead of filling the form manually</li>
            <li>Submit for review: When form has been complete it can be submitted for review. A reviewer will accept or deny the submitted project.</li>
            <li>Preview: Renders a project page with the data in the form only visible to the form submitter.</li>
            <li>Reset: Clears the whole form, cannot be undone.</li>
        </ul>
        <h1>Review</h1>
    </div>
);

