import { useSolana } from '@/components/solana/use-solana'

export function useVotingsdappAccountsQueryKey() {
  const { cluster } = useSolana()

  return ['votingsdapp', 'accounts', { cluster }]
}
