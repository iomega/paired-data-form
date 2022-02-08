export function injectForeignKeySearchMethods(uiSchema: any, formRef: any) {
  uiSchema.proteomes.items.method.genome_database.foreignKey.search =
    foreignKeySearch(formRef, "genome_database", genomeLabels);
  uiSchema.proteomes.items.identification.genome_database.foreignKey.search =
    foreignKeySearch(formRef, "genome_database", genomeLabels);
  uiSchema.proteomes.items.experimental_details.sample_preparation_label.foreignKey.search =
    foreignKeySearch(formRef, "sample_preparation_label", sampleLabels);
  uiSchema.proteomes.items.experimental_details.instrumentation_method_label.foreignKey.search =
    foreignKeySearch(formRef, "instrumentation_method_label", instrumentLabels);
  uiSchema.genome_metabolome_links.items.genome_label.foreignKey.search =
    foreignKeySearch(formRef, "genome_label", genomeLabels);
  uiSchema.genome_metabolome_links.items.proteome_label.foreignKey.search =
    foreignKeySearch(formRef, "proteome_label", proteomeLabels);
  uiSchema.genome_metabolome_links.items.sample_preparation_label.foreignKey.search =
    foreignKeySearch(formRef, "sample_preparation_label", sampleLabels);
  uiSchema.genome_metabolome_links.items.extraction_method_label.foreignKey.search =
    foreignKeySearch(formRef, "extraction_method_label", extractionLabels);
  uiSchema.genome_metabolome_links.items.instrumentation_method_label.foreignKey.search =
    foreignKeySearch(formRef, "instrumentation_method_label", instrumentLabels);
  uiSchema.BGC_MS2_links.items.MS2_URL.foreignKey.search = foreignKeySearch(
    formRef,
    "MS2_URL",
    ms2Labels
  );
  const comparison_groups =
    uiSchema.BGC_MS2_links.items.omics_based_evidence
      .quantitative_proteomics_experiment.comparison_groups;
  comparison_groups.items.control_group.foreignKey.search = foreignKeySearch(
    formRef,
    "control_group",
    proteomeLabels
  );
  comparison_groups.items.experimental_group.foreignKey.search =
    foreignKeySearch(formRef, "experimental_group", proteomeLabels);
  comparison_groups.items.protein_id.genome.foreignKey.search =
    foreignKeySearch(formRef, "genome", genomeLabels);
}

export function foreignKeySearch(
  formRef: any,
  requiredProp: string,
  labelSearcher: (doc: any) => string[]
) {
  return (prop: string) => {
    const form = formRef.current;
    if (!form) {
      return [];
    }
    const doc = form.state.formData;
    if (!doc) {
      return [];
    }
    if (prop === requiredProp) {
      return labelSearcher(doc);
    }
    throw new Error("Invalid property name: " + prop);
  };
}

function genomeLabels(doc: any) {
  if (!("genomes" in doc && doc.genomes)) {
    return [];
  }
  return doc.genomes.map((r: any) => r.genome_label);
}

function proteomeLabels(doc: any) {
  if (!("proteomes" in doc && doc.proteomes)) {
    return [];
  }
  return doc.proteomes.map((r: any) => r.proteome_label);
}

function sampleLabels(doc: any) {
  if (!doc.experimental.sample_preparation) {
    return [];
  }
  return doc.experimental.sample_preparation.map(
    (r: any) => r.sample_preparation_method
  );
}

function extractionLabels(doc: any) {
  if (!doc.experimental.extraction_methods) {
    return [];
  }
  return doc.experimental.extraction_methods.map(
    (r: any) => r.extraction_method
  );
}

function instrumentLabels(doc: any) {
  if (doc.experimental.instrumentation_methods === undefined) {
    return [];
  }
  return doc.experimental.instrumentation_methods.map(
    (r: any) => r.instrumentation_method
  );
}

function ms2Labels(doc: any) {
  if (!doc.genome_metabolome_links) {
    return [];
  }
  return doc.genome_metabolome_links.map((r: any) => r.metabolomics_file);
}

export function findDuplicates(labels: string[]) {
  function isNotNull(d: number | null): d is number {
    return d !== null;
  }

  return labels
    .map((value, index) => {
      if (labels.indexOf(value) !== index) {
        return index;
      } else {
        return null;
      }
    })
    .filter(isNotNull);
}

