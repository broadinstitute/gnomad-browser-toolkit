import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

const vepType = new GraphQLObjectType({
  name: 'VEP',
  fields: () => ({
    TSL: { type: GraphQLString },
    ancestral: { type: GraphQLString },
    SYMBOL: { type: GraphQLString },
    EAS_MAF: { type: GraphQLString },
    Feature: { type: GraphQLString },
    Codons: { type: GraphQLString },
    MOTIF_NAME: { type: GraphQLString },
    DOMAINS: { type: GraphQLString },
    SIFT: { type: GraphQLString },
    VARIANT_CLASS: { type: GraphQLString },
    CDS_position: { type: GraphQLString },
    CCDS: { type: GraphQLString },
    Allele: { type: GraphQLString },
    PolyPhen: { type: GraphQLString },
    MOTIF_SCORE_CHANGE: { type: GraphQLString },
    IMPACT: { type: GraphQLString },
    HGVSp: { type: GraphQLString },
    ENSP: { type: GraphQLString },
    LoF: { type: GraphQLString },
    INTRON: { type: GraphQLString },
    Existing_variation: { type: GraphQLString },
    HGVSc: { type: GraphQLString },
    LoF_filter: { type: GraphQLString },
    MOTIF_POS: { type: GraphQLString },
    HIGH_INF_POS: { type: GraphQLString },
    AA_MAF: { type: GraphQLString },
    LoF_flags: { type: GraphQLString },
    AFR_MAF: { type: GraphQLString },
    UNIPARC: { type: GraphQLString },
    cDNA_position: { type: GraphQLString },
    PUBMED: { type: GraphQLString },
    ALLELE_NUM: { type: GraphQLString },
    Feature_type: { type: GraphQLString },
    GMAF: { type: GraphQLString },
    HGNC_ID: { type: GraphQLString },
    PHENO: { type: GraphQLString },
    LoF_info: { type: GraphQLString },
    SWISSPROT: { type: GraphQLString },
    EXON: { type: GraphQLString },
    EUR_MAF: { type: GraphQLString },
    Consequence: { type: GraphQLString },
    Protein_position: { type: GraphQLString },
    Gene: { type: GraphQLString },
    STRAND: { type: GraphQLString },
    DISTANCE: { type: GraphQLString },
    EA_MAF: { type: GraphQLString },
    SYMBOL_SOURCE: { type: GraphQLString },
    Amino_acids: { type: GraphQLString },
    TREMBL: { type: GraphQLString },
    CLIN_SIG: { type: GraphQLString },
    SAS_MAF: { type: GraphQLString },
    MINIMISED: { type: GraphQLString },
    HGVS_OFFSET: { type: GraphQLString },
    ASN_MAF: { type: GraphQLString },
    BIOTYPE: { type: GraphQLString },
    context: { type: GraphQLString },
    SOMATIC: { type: GraphQLString },
    AMR_MAF: { type: GraphQLString },
    CANONICAL: { type: GraphQLString },
  }),
})

export default vepType
