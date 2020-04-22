import * as React from "react";

import { Pager } from "react-bootstrap";
import { PAGE_SIZE } from "./api";

interface Props {
    prevPage(): void;
    nextPage(): void;
    page: number;
    page_count: number;
    total: number;
}

export const ProjectPager = ({ page, prevPage, nextPage, page_count, total }: Props) => {
    return (
        <Pager>
            <Pager.Item disabled={page === 0} onClick={prevPage}>
                &larr; Previous
            </Pager.Item>
            <li> {page * PAGE_SIZE + 1} - {(page * PAGE_SIZE) + page_count} of {total} </li>
            <Pager.Item disabled={(page * PAGE_SIZE) + page_count >= total} onClick={nextPage}>
                Next &rarr;
            </Pager.Item>
        </Pager>
    );
}