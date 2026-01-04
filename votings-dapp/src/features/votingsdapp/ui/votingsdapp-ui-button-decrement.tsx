import { VotingsdappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useVotingsdappDecrementMutation } from '../data-access/use-votingsdapp-decrement-mutation'

export function VotingsdappUiButtonDecrement({ account, votingsdapp }: { account: UiWalletAccount; votingsdapp: VotingsdappAccount }) {
  const decrementMutation = useVotingsdappDecrementMutation({ account, votingsdapp })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}
