import { VotingsdappAccount, getDecrementInstruction } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { toastTx } from '@/components/toast-tx'
import { useVotingsdappAccountsInvalidate } from './use-votingsdapp-accounts-invalidate'

export function useVotingsdappDecrementMutation({
  account,
  votingsdapp,
}: {
  account: UiWalletAccount
  votingsdapp: VotingsdappAccount
}) {
  const invalidateAccounts = useVotingsdappAccountsInvalidate()
  const signer = useWalletUiSigner({ account })
  const signAndSend = useWalletUiSignAndSend()

  return useMutation({
    mutationFn: async () => await signAndSend(getDecrementInstruction({ votingsdapp: votingsdapp.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
