import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { getVotingsdappProgramAccounts } from '@project/anchor'
import { useVotingsdappAccountsQueryKey } from './use-votingsdapp-accounts-query-key'

export function useVotingsdappAccountsQuery() {
  const { client } = useSolana()

  return useQuery({
    queryKey: useVotingsdappAccountsQueryKey(),
    queryFn: async () => await getVotingsdappProgramAccounts(client.rpc),
  })
}
