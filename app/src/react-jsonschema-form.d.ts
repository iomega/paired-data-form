declare module 'react-jsonschema-form/lib/components/fields/ArrayField';
declare module 'react-jsonschema-form/lib/components/AddButton';
declare module 'react-jsonschema-form/lib/components/IconButton';
declare module 'react-jsonschema-form/lib/utils' {
    export function toIdSchema(schema: any, id: any, definitions: any, formData: any, idPrefix: any): IdSchema
    export function getDefaultFormState(schema: any, id: any, definitions: any): any
}