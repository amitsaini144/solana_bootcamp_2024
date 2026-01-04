import { VotingsdappAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useVotingsdappCloseMutation } from '@/features/votingsdapp/data-access/use-votingsdapp-close-mutation'

export function VotingsdappUiButtonClose({ account, votingsdapp }: { account: UiWalletAccount; votingsdapp: VotingsdappAccount }) {
  const closeMutation = useVotingsdappCloseMutation({ account, votingsdapp })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to close this account?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Close
    </Button>
  )
}
