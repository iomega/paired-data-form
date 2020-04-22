import * as React from "react";
import { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";

import { useProjects } from "../api";
import { compareProjectSummary } from "../summarize";
import { ProjectList } from "../ProjectList";
import { ProjectSearch, FilterKey } from "../ProjectSearch";
import { Pager } from "react-bootstrap";

const style = { padding: '10px' };


export function Projects() {
    const history = useHistory();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const q = params.has('q') ? params.get('q')! : undefined;
    let filter = undefined;
    if (params.has('fk') && params.has('fv')) {
        filter = {
            key: params.get('fk') as FilterKey,
            value: params.get('fv')!
        }
    }
    const [page, setPage] = useState(0);
    const {
        error,
        loading,
        data: projects,
        setData: setProjects
    } = useProjects(q, filter, page);

    const [sortkey, setSortKey] = useState('met_id');
    const sortOn = (key: string) => {
        // TODO reverse sort when sorted column is clicked again
        const data = [...projects];
        data.sort(compareProjectSummary(key));
        setProjects({ data });
        setSortKey(key);
    }
    const prevPage = () => {
        setPage(page - 1);
    };
    const nextPage = () => {
        setPage(page + 1);
    };

    let list = <span>Loading ...</span>;
    if (error) {
        list = <span>Error: {error.message}</span>
    } else if (!loading) {
        list = (
            <>
                <ProjectList projects={projects} sortedOn={sortkey} setSortedOn={sortOn} />
                <Pager>
                    <Pager.Item onClick={prevPage}>
                        &larr; Previous
                    </Pager.Item>
                    {' '}
                    <Pager.Item onClick={nextPage}>
                        Next &rarr;
                  </Pager.Item>
                </Pager>
            </>
        );
    }

    function clearFilter() {
        params.delete('fk');
        params.delete('fv');
        history.push("/projects?" + params.toString());
    }

    function clearSearch() {
        params.delete('q')
        history.push("/projects?" + params.toString());
    }

    function submitSearch(query: string) {
        params.set('q', query);
        history.push("/projects?" + params.toString());
    }

    return (
        <div style={style}>
            <h2>Available projects</h2>
            <ProjectSearch query={q} filter={filter} submitSearch={submitSearch} clearSearch={clearSearch} clearFilter={clearFilter} />
            {list}
        </div>
    );
}
