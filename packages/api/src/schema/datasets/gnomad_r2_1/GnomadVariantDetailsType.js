import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

import { VariantInterface } from '../../types/variant'
import { resolveReads, ReadsType } from '../shared/reads'
import { TranscriptConsequenceType } from '../shared/transcriptConsequence'

const HistogramType = new GraphQLObjectType({
  name: 'Histogram',
  fields: {
    bin_edges: { type: new GraphQLList(GraphQLFloat) },
    bin_freq: { type: new GraphQLList(GraphQLFloat) },
    n_larger: { type: GraphQLInt },
    n_smaller: { type: GraphQLInt },
  },
})

const GnomadSubpopulationType = new GraphQLObjectType({
  name: 'GnomadVariantSubpopulation',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    ac: { type: new GraphQLNonNull(GraphQLInt) },
    an: { type: new GraphQLNonNull(GraphQLInt) },
    ac_hom: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

const GnomadPopulationType = new GraphQLObjectType({
  name: 'GnomadVariantPopulation',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    ac: { type: new GraphQLNonNull(GraphQLInt) },
    an: { type: new GraphQLNonNull(GraphQLInt) },
    ac_hemi: { type: new GraphQLNonNull(GraphQLInt) },
    ac_hom: { type: new GraphQLNonNull(GraphQLInt) },
    subpopulations: { type: new GraphQLList(GnomadSubpopulationType) },
  },
})

const GnomadVariantQualityMetricsType = new GraphQLObjectType({
  name: 'GnomadVariantQualityMetrics',
  fields: {
    genotypeDepth: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantGenotypeDepth',
        fields: {
          all: { type: HistogramType },
          alt: { type: HistogramType },
        },
      }),
    },
    genotypeQuality: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantGenotypeQuality',
        fields: {
          all: { type: HistogramType },
          alt: { type: HistogramType },
        },
      }),
    },
    siteQualityMetrics: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantSiteQualityMetrics',
        fields: {
          BaseQRankSum: { type: GraphQLFloat },
          ClippingRankSum: { type: GraphQLFloat },
          DP: { type: GraphQLInt },
          FS: { type: GraphQLFloat },
          InbreedingCoeff: { type: GraphQLFloat },
          MQ: { type: GraphQLFloat },
          MQRankSum: { type: GraphQLFloat },
          QD: { type: GraphQLFloat },
          ReadPosRankSum: { type: GraphQLFloat },
          SiteQuality: { type: GraphQLFloat },
          SOR: { type: GraphQLFloat },
          VQSLOD: { type: GraphQLFloat },
        },
      }),
    },
  },
})

const GnomadVariantDetailsType = new GraphQLObjectType({
  name: 'GnomadVariantDetails',
  interfaces: [VariantInterface],
  fields: {
    // variant interface fields
    alt: { type: new GraphQLNonNull(GraphQLString) },
    chrom: { type: new GraphQLNonNull(GraphQLString) },
    pos: { type: new GraphQLNonNull(GraphQLInt) },
    ref: { type: new GraphQLNonNull(GraphQLString) },
    variantId: { type: new GraphQLNonNull(GraphQLString) },
    xpos: { type: new GraphQLNonNull(GraphQLFloat) },
    // gnomAD specific fields
    age_distribution: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantDetailsAgeDistribution',
        fields: {
          het: { type: HistogramType },
          hom: { type: HistogramType },
        },
      }),
    },
    colocatedVariants: { type: new GraphQLList(GraphQLString) },
    exome: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantDetailsExomeData',
        fields: {
          ac: { type: GraphQLInt },
          an: { type: GraphQLInt },
          ac_hemi: { type: GraphQLInt },
          ac_hom: { type: GraphQLInt },
          faf95: { type: GraphQLFloat },
          faf99: { type: GraphQLFloat },
          filters: { type: new GraphQLList(GraphQLString) },
          populations: { type: new GraphQLList(GnomadPopulationType) },
          qualityMetrics: { type: GnomadVariantQualityMetricsType },
          reads: {
            type: ReadsType,
            resolve: async obj => {
              if (!process.env.READS_DIR) {
                return null
              }
              try {
                return await resolveReads(
                  process.env.READS_DIR,
                  'gnomad_r2_1/combined_bams_exomes',
                  obj
                )
              } catch (err) {
                throw Error('Unable to load reads data')
              }
            },
          },
        },
      }),
    },
    flags: { type: new GraphQLList(GraphQLString) },
    genome: {
      type: new GraphQLObjectType({
        name: 'GnomadVariantDetailsGenomeData',
        fields: {
          ac: { type: GraphQLInt },
          an: { type: GraphQLInt },
          ac_hemi: { type: GraphQLInt },
          ac_hom: { type: GraphQLInt },
          faf95: { type: GraphQLFloat },
          faf99: { type: GraphQLFloat },
          filters: { type: new GraphQLList(GraphQLString) },
          populations: { type: new GraphQLList(GnomadPopulationType) },
          qualityMetrics: { type: GnomadVariantQualityMetricsType },
          reads: {
            type: ReadsType,
            resolve: async obj => {
              if (!process.env.READS_DIR) {
                return null
              }
              try {
                return await resolveReads(
                  process.env.READS_DIR,
                  'gnomad_r2_1/combined_bams_genomes',
                  obj
                )
              } catch (err) {
                throw Error('Unable to load reads data')
              }
            },
          },
        },
      }),
    },
    rsid: { type: GraphQLString },
    sortedTranscriptConsequences: { type: new GraphQLList(TranscriptConsequenceType) },
  },
  isTypeOf: variantData => variantData.gqlType === 'GnomadVariantDetails',
})

export default GnomadVariantDetailsType
