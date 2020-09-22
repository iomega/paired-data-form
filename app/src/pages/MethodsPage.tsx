import React from 'react';
import architecture from './methods/architecture.svg';
const style = { padding: '10px' };


export const MethodsPage = () => {
    return (
        <div style={style}>
            <h2>Methods and implementation</h2>
            <h3>Project Submission Workflow</h3>
            <p>A project in the platform consists of the following six sections:</p>
            <ol>
                <li>Submitter information</li>
                <li>Metabolomics information</li>
                <li>(Meta)Genome information</li>
                <li>Experimental Details</li>
                <li>Genome - Metabolome links</li>
                <li>Gene Cluster - Mass Spectra links</li>
            </ol>

            <p>
                The submitter information (section 1) contains contact information on the submitter(s) and the principal investigator of the project and is used to acknowledge their work. The metabolomics information (section 2) contains the MassIVE identifier or MetaboLights identifier to the metabolomics dataset and if available a GNPS molecular network task identifier providing access to a premade molecular network of the metabolomics data. A project can have multiple genome or metagenome entries that are inputted in section 3. The genome entry has a GenBank, RefSeq, and/or JGI identifier. The metagenome entry has a ENA/NCBI, MGnify, and/or JGI identifier. The genome or metagenome entry can contain a BioSample identifier and DOIs for key publications. Minimal metadata information (section 4) on sample preparation, extraction methods and instrumentation methods are needed to allow the creation of relevant subsets of projects based on organism, mass spectrometry instrument, or growth medium used, for example. All multiple choice fields like metagenomic environment, extraction solvent or instrument type, have titles and identifiers from existing ontologies.
            </p>
            <h3>Linking</h3>

            <p>
                In section 5, links between a (meta)genome and a mass spectrum are defined. To create a link, the complete URL to the mass spectrum data file must be provided and the corresponding (meta)genome must be selected. In addition, sample preparation, extraction methods and instrumentation methods must be selected from lists based on user defined labels of information described in the experimental detail and (meta)genome information sections. If validated links between gene clusters and metabolites are present in a project, these can be recorded in section 6. It is important to realize that these (or related) gene clusters need to be present or uploaded to MiBIG beforehand. In section 6, BGC-metabolite links are made by linking the MiBIG accession number to a specific scan number in a metabolomics data file or to a specific molecular family in a GNPS molecular networking job. It is also highly recommended to add molecular descriptors like SMILES 41 to these links to make the structures machine readable.
            </p>
            <h3>Format</h3>

            <p>
                Each project is stored as a JSON formatted document which adheres to the platform’s JSON schema (https://pairedomicsdata.bioinformatics.nl/schema.json). The JSON schema describes which fields are required, gives human readable titles and descriptions for each field and describes when they are valid. The schema is versioned to make sure documents are compatible with the platform and can evolve over time. To add a project to the platform a submission form must be filled - this can be done without a login to promote ease of use. After the project is reviewed by the platform administrators (usually within two weeks), the project is listed on the site. The projects can be viewed individually, as overall statistics, or downloaded from Zenodo.
            </p>

            <h3>Technical Implementation</h3>

            <figure>
                <img alt="Platform architecture" src={architecture} />
                <figcaption>Platform architecture</figcaption>
            </figure>

            <p>
                The platform is implemented using Javascript based web service and a React (v16.13.1) based web application. The web application renders the submission form from the JSON schema. The web service stores each project as a file on disk. The application offers full text search functionality via web services using an elastic search (v7.6.2) index. The web service uses a redis queue (v5.0.5) to schedule jobs to fetch more information about the public identifiers and to upload the projects to Zenodo each month. For example, the scientific species name is fetched from GenBank using the public genome identifiers in the project. The web service has an OpenAPI (v3.0.3) specification (https://www.openapis.org/) which can be used to submit and retrieve projects in a programmatic manner. The platform runs using Docker Compose (v1.25.4) with containers for the web application, web service and redis queue.
            </p>

            <h3>Terminology</h3>

            <p>Specialized metabolite - a molecule that is naturally produced by an organism, not necessary for survival, but may confer an advantage to the producing organism. Synonyms: natural product, secondary metabolite</p>
            <p>Biosynthetic Gene Cluster (BGC) - a set of genes that are necessary to biosynthesize a specialized metabolite</p>
            <p>Molecular family - a group of structurally related molecules, identified by similar fragmentation patterns</p>
            <p>MS/MS - mass spectrometry fragmentation, also referred to as tandem mass spectrometry</p>
            <p>Metabolome - in this text, we refer to metabolome as the observable part of the metabolome, as the data gathered with untargeted mass spectrometry under the experimental conditions used</p>
            <p>Paired data - genomic information, specifically a genome or metagenome assembly, and metabolomic information, specifically tandem mass spectrometry data, that originate from the same source</p>
            <p>Linked data - a BGC that can be experimentally linked to an MS2 spectrum or a molecular family</p>
        </div>
    )
}