export function validateDocument(doc: any, errors: any) {
  if (doc.experimental.extraction_methods) {
    doc.experimental.extraction_methods.forEach((e: any, i: number) => {
      const ratioTotal = e.solvents.reduce((c: number, s: any) => {
        return s.ratio + c;
      }, 0);
      if (ratioTotal > 1) {
        errors.experimental.extraction_methods[i].solvents.addError(
          "Combined ratio not within 0 and 1"
        );
      }
    });
  }
  const gmIds = genomeLabels(doc);
  findDuplicates(gmIds).forEach((d) => {
    if (errors.genomes[d].genome_label) {
      errors.genomes[d].genome_label.addError("Non-unique label");
    }
  });
  const spIds = sampleLabels(doc);
  findDuplicates(spIds).forEach((d) => {
    if (errors.experimental.sample_preparation[d].sample_preparation_method) {
      errors.experimental.sample_preparation[
        d
      ].sample_preparation_method.addError("Non-unique label");
    }
  });
  const emIds = extractionLabels(doc);
  findDuplicates(emIds).forEach((d) => {
    if (errors.experimental.extraction_methods[d].extraction_method) {
      errors.experimental.extraction_methods[d].extraction_method.addError(
        "Non-unique label"
      );
    }
  });
  const imIds = instrumentLabels(doc);
  findDuplicates(imIds).forEach((d) => {
    if (errors.experimental.instrumentation_methods[d].instrumentation_method) {
      errors.experimental.instrumentation_methods[
        d
      ].instrumentation_method.addError("Non-unique label");
    }
  });
  const prIds = proteomeLabels(doc);
  findDuplicates(prIds).forEach((d) => {
    if (errors.proteomes[d].proteome_label) {
      errors.proteomes[d].proteome_label.addError("Non-unique label");
    }
  });
  if (doc.proteomes) {
    doc.proteomes.forEach((proteome: any, i: number) => {
      if (
        proteome.experimental_details &&
        proteome.experimental_details.sample_preparation_label &&
        !spIds.includes(proteome.experimental_details.sample_preparation_label)
      ) {
        errors.proteomes[
          i
        ].experimental_details.sample_preparation_label.addError(
          "Invalid selection"
        );
      }
      if (
        proteome.experimental_details &&
        proteome.experimental_details.instrumentation_method_label &&
        !imIds.includes(
          proteome.experimental_details.instrumentation_method_label
        )
      ) {
        errors.proteomes[
          i
        ].experimental_details.instrumentation_method_label.addError(
          "Invalid selection"
        );
      }
      if (
        proteome.method &&
        proteome.method.genome_database &&
        !gmIds.includes(proteome.method.genome_database)
      ) {
        errors.proteomes[i].method.genome_database.addError("Invalid selection");
      }
      if (
        proteome.identification &&
        proteome.identification.genome_database &&
        !gmIds.includes(proteome.identification.genome_database)
      ) {
        errors.proteomes[i].identification.genome_database.addError("Invalid selection");
      }
    });
  }
  if (doc.genome_metabolome_links) {
    doc.genome_metabolome_links.forEach(
      (genomeMetabolomeLink: any, i: number) => {
        if (
          genomeMetabolomeLink.genome_label &&
          !gmIds.includes(genomeMetabolomeLink.genome_label)
        ) {
          errors.genome_metabolome_links[i].genome_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.proteome_label &&
          !prIds.includes(genomeMetabolomeLink.proteome_label)
        ) {
          errors.genome_metabolome_links[i].proteome_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.sample_preparation_label &&
          !spIds.includes(genomeMetabolomeLink.sample_preparation_label)
        ) {
          errors.genome_metabolome_links[i].sample_preparation_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.extraction_method_label &&
          !emIds.includes(genomeMetabolomeLink.extraction_method_label)
        ) {
          errors.genome_metabolome_links[i].extraction_method_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.instrumentation_method_label &&
          !imIds.includes(genomeMetabolomeLink.instrumentation_method_label)
        ) {
          errors.genome_metabolome_links[
            i
          ].instrumentation_method_label.addError("Invalid selection");
        }
      }
    );
  }
  if (doc.BGC_MS2_links) {
    const msUrls = ms2Labels(doc);
    findDuplicates(msUrls).forEach((d) => {
      errors.genome_metabolome_links[d].metabolomics_file.addError(
        "Non-unique label"
      );
    });
    doc.BGC_MS2_links.forEach((geneSpectraLink: any, i: number) => {
      if (
        geneSpectraLink.MS2_URL &&
        !msUrls.includes(geneSpectraLink.MS2_URL) &&
        errors.BGC_MS2_links &&
        errors.BGC_MS2_links[i]
      ) {
        errors.BGC_MS2_links[i].MS2_URL.addError("Invalid selection");
      }
      if (
        geneSpectraLink.omics_based_evidence &&
        geneSpectraLink.omics_based_evidence
          .quantitative_proteomics_experiment &&
        geneSpectraLink.omics_based_evidence.quantitative_proteomics_experiment
          .comparison_groups
      ) {
        geneSpectraLink.omics_based_evidence.quantitative_proteomics_experiment.comparison_groups.forEach(
          (comparison_group: any, j: number) => {
            if (
              comparison_group.control_group &&
              !prIds.includes(comparison_group.control_group)
            ) {
              errors.BGC_MS2_links[
                i
              ].omics_based_evidence.quantitative_proteomics_experiment.comparison_groups[
                j
              ].control_group.addError("Invalid selection");
            }
            if (
              comparison_group.experimental_group &&
              !prIds.includes(comparison_group.experimental_group)
            ) {
              errors.BGC_MS2_links[
                i
              ].omics_based_evidence.quantitative_proteomics_experiment.comparison_groups[
                j
              ].experimental_group.addError("Invalid selection");
            }
            if (
              comparison_group.protein_id.genome &&
              !gmIds.includes(comparison_group.protein_id.genome)
            ) {
              errors.BGC_MS2_links[
                i
              ].omics_based_evidence.quantitative_proteomics_experiment.comparison_groups[
                j
              ].protein_id.genome.addError("Invalid selection");
            }
            if (
              comparison_group.control_group &&
              comparison_group.experimental_group &&
              comparison_group.control_group === comparison_group.experimental_group
            ) {
              errors.BGC_MS2_links[
                i
              ].omics_based_evidence.quantitative_proteomics_experiment.comparison_groups[
                j
              ].experimental_group.addError('Invalid selection: can not have same control and experimental proteome in comparison group');
            }
          }
        );
      }
    });
  }
  return errors;
}
