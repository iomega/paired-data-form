import * as React from "react";

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { Welcome } from './pages/Welcome';
import { Projects } from "./pages/Projects";
import { Project } from "./pages/Project";
import { AddProject } from "./pages/AddProject";
import { EditProject } from "./pages/EditProject";
import { PendingProjects } from "./pages/PendingProjects";
import { ReviewProject } from "./pages/ReviewProject";
import { ProtectedRoute } from "./ProtectedRoute";
import { CloneProject } from "./pages/CloneProject";
import { HistoryProject } from "./pages/HistoryProject";

export function Routes() {
    return (
        <Router>
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/" >Paired data platform</Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <Nav>
                    <LinkContainer to="/projects">
                        <NavItem>List</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/add">
                        <NavItem>Add</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/pending">
                        <NavItem>Review</NavItem>
                    </LinkContainer>
                </Nav>
            </Navbar>
            <Switch>
                <Route path="/" exact component={Welcome} />
                <Route path="/projects" exact component={Projects} />
                <Route path="/add" exact component={AddProject} />
                <Route path="/projects/:id/edit" component={EditProject} />
                <Route path="/projects/:id/clone" component={CloneProject} />
                <Route path="/projects/:id/history" component={HistoryProject} />
                <Route path="/projects/:id" component={Project} />
                <ProtectedRoute path="/pending" exact component={PendingProjects} />
                <ProtectedRoute path="/pending/:id" component={ReviewProject} />
            </Switch>
        </Router>
    );
}