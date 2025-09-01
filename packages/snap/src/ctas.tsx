import { Box, Text, Link } from "@metamask/snaps-sdk/jsx"
import { VENDORS } from "./vendors"

export const accountAtomNoTrustData = (props) => {
  console.log('accountAtomNoTrustData props', JSON.stringify(props, null, 2))
  const { context: { address, chainId, account: { atom_id} } } = props
  const hexChainId = chainId.split(':')[1]
  const links = Object.values(VENDORS).map(vendor => {
    const { getAccountAtomNoTrustData } = vendor
    if (!getAccountAtomNoTrustData) return null
    const { url } = getAccountAtomNoTrustData(atom_id, hexChainId)
    return <Link href={url}>{vendor.name}</Link>
  })
  return (
    <Box>
      <Text>Rate this account on:</Text>
      {links}
    </Box>
  )
}

export const rate = {
  accountAtomNoTrustData
}

export const ctas = {
  rate
}
