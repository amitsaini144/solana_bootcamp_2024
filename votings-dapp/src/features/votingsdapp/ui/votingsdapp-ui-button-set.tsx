import { VotingsdappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useVotingsdappSetMutation } from '@/features/votingsdapp/data-access/use-votingsdapp-set-mutation'

export function VotingsdappUiButtonSet({ account, votingsdapp }: { account: UiWalletAccount; votingsdapp: VotingsdappAccount }) {
  const setMutation = useVotingsdappSetMutation({ account, votingsdapp })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', votingsdapp.data.count.toString() ?? '0')
        if (!value || parseInt(value) === votingsdapp.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}
