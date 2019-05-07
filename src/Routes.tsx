import * as React from "react";

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

import { Welcome } from './pages/Welcome';
import { Projects } from "./pages/Projects";
import { Project } from "./pages/Project";
import { AddProject } from "./pages/AddProject";
import { EditProject } from "./pages/EditProject";
import { PendingProjects } from "./pages/PendingProjects";
import { ReviewProject } from "./pages/ReviewProject";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar, Nav } from "react-bootstrap";

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
                    <li><Link to="/projects">List</Link></li>
                    <li><Link to="/projects/add">Add</Link></li>
                    <li><Link to="/pending">Review</Link></li>
                </Nav>
            </Navbar>
            <Switch>
                <Route path="/" exact component={Welcome} />
                <Route path="/projects" exact component={Projects} />
                <Route path="/projects/add" exact component={AddProject} />
                <Route path="/projects/:id/edit" component={EditProject} />
                <Route path="/projects/:id" component={Project} />
                <ProtectedRoute path="/pending" exact component={PendingProjects} />
                <ProtectedRoute path="/pending/:id" component={ReviewProject} />
            </Switch>
        </Router>
    );
}