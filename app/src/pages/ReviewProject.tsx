import * as React from "react";
import { Decide } from "../Decide";

import { PairedDataRecord } from "../PairedDataRecord";
import { useFetch } from "../useFetch";
import { AuthContext } from "../auth";
import { useContext } from "react";

export function ReviewProject() {
    const {token} = useContext(AuthContext);
    const data = useFetch('/examples/paired_datarecord_MSV000078839_example.json');
    const schema = useFetch('/schema.json');
    let record = <span>Loading ...</span>;
    if (data && schema) {
        record = (
            <div>
                <Decide onDeny={()=> {}} onApprove={()=> {}}/>
                <PairedDataRecord data={data} schema={schema}/>
                <Decide onDeny={()=> {}} onApprove={()=> {}}/>
            </div>
        );
    }
    return (
        <div>
            <h1>Review page with buttons to (dis)approve dataset</h1>
            {record}
            <span>API Token = {token}</span>
        </div>
    );
}