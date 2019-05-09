import * as React from "react";

import { PairedDataRecord } from "../PairedDataRecord";
import { Link } from "react-router-dom";
import { useFetch } from "../useFetch";

export function Project() {
    const data = useFetch('/examples/paired_datarecord_MSV000078839_example.json');
    const schema = useFetch('/schema.json');
    let record = <span>Loading ...</span>;
    if (data && schema) {
        record = (
            <div>
                <PairedDataRecord data={data} schema={schema}/>
                <Link to="/projects/MSV000078839.1/edit">Edit</Link>
            </div>
        );
    }
    return (
        <div>
            <h1>Item page for one dataset with a edit and clone button</h1>
            {record}
        </div>
    );
}