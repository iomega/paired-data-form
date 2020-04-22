import * as React from "react";
import { useLocation, useHistory } from "react-router-dom";

import { useProjects } from "../api";
import { ProjectList } from "../ProjectList";
import { ProjectSearch, FilterKey } from "../ProjectSearch";
import { ProjectPager } from "../ProjectPager";

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
    const defaultSortKey = q ? 'score' : 'met_id';
    const sortKey = params.has('sort') ? params.get('sort')! : defaultSortKey;
    const order = params.has('order') ? params.get('order')! : 'desc';
    const page = params.has('page') ? parseInt(params.get('page')!) : 0;
    const {
        error,
        loading,
        data: projects,
        total,
    } = useProjects(q, filter, page, sortKey, order);

    const sortOn = (key: string) => {
        if (key === sortKey) {
            params.set('order', order === 'asc' ? 'desc' : 'asc');
        }
        params.set('sort', key);
        history.push("/projects?" + params.toString());
    }

    const prevPage = () => {
        const newpage = page - 1;
        if (newpage === 0) {
            params.delete('page');
        } else {
            params.set('page', newpage.toString());
        }
        history.push("/projects?" + params.toString());
    };
    const nextPage = () => {
        const newpage = page + 1;
        params.set('page', newpage.toString());
        history.push("/projects?" + params.toString());
    };

    let list = <span>Loading ...</span>;
    if (error) {
        list = <span>Error: {error.message}</span>
    } else if (!loading) {
        list = (
            <>
                <ProjectList projects={projects} sortKey={sortKey!} sortOrder={order as 'desc' | 'asc'} setSortedOn={sortOn} />
                <ProjectPager
                    prevPage={prevPage}
                    nextPage={nextPage}
                    page={page}
                    page_count={projects.length}
                    total={total}
                />
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
