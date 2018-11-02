import * as React from 'react';

import { JSONSchema6 } from 'json-schema';
import Form from "react-jsonschema-form";

import './App.css';

interface IState {
  schema: JSONSchema6
}

class App extends React.Component<{}, IState> {
  public state = { schema: {}};

  public componentDidMount() {
    fetch('schema.json').then(r => r.json()).then(schema => this.setState({schema}));
  }

  public render() {
    return (
      <div className="App">
        {this.state.schema ? <Form schema={this.state.schema}/> : <div/>}
      </div>
    );
  }
}

export default App;
