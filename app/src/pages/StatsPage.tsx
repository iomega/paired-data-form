import React from 'react'
import { useStats } from '../api';
import { ListGroup, ListGroupItem, Badge, Grid, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const style = { padding: '10px' };

const ListItem = ({ title, value, count }: { title: string, value: string, count: number }) => (
    <ListGroupItem key={value}>
        <Link to={{
            pathname: '/projects',
            search: `fk=${title}&fv=${value}`
        }}>
            {value}
        </Link>
        <Badge>{count}</Badge>
    </ListGroupItem>
);

export const StatsPage = () => {
    const stats = useStats();
    if (stats.loading) {
        return <div style={style}>Loading...</div>;
    }
    if (!stats.data) {
        return <div style={style}>Error: {stats.error!.message}</div>;
    }
    const data = stats.data;
    return (
        <div style={style} >
            <Grid fluid>
                <Row>
                    <h2>Statistics of all available projects</h2>
                    <Col md={4}>
                        <fieldset className="global">
                            <legend>Overall</legend>
                            <ListGroup>
                                <ListGroupItem>Number of projects <Badge>{data.global.projects}</Badge></ListGroupItem>
                                <ListGroupItem>Number of unique principal investigators <Badge>{data.global.principal_investigators}</Badge></ListGroupItem>
                                <ListGroupItem>Number of unique metabolome samples <Badge>{data.global.metabolome_samples}</Badge></ListGroupItem>
                                <ListGroupItem>Number of unique links between biosynthetic gene clusters<br/> and MS/MS spectra <Badge>{data.global.bgc_ms2}</Badge></ListGroupItem>
                            </ListGroup>
                        </fieldset>

                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Top principal investigators</legend>
                            <ListGroup>
                                {data.top.principal_investigators.map(
                                    ([value, count]) => <ListItem key={value} title="principal_investigator" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Top submitters</legend>
                            <ListGroup>
                                {data.top.submitters.map(
                                    ([value, count]) => <ListItem key={value} title="submitter" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                </Row>
                <Row>
                    <Col md={4}>
                        <fieldset>
                            <legend>Genome types</legend>
                            <ListGroup>
                                {data.top.genome_types.map(
                                    ([value, count]) => <ListItem key={value} title="genome_type" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Top species</legend>
                            <ListGroup>
                                {data.top.species.map(
                                    ([value, count]) => <ListItem key={value} title="species" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Instrument types</legend>
                            <ListGroup>
                                {data.top.instrument_types.map(
                                    ([value, count]) => <ListItem key={value} title="instrument_type" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Ionization modes</legend>
                            <ListGroup>
                                {data.top.ionization_modes.map(
                                    ([value, count]) => <ListItem key={value} title="ionization_mode" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Growth media</legend>
                            <ListGroup>
                                {data.top.growth_media.map(
                                    ([value, count]) => <ListItem key={value} title="growth_medium" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Metagenome host or isolation source</legend>
                            <ListGroup>
                                {data.top.metagenomic_environment.map(
                                    ([value, count]) => <ListItem key={value} title="metagenomic_environment" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={4}>
                        <fieldset>
                            <legend>Top solvents</legend>
                            <ListGroup>
                                {data.top.solvents.map(
                                    ([value, count]) => <ListItem key={value} title="solvent" value={value} count={count} />
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                </Row>
            </Grid>
        </div>
    )
}