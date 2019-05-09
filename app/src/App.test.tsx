import * as React from "react";

import { shallow } from "enzyme";

import Form from "react-jsonschema-form";
import { Button } from "react-bootstrap";

import { App, IState } from "./App";
import { kitchenSinkDoc } from './test.fixtures';
import { PairedDataRecord } from "./PairedDataRecord";
import { injectForeignKeySearchMethods } from "./validate";

describe('App', () => {
    describe('with schema and uischema loaded', () => {
        let wrapper: any;
        beforeEach((cb) => {
            wrapper = shallow<App, {}, IState>(<App />, { disableLifecycleMethods: true });
            const schema = require('../public/schema.json');
            const uiSchema = require('../public/uischema.json');
            const app: App = wrapper.instance();
            injectForeignKeySearchMethods(uiSchema, app);
            wrapper.setState({
                schema, uiSchema
            }, cb);
        });

        it('should render a Form', () => {
            expect(wrapper.find(Form)).toBeTruthy();
        });

        it('should render 4 buttons', () => {
            expect(wrapper.find(Button).length).toBe(4);
        })

        describe('filled with kitchen sink sample document using fillForm()', () => {
            beforeEach(() => {
                wrapper.instance().fillForm(kitchenSinkDoc);
            });

            it('should render PairedDataRecord', () => {
                expect(wrapper.find(PairedDataRecord)).toBeTruthy();
            });
        });

        describe('filled with kitchen sink sample document using uploadGenomeMetabolomeLinks', () => {
            beforeEach(() => {
                const rows = [{
                    "Aeration": "not shaking", 
                    "BioSample accession number": "SAMEA3648350", 
                    "Buffering": undefined, 
                    "Collision energy": undefined, 
                    "Column details": "Reverse Phase", 
                    "ENA/NCBI accession number": undefined, 
                    "Extraction Method Label": "beer", 
                    "Extraction solvent": "beer=0.9;Water=0.1", 
                    "GenBank accession number": "AL645882", 
                    "Genome Label": "Streptomyces coelicolor A3(2)", 
                    "Genome or Metagenome": "genome", 
                    "Growth medium": "blood", 
                    "Growth phase or OD": undefined, 
                    "Growth temperature": 1, 
                    "Growth time": undefined, 
                    "Instrument mode": "Positive", 
                    "Instrumentation": "blackhole", 
                    "Instrumentation Method Label": "bh", 
                    "Key publications": "12000953", 
                    "Location of metabolomics data file": "ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2", 
                    "MGnify accession number": undefined, 
                    "Mass range": undefined, 
                    "Medium type": "liquid", 
                    "Metagenome details": "Human", 
                    "Metagenomic sample description": "met sam desc", 
                    "Other extraction details": "no alc", 
                    "Other growth conditions": undefined, 
                    "Other instrumentation information": undefined, 
                    "RefSeq accession number": "NC_003888.3", 
                    "Sample Growth Conditions Label": "blod"
                }];
                wrapper.instance().uploadGenomeMetabolomeLinks(rows);
            });

            it('should render PairedDataRecord', () => {
                expect(wrapper.find(PairedDataRecord)).toBeTruthy();
            });
        });

    });
});