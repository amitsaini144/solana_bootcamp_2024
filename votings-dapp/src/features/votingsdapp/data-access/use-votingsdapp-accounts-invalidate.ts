import { useQueryClient } from '@tanstack/react-query'
import { useVotingsdappAccountsQueryKey } from './use-votingsdapp-accounts-query-key'

export function useVotingsdappAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useVotingsdappAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}
