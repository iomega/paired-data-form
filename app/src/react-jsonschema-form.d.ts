declare module '@rjsf/core/dist/cjs/components/fields/ArrayField';
declare module '@rjsf/core/dist/cjs/components/AddButton';
declare module '@rjsf/core/dist/cjs/components/IconButton';
declare module '@rjsf/core/lib/utils' {
    export function toIdSchema(schema: any, id: any, definitions: any, formData: any, idPrefix: any): IdSchema
    export function getDefaultFormState(schema: any, id: any, definitions: any): any
}