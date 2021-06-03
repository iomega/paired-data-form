import fs from 'fs';
import path from 'path';

export const loadSchema = (fn = path.join(__dirname, '../../../app/public/schema.json')) => {
    return JSON.parse(fs.readFileSync(fn, 'utf-8'));
};

type Lookup = Map<string, string>;

function enum2map(choices: any[]): Lookup {
    return new Map<string, string>(
        choices.map((c) => [c.enum[0], c.title])
    );
}

export class Lookups {
    readonly genome_type: Lookup;
    readonly proteome_types: Lookup;
    readonly growth_media: Lookup;
    readonly metagenomic_environment: Lookup;
    readonly instrument: Lookup;
    readonly ionization_mode: Lookup;
    readonly ionization_type: Lookup;
    readonly solvent: Lookup;

    constructor(schema = loadSchema()) {
        const genome_types_enum: string[] = schema.properties.genomes.items.properties.genome_ID.properties.genome_type.enum;
        this.genome_type = new Map<string, string>(
            genome_types_enum.map(s => [s, s])
        );
        const proteome_types_enum: string[] = schema.properties.proteomes.items.properties.proteome_ID.properties.proteome_type.enum;
        this.proteome_types = new Map<string, string>(
            proteome_types_enum.map(s => [s, s])
        );
        this.growth_media = enum2map(
            schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[1].properties.medium.anyOf
        );
        this.metagenomic_environment = enum2map(
            schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[0].properties.metagenomic_environment.oneOf
        );
        this.instrument = enum2map(
            schema.properties.experimental.properties.instrumentation_methods.items.properties.instrumentation.properties.instrument.anyOf
        );
        this.ionization_mode = enum2map(
            schema.properties.experimental.properties.instrumentation_methods.items.properties.mode.anyOf
        );
        this.ionization_type = enum2map(
            schema.properties.experimental.properties.instrumentation_methods.items.properties.ionization.properties.ionization_type.anyOf
        );
        this.solvent = enum2map(
            schema.properties.experimental.properties.extraction_methods.items.properties.solvents.items.properties.solvent.anyOf
        );
    }
}
