import { VotingsdappUiCard } from './votingsdapp-ui-card'
import { useVotingsdappAccountsQuery } from '@/features/votingsdapp/data-access/use-votingsdapp-accounts-query'
import { UiWalletAccount } from '@wallet-ui/react'

export function VotingsdappUiList({ account }: { account: UiWalletAccount }) {
  const votingsdappAccountsQuery = useVotingsdappAccountsQuery()

  if (votingsdappAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!votingsdappAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No accounts</h2>
        No accounts found. Initialize one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {votingsdappAccountsQuery.data?.map((votingsdapp) => (
        <VotingsdappUiCard account={account} key={votingsdapp.address} votingsdapp={votingsdapp} />
      ))}
    </div>
  )
}
