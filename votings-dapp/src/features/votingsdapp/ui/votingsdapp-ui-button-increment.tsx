import { VotingsdappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { useVotingsdappIncrementMutation } from '../data-access/use-votingsdapp-increment-mutation'

export function VotingsdappUiButtonIncrement({ account, votingsdapp }: { account: UiWalletAccount; votingsdapp: VotingsdappAccount }) {
  const incrementMutation = useVotingsdappIncrementMutation({ account, votingsdapp })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}
