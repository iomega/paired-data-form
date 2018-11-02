import * as React from "react";

import { JSONSchema6 } from "json-schema";
import { Button, ButtonGroup, Glyphicon } from 'react-bootstrap';
import Form from "react-jsonschema-form";

import "./App.css";

interface IState {
  schema: JSONSchema6;
}

class App extends React.Component<{}, IState> {
  public state = { schema: {} };

  public componentDidMount() {
    fetch("schema.json")
      .then(r => r.json())
      .then(schema => this.setState({ schema }));
  }

  public render() {
    return (
      <div className="App">
        {this.state.schema ? (
          <Form schema={this.state.schema}>
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
