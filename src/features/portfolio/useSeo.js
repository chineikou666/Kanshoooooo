import { useEffect } from 'react'

const ensureMeta = (selector, createTag) => {
  let node = document.head.querySelector(selector)
  if (!node) {
    node = createTag()
    document.head.appendChild(node)
  }
  return node
}

export function useSeo({ title, description, image }) {
  useEffect(() => {
    document.title = title

    const metaDesc = ensureMeta('meta[name="description"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('name', 'description')
      return node
    })
    metaDesc.setAttribute('content', description)

    const ogTitle = ensureMeta('meta[property="og:title"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('property', 'og:title')
      return node
    })
    ogTitle.setAttribute('content', title)

    const ogDesc = ensureMeta('meta[property="og:description"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('property', 'og:description')
      return node
    })
    ogDesc.setAttribute('content', description)

    const ogImage = ensureMeta('meta[property="og:image"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('property', 'og:image')
      return node
    })
    ogImage.setAttribute('content', image)

    const ogType = ensureMeta('meta[property="og:type"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('property', 'og:type')
      return node
    })
    ogType.setAttribute('content', 'website')

    const twitterCard = ensureMeta('meta[name="twitter:card"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('name', 'twitter:card')
      return node
    })
    twitterCard.setAttribute('content', 'summary_large_image')

    const twitterTitle = ensureMeta('meta[name="twitter:title"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('name', 'twitter:title')
      return node
    })
    twitterTitle.setAttribute('content', title)

    const twitterDesc = ensureMeta('meta[name="twitter:description"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('name', 'twitter:description')
      return node
    })
    twitterDesc.setAttribute('content', description)

    const twitterImage = ensureMeta('meta[name="twitter:image"]', () => {
      const node = document.createElement('meta')
      node.setAttribute('name', 'twitter:image')
      return node
    })
    twitterImage.setAttribute('content', image)
  }, [title, description, image])
}
