/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-shadow */
/* eslint-disable comma-dangle */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable no-case-declarations */

import React, { PropTypes } from 'react'

import GenePageHOC from 'lens-redux-gene-page/lib/containers/GenePage'
import GeneInfo from './GeneInfo'
import GeneSettings from './GeneSettings'
import RegionViewer from './RegionViewer'
import Table from './Table'
import { fetchSchzGenePage } from './fetch'

import css from './styles.css'

const AppGenePage = ({
  gene,
  isFetching,
}) => {
  if (isFetching || !gene) {
    return <div>Loading...!</div>
  }
  return (
    <div className={css.genePage}>
      <div className={css.summary}>
        <GeneInfo
          gene={gene}
        />
      </div>
      <RegionViewer />
      <Table />
      <GeneSettings />
    </div>
  )
}

AppGenePage.propTypes = {
  gene: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
}

export default GenePageHOC(AppGenePage, fetchSchzGenePage)
