import React from 'react'
import { useStats } from '../api';
import { ListGroup, ListGroupItem, Badge, Grid, Row, Col } from 'react-bootstrap';

const style = { padding: '10px' };

export const StatsPage = () => {
    const stats = useStats();
    if (stats.loading) {
        return <div style={style}>Loading...</div>;
    }
    if (!stats.data) {
        return <div style={style}>Error: {stats.error!.message}</div>;
    }
    return (
        <div style={style}>
            <h3>Statistics of all paired data platform projects</h3>
            <Grid>
                <Row>
                    <Col md={6}>
                        <fieldset className="global">
                            <legend>Overall</legend>
                            <ListGroup>
                                <ListGroupItem>Number of projects <Badge>{stats.data.global.projects}</Badge></ListGroupItem>
                                <ListGroupItem>Number of unique principal investigators <Badge>{stats.data.global.principal_investigators}</Badge></ListGroupItem>
                            </ListGroup>
                        </fieldset>

                    </Col>
                </Row>
                <Row>
                    <Col md={6}>
                        <fieldset>
                            <legend>Top principal investigators</legend>
                            <ListGroup>
                                {stats.data.top.principal_investigators.map(
                                    ([value, count]) => <ListGroupItem key={value}>{value} <Badge>{count}</Badge></ListGroupItem>
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                    <Col md={6}>
                        <fieldset>
                            <legend>Instrument types</legend>
                            <ListGroup>
                                {stats.data.top.instruments_types.map(
                                    ([value, count]) => <ListGroupItem key={value}>{value} <Badge>{count}</Badge></ListGroupItem>
                                )}
                            </ListGroup>
                        </fieldset>
                    </Col>
                </Row>
            </Grid>
        </div>
    )
}