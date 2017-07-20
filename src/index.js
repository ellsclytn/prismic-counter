// @flow
import prismic from 'prismic-javascript'
import { keys } from 'lodash'
import table from 'easy-table'

type PrismicQueryResponse = {
  total_results_size: number
}

type DocumentCount = {
  count: number,
  type: string
}

const documentTypes = {
  'days-since-activated': 'Phase 2 (Days since page activated)',
  'dollar-milestone': 'Phase 6 (Donation value milestone)',
  'donation-received': 'Transactional (Donation received)',
  'fitness-distance-milestone': 'Phase 6 (Fitness distance milestone)',
  'inactive-page': 'BAT (Inactive page)',
  'milestone-percentage': 'Phase 6 (Donation percentage milestone)',
  'page-activation': 'Phase 1 (Days since page activated)'
}

const fetchDocumentCount = (documentType) => (
  prismic
  .getApi(process.env.PRISMIC_API_URL, {accessToken: process.env.PRISMIC_API_KEY})
  .then((api) => {
    return api.query(
      prismic.Predicates.at('document.type', documentType),
      { pageSize: 1 }
    )
  }).then(({ total_results_size: count }: PrismicQueryResponse) => ({
    count,
    type: documentType
  }), (err) => (
    Promise.reject(new Error(err))
  ))
)

Promise.all(
  keys(documentTypes)
  .map(fetchDocumentCount)
).then((res: [DocumentCount]) => {
  const total = res.reduce((acc: number, { count }) => (
    acc + count
  ), 0)

  console.log(table.print(
    res.map(({ count, type }) => ({
      count,
      percentage: Math.round(count / total * 100),
      description: documentTypes[type]
    })).sort((a, b) => (b.count - a.count))
  ))

  console.log(`${total} active documents total`)
})
