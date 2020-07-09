import * as React from "react";

import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { ProtectedRoute } from "./ProtectedRoute";
import { Welcome } from './pages/Welcome';
import { About } from "./pages/About";
import { DownloadPage } from "./pages/DownloadPage";


const chunk = import('./chunk');

function lazyNamed(name: string) {
    return lazy(async () => {
        const module: any = await chunk;
        return  {default: module[name]};
    });
}

const Projects = lazyNamed('Projects');
const AddProject = lazyNamed('AddProject');
const EditProject = lazyNamed('EditProject');
const CloneProject = lazyNamed('CloneProject');
const HistoryProject = lazyNamed('HistoryProject');
const Project = lazyNamed('Project');
const PendingProjects = lazyNamed('PendingProjects');
const ReviewProject = lazyNamed('ReviewProject');
const StatsPage = lazyNamed('StatsPage');


export function Routes() {
    return (
        <Router>
            <Navbar>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/" >Paired Omics Data Platform</Link>
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
                    <LinkContainer to="/stats">
                        <NavItem>Statistics</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/download">
                        <NavItem>Download</NavItem>
                    </LinkContainer>
                    <LinkContainer to="/about">
                        <NavItem>About</NavItem>
                    </LinkContainer>
                </Nav>
            </Navbar>
            <Suspense fallback={<div>Loading...</div>}>
                <Switch>
                    <Route path="/" exact component={Welcome} />
                    <Route path="/add" exact component={AddProject} />
                    <Route path="/projects/:id/edit" component={EditProject} />
                    <Route path="/projects/:id/clone" component={CloneProject} />
                    <Route path="/projects/:id/history" component={HistoryProject} />
                    <Route path="/projects/:id" component={Project} />
                    <Route path="/projects" component={Projects} />
                    <Route path="/stats" component={StatsPage} />
                    <Route path="/download" component={DownloadPage}/>
                    <Route path="/about" component={About}/>
                    <ProtectedRoute path="/pending" exact component={PendingProjects} />
                    <ProtectedRoute path="/pending/:id" component={ReviewProject} />
                </Switch>
            </Suspense>
        </Router>
    );
}