/**
 * Search and then scroll to retrieve all pages of search results.
 *
 * @param {elasticsearch.Client} esClient Elasticsearch client
 * @param {Object} searchParams Argument to elasticsearch.Client#search
 * @return {Object[]} Search results
 */
export async function fetchAllSearchResults(esClient, searchParams) {
  let allResults = []
  const responseQueue = []

  const size = searchParams.size || 1000
  const scroll = searchParams.scroll || '30s'

  responseQueue.push(
    await esClient.search({
      ...searchParams,
      scroll,
      size,
    })
  )

  while (responseQueue.length) {
    const response = responseQueue.shift()
    const pageResults = response.hits.hits.map(doc => doc._source)

    allResults = allResults.concat(pageResults)

    if (allResults.length === response.hits.total) {
      // eslint-disable-next-line no-await-in-loop
      await esClient.clearScroll({
        scrollId: response._scroll_id,
      })
      break
    }

    responseQueue.push(
      // eslint-disable-next-line no-await-in-loop
      await esClient.scroll({
        scroll,
        scrollId: response._scroll_id,
      })
    )
  }

  return allResults
}