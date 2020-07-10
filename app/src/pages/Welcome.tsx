import * as React from "react";

import { Row, Col } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { DataCatalog, SearchAction, PropertyValueSpecification, WebSite } from "schema-dts";
import { helmetJsonLdProp } from "react-schemaorg";

import slide1 from './welcome/slide1.png';
import slide2 from './welcome/slide2.png';
import slide3 from './welcome/slide3.png';
import slide4 from './welcome/slide4.png';
import slide5 from './welcome/slide5.png';
import { jsonldDataCatalog } from "../constants";

const style = { padding: '10px', fontFamily: 'Roboto Condensed' };
const textStyle = { fontSize: '1.8em' };
const imgStyle = { width: '100%' };
const rowStyle = { marginBottom: '50px', marginRight: '0px', marginLeft: '0px' };
const colStyle = {
    paddingLeft: '40px'
};

export function Welcome() {
    type MySearchAction = SearchAction & {
        "query-input": PropertyValueSpecification | String;
    };
    const potentialAction: MySearchAction = {
        "@type": "SearchAction",
        "target": "https://pairedomicsdata.bioinformatics.nl/projects?q={search_term_string}",
        "query-input": "required name=search_term_string"
    };
    const jsonld = helmetJsonLdProp<WebSite>({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "https://pairedomicsdata.bioinformatics.nl",
        potentialAction,
        hasPart: jsonldDataCatalog
    }, { space: 2 });
    return (
        <div style={style}>
            <Helmet script={[jsonld]}>
                <meta name="description" content="The Paired Omics Data Platform is a community-based initiative standardizing links between genomic and metabolomics data in a computer readable format to further the field of natural products discovery. The goals are to link molecules to their producers, find large scale genome-metabolome associations, use genomic data to assist in structural elucidation of molecules, and provide a centralized database for paired datasets." />
            </Helmet>
            <Row style={rowStyle}>
                <Col md={4} mdOffset={2} style={colStyle}>
                    <h1>Paired Omics Data Platform</h1>
                    <p style={textStyle}>The Paired Omics Data Platform is a community-based initiative standardizing links between genomic and metabolomics data in a computer readable format to further the field of natural products discovery. The goals are to link molecules to their producers, find large scale genome-metabolome associations, use genomic data to assist in structural elucidation of molecules, and provide a centralized database for paired datasets.</p>
                </Col>
                <Col md={4} style={colStyle}>
                    <img style={imgStyle} src={slide1} alt="Paired Omics Data" />
                </Col>
            </Row>
            <Row style={rowStyle}>
                <Col md={4} mdOffset={2} style={colStyle}>
                    <img style={imgStyle} src={slide2} alt="FAIR Data" />
                </Col>
                <Col md={4} style={colStyle}>
                    <h1>FAIR Data</h1>
                    <p style={textStyle}>The Paired Omics Data Platform relies on publicly available data deposited in standard databases and promotes FAIR principles. Metabolomics project information stored in MASSive or MetaboLights can be quickly linked to public genomes stored in NCBI or JGI. Coupling these data with minimal experimental details in a computer readable format allows for large-scale correlations of metabolome changes. Linking these publically available data will facilitate new discoveries and algorithms for predicting chemical structures from genomic information.
                </p>
                </Col>
            </Row>
            <Row style={rowStyle}>
                <Col md={4} mdOffset={2} style={colStyle}>
                    <h1>Minimal Metadata</h1>
                    <p style={textStyle}>
                        The Paired Omics Data Platform collects a set of minimal metadata in a standardized, computer readable format. Relevant experimental details related to Sample Preparation, Extraction Methods, and Instrumentation Methods can be added and identified with user-defined labels for quick recall and linking.
                    </p>
                </Col>
                <Col md={4} style={colStyle}>
                    <img style={imgStyle} src={slide3} alt="Minimal Metadata" />
                </Col>
            </Row>
            <Row style={rowStyle}>
                <Col md={4} mdOffset={2} style={colStyle}>
                    <img style={imgStyle} src={slide4} alt="Quick Linking" />
                </Col>
                <Col md={4} style={colStyle}>
                    <h1>Quick Linking</h1>
                    <p style={textStyle}>The Paired Omics Data Platform makes linking a mass spectrometry file with a genome and the associated metadata quick and easy. The modular format reduces repetition and allows for rapid input of large studies.
                </p>
                </Col>
            </Row>
            <Row style={rowStyle}>
                <Col md={4} mdOffset={2} style={colStyle}>
                    <h1>Gene Cluster - Molecule Linking
                </h1>
                    <p style={textStyle}>
                        The Paired Omics Data Platform also collects publically available links between known biosynthetic gene clusters and molecules or molecular families. These fine-grained connections will inform future large scale predictions of structures from genomic data.
                </p>
                </Col>
                <Col md={4} style={colStyle}>
                    <img style={{ ...imgStyle, paddingTop: '30px' }} src={slide5} alt="Gene Cluster - Molecule Linking" />
                </Col>
            </Row>
        </div>
    );
}
