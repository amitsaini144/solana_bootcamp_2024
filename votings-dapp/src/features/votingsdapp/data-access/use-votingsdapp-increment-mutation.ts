import { VotingsdappAccount, getIncrementInstruction } from '@project/anchor'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { useMutation } from '@tanstack/react-query'
import { toastTx } from '@/components/toast-tx'
import { useVotingsdappAccountsInvalidate } from './use-votingsdapp-accounts-invalidate'

export function useVotingsdappIncrementMutation({
  account,
  votingsdapp,
}: {
  account: UiWalletAccount
  votingsdapp: VotingsdappAccount
}) {
  const invalidateAccounts = useVotingsdappAccountsInvalidate()
  const signAndSend = useWalletUiSignAndSend()
  const signer = useWalletUiSigner({ account })

  return useMutation({
    mutationFn: async () => await signAndSend(getIncrementInstruction({ votingsdapp: votingsdapp.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
