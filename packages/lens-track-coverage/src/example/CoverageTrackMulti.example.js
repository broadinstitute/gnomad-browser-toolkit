/* eslint-disable camelcase */

import React, { Component } from 'react'
import Slider from 'material-ui/Slider'
import {
  fetchAllByGeneName,
  groupExonsByTranscript,
} from 'utilities'

import RegionViewer from '../../../RegionViewer'

import CoverageTrack from '../index'
import TranscriptTrack from '../../TranscriptTrack'
import VariantTrack from '../../VariantTrack'

import examplePageStyles from './CoverageTrackMulti.example.css'

const testGenes = [
  'PCSK9',
  'ZNF658',
  'MYH9',
  'FMR1',
  'BRCA2',
  'CFTR',
  'FBN1',
  'TP53',
  'SCN5A',
  'MYH7',
  'MYBPC3',
  'ARSF',
  'CD33',
]

// import testData from 'data/region-viewer-full-PCSK9.json'
// import testData from 'data/region-viewer-full-ZNF658.json'
// import testData from 'data/region-viewer-full-MYH9.json'
// import testData from 'data/region-viewer-full-FMR1.json'
import testData from 'data/region-viewer-full-BRCA2-v1.json'
// import testData from 'data/region-viewer-full-CFTR.json'
// import testData from 'data/region-viewer-full-FBN1.json'
// import testData from 'data/region-viewer-full-TP53-V1.json'
// import testData from 'data/region-viewer-full-SCN5A.json'
// import testData from 'data/region-viewer-full-MYH7.json'
// import testData from 'data/region-viewer-full-MYBPC3.json'
// import testData from 'data/region-viewer-full-ARSF.json'
// import testData from 'data/region-viewer-full-CD33.json'

class RegionViewerFullExample extends Component {
  state = {
    hasData: false,
    padding: 150,
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData = () => {
    // fetchAllByGeneName('TP53').then((data) => {
    //   this.setState({ data })
    //   this.setState({ hasData: true })
    //   this.forceUpdate()
    // })
    // const gene = 'data/region-viewer-full-PCSK9.json'
    this.setState({
      // data: testData.gene,
      data: testData.gene,
      hasData: true,
    })
  }

  setPadding = (event, newValue) => {
    const padding = Math.floor(2000 * newValue)
    this.setState({ padding })
  }

  render() {
    if (!this.state.hasData) {
      return <p>Loading!</p>
    }
    // const { transcript: { exons }, exome_coverage, genome_coverage } = this.state.data
    const {
      transcript: { exons },
      exome_coverage,
      genome_coverage,
      exome_variants,
      genome_variants,
      exacv1_coverage,
      exacv1_variants,
    } = this.state.data
    const geneExons = this.state.data.exons
    const transcriptsGrouped = groupExonsByTranscript(geneExons)
    const regionAttributesConfig = {
      CDS: {
        color: '#212121',
        thickness: '30px',
      },
      start_pad: {
        color: '#BDBDBD',
        thickness: '3px',
      },
      end_pad: {
        color: '#BDBDBD',
        thickness: '3px',
      },
      intron: {
        color: '#BDBDBD',
        thickness: '3px',
      },
      default: {
        color: '#grey',
        thickness: '3px',
      },
    }
    return (
      <div className={examplePageStyles.page}>
        <Slider
          style={{
            width: 800,
          }}
          onChange={this.setPadding}
        />
        <RegionViewer
          width={1000}
          regions={exons}
          regionAttributes={regionAttributesConfig}
          padding={this.state.padding}
        >
          <CoverageTrack
            title={'gnomAD coverage'}
            height={200}
            exomeCoverage={exome_coverage}
            genomeCoverage={genome_coverage}
          />
          <VariantTrack
            title={'gnomAD exome variants'}
            height={25}
            variants={exome_variants}
          />
          <VariantTrack
            title={'gnomAD genome variants'}
            height={25}
            variants={genome_variants}
          />
          <TranscriptTrack
            height={10}
            transcriptsGrouped={transcriptsGrouped}
          />
          <CoverageTrack
            title={'ExACv1 coverage'}
            height={200}
            exomeCoverage={exacv1_coverage}
          />
          <VariantTrack
            title={'ExACv1 variants'}
            height={25}
            variants={exacv1_variants}
          />
          <TranscriptTrack
            height={10}
            transcriptsGrouped={transcriptsGrouped}
          />
        </RegionViewer>
      </div>
    )
  }
}

export default RegionViewerFullExample
