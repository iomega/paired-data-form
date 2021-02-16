import { FilterFields, DEFAULT_PAGE_SIZE, Order, SearchOptions, SortFields } from '../store/search';

function checkRange(svalue: string, label: string, min: number, max: number) {
    const value = parseInt(svalue);
    if (Number.isNaN(value)) {
        throw `${label} is not an integer`;
    }
    if (value < min || value > max) {
        throw `${label} must be between \`${min}\` and \`${max}\``;
    }
    return value;
}

export function validateSearchOptions(query: any) {
    const options: SearchOptions = {};

    if (query.q) {
        options.query = query.q;
    }
    if (query.fk || query.fv) {
        if (query.fk && query.fv) {
            if (!(query.fk in FilterFields)) {
                throw 'Invalid `fk`';
            }
            options.filter = {
                key: query.fk,
                value: query.fv
            };
        } else {
            throw 'Require both `fk` and `fv` to filter';
        }
    }
    if (query.size) {
        options.size = checkRange(query.size, 'Size', 1, 1000);
    } else {
        options.size = DEFAULT_PAGE_SIZE;
    }
    if (query.page) {
        options.from = checkRange(query.page, 'Page', 0, 1000) * options.size;
    } else {
        options.from = 0;
    }
    if (query.sort) {
        if (!(query.sort in SortFields)) {
            throw 'Invalid `sort`';
        }
        options.sort = query.sort;
    }
    if (query.order) {
        if (!(query.order in Order)) {
            throw 'Invalid `order`, must be either `desc` or `asc`';
        }
        options.order = Order[query.order as 'desc' | 'asc'];
    }
    return options;
}
