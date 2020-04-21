import * as React from "react";

import { Glyphicon, FormControl, Button, Form, InputGroup } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export type FilterKey = 'principal_investigator'
    | 'submitter' | 'genome_type' | 'species'
    | 'metagenomic_environment' | 'instrument_type'
    | 'growth_medium' | 'solvent';

interface Props {
    query?: string;
    filter?: {
        key: FilterKey;
        value: string;
    }
    submitSearch(query: string): void;
    clearSearch(): void;
    clearFilter(): void;
}

export const ProjectSearch = (props: Props) => {
    const [query, setQuery] = useState<string>(props.query ? props.query : '');

    useEffect(() => {
        setQuery(props.query ? props.query : '');
    }, [props.query])

    function submitSearch(e: React.FormEvent<Form>) {
        e.preventDefault();
        props.submitSearch(query);
    }

    function clearSearch() {
        setQuery('');
        if (props.query) {
            props.clearSearch();
        }
    }

    return (
        <Form onSubmit={submitSearch}>
            <InputGroup>
                <FormControl
                    type="text"
                    value={query}
                    placeholder="Search ..."
                    onChange={(e: any) => setQuery(e.target.value)}
                />
                {query && (
                    <InputGroup.Button>
                        <Button title="Clear" type="reset" onClick={clearSearch}>
                            <Glyphicon glyph="remove" />
                        </Button>
                    </InputGroup.Button>
                )}
                <InputGroup.Button>
                    <Button title="Search" type="submit">
                        <Glyphicon glyph="search" />
                    </Button>
                </InputGroup.Button>
            </InputGroup>
            {props.filter && (
                <div>
                    <span>Filtered on {props.filter.key.replace('_', ' ')}: {props.filter.value}</span>
                    <Button bsStyle="link" bsSize="small" title="Clear filter" onClick={props.clearFilter}>
                        <Glyphicon glyph="remove" />
                    </Button>
                </div>
            )}
            <div>
                <span>Example search queries: </span>
                <Link title="Any project which contains Streptomyces, mostly found in a species name or genome label" to={{
                    pathname: '/projects',
                    search: `q=Streptomyces`
                }}>Streptomyces</Link>,&nbsp;
                <Link title="Any project which contains the biosample identifier" to={{
                    pathname: '/projects',
                    search: `q=SAMN02603879`
                }}>SAMN02603879</Link>,&nbsp;
                <Link title="Any project which contains a word that starts with scrip" to={{
                    pathname: '/projects',
                    search: `q=scrip*`
                }}>scrip*</Link>,&nbsp;
                <Link title="Any project which contains tubes or flask" to={{
                    pathname: '/projects',
                    search: `q=tubes | flask`
                }}>tubes | flask</Link>,&nbsp;
                <Link title="Any project which contains Pieter and Carmen" to={{
                    pathname: '/projects',
                    search: `q=Pieter+%2B+Carmen`
                }}>Pieter + Carmen</Link>,&nbsp;
                <Link title="Any project which contains Pieter and not Carmen" to={{
                    pathname: '/projects',
                    search: `q=Pieter+%2B+-Carmen`
                }}>Pieter + -Carmen</Link>,&nbsp;
                <Link title='Any project which contains Pieter and Carmen or Emily' to={{
                    pathname: '/projects',
                    search: `q=Pieter %2B (Carmen | Emily)`
                }}>Pieter + (Carmen | Emily)</Link>,&nbsp;
                <Link title='Any project which contains Pieter and ' to={{
                    pathname: '/projects',
                    search: `q="acetonitrile with"`
                }}>"acetonitrile with"</Link>
            </div>
        </Form>
    );
}