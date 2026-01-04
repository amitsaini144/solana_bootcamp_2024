import { Button } from '@/components/ui/button'
import { UiWalletAccount } from '@wallet-ui/react'

import { useVotingsdappInitializeMutation } from '@/features/votingsdapp/data-access/use-votingsdapp-initialize-mutation'

export function VotingsdappUiButtonInitialize({ account }: { account: UiWalletAccount }) {
  const mutationInitialize = useVotingsdappInitializeMutation({ account })

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Votingsdapp {mutationInitialize.isPending && '...'}
    </Button>
  )
}
