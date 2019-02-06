
export interface IExpander {
    fk: string;
    ths(offset: number): JSX.Element[];
    tds(row: any, offset: number): JSX.Element[];
}
