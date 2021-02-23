import * as React from "react";

import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

import { Navbar, Nav, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import { Welcome } from "./pages/Welcome";
import { Projects } from "./pages/Projects";
import { Project } from "./pages/Project";
import { AddProject } from "./pages/AddProject";
import { EditProject } from "./pages/EditProject";
import { PendingProjects } from "./pages/PendingProjects";
import { ReviewProject } from "./pages/ReviewProject";
import { ProtectedRoute } from "./ProtectedRoute";
import { CloneProject } from "./pages/CloneProject";
import { HistoryProject } from "./pages/HistoryProject";
import { About } from "./pages/About";
import { StatsPage } from "./pages/StatsPage";
import { DownloadPage } from "./pages/DownloadPage";
import { MethodsPage } from "./pages/MethodsPage";

export function Routes() {
  // Any route her should also be defined in ../dockerfiles/nginx.default.conf
  return (
    <Router>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Paired Omics Data Platform</Link>
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
          <LinkContainer to="/methods">
            <NavItem>Methods</NavItem>
          </LinkContainer>
          <LinkContainer to="/about">
            <NavItem>About</NavItem>
          </LinkContainer>
        </Nav>
      </Navbar>
      <Switch>
        <Route path="/" exact component={Welcome} />
        <Route path="/add" exact component={AddProject} />
        <Route path="/projects/:id/edit" component={EditProject} />
        <Route path="/projects/:id/clone" component={CloneProject} />
        <Route path="/projects/:id/history" component={HistoryProject} />
        <Route path="/projects/:id" component={Project} />
        <Route path="/projects" component={Projects} />
        <Route path="/stats" component={StatsPage} />
        <Route path="/download" component={DownloadPage} />
        <Route path="/methods" component={MethodsPage} />
        <Route path="/about" component={About} />
        <ProtectedRoute path="/pending" exact component={PendingProjects} />
        <ProtectedRoute path="/pending/:id" component={ReviewProject} />
      </Switch>
    </Router>
  );
}
