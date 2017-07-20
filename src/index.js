// @flow
import prismic from 'prismic-javascript'
import { keys } from 'lodash'
import table from 'easy-table'

type PrismicQueryResponse = {
  total_results_size: number
}

type DocumentCount = {
  count: number,
  type: string,
  description: string,
}

const documentTypes: Array<{type: string, description: string}> = [{
  type: 'days-since-activated',
  description: 'Phase 2 (Days since page activated)'
}, {
  type: 'dollar-milestone',
  description: 'Phase 6 (Donation value milestone)'
}, {
  type: 'donation-received',
  description: 'Transactional (Donation received)'
}, {
  type: 'fitness-distance-milestone',
  description: 'Phase 6 (Fitness distance milestone)'
}, {
  type: 'inactive-page',
  description: 'BAT (Inactive page)'
}, {
  type: 'milestone-percentage',
  description: 'Phase 6 (Donation percentage milestone)'
}, {
  type: 'page-activation',
  description: 'Phase 1 (Days since page activated)'
}]

const fetchDocumentCount = ({ type, description }) => (
  prismic
  .getApi(process.env.PRISMIC_API_URL, {accessToken: process.env.PRISMIC_API_KEY})
  .then((api) => {
    return api.query(
      prismic.Predicates.at('document.type', type),
      { pageSize: 1 }
    )
  }).then(({ total_results_size: count }: PrismicQueryResponse) => ({
    count,
    type,
    description
  })).catch(console.log || process.exit(1))
)

Promise.all(
  documentTypes.map(fetchDocumentCount)
).then((res: Array<DocumentCount>) => {
  const total = res.reduce((acc: number, { count }) => (
    acc + count
  ), 0)

  console.log(table.print(
    res
    .sort((a, b) => (b.count - a.count))
    .map(({ count, type, description }) => ({
      count,
      percentage: Math.round(count / total * 100),
      description: description
    }))
  ))

  console.log(`${total} active documents total`)
})
