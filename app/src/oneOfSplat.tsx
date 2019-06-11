import * as React from 'react';

export function oneOfSplat(schema: any, prop: string, offset: number) {
    const splat = new Map<string, JSX.Element>();
    schema.dependencies[prop].oneOf.forEach((d: any) => {
        Object.keys(d.properties).filter(p => p !== prop).forEach((p: any) => {
            splat.set(p, <th key={offset + splat.size}>{d.properties[p].title}</th>);
        });
    });
    return splat;
}
