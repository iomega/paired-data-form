import * as React from "react";

import { JSONSchema6 } from "json-schema";
import { Button, ButtonGroup, Glyphicon } from 'react-bootstrap';
import Form from "react-jsonschema-form";

import "./App.css";

interface IState {
  schema: JSONSchema6;
  uiSchema: object;
}

class App extends React.Component<{}, IState> {
  public state = { schema: {}, uiSchema: {} };

  public componentDidMount() {
    fetch("schema.json")
      .then(r => r.json())
      .then(schema => this.setState({ schema }));
    fetch("uischema.json")
      .then(r => r.json())
      .then(uiSchema => this.setState({ uiSchema }));
  }

  public render() {
    return (
      <div className="App">
        {this.state.schema ? (
          <Form schema={this.state.schema} uiSchema={this.state.uiSchema}>
            <ButtonGroup>
              <Button><Glyphicon glyph="upload" /> Upload</Button>
              <Button><Glyphicon glyph="download" /> Download</Button>
              <Button bsStyle="primary"><Glyphicon glyph="ok" /> Save</Button>
              <Button><Glyphicon glyph="remove" /> Reset</Button>
            </ButtonGroup>
          </Form>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default App;
