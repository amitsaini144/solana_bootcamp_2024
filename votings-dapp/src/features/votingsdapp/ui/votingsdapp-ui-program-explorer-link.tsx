import { VOTINGSDAPP_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function VotingsdappUiProgramExplorerLink() {
  return <AppExplorerLink address={VOTINGSDAPP_PROGRAM_ADDRESS} label={ellipsify(VOTINGSDAPP_PROGRAM_ADDRESS)} />
}
