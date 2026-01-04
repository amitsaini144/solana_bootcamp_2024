import { VotingsdappAccount } from '@project/anchor'
import { ellipsify, UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { VotingsdappUiButtonClose } from './votingsdapp-ui-button-close'
import { VotingsdappUiButtonDecrement } from './votingsdapp-ui-button-decrement'
import { VotingsdappUiButtonIncrement } from './votingsdapp-ui-button-increment'
import { VotingsdappUiButtonSet } from './votingsdapp-ui-button-set'

export function VotingsdappUiCard({ account, votingsdapp }: { account: UiWalletAccount; votingsdapp: VotingsdappAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Votingsdapp: {votingsdapp.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={votingsdapp.address} label={ellipsify(votingsdapp.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <VotingsdappUiButtonIncrement account={account} votingsdapp={votingsdapp} />
          <VotingsdappUiButtonSet account={account} votingsdapp={votingsdapp} />
          <VotingsdappUiButtonDecrement account={account} votingsdapp={votingsdapp} />
          <VotingsdappUiButtonClose account={account} votingsdapp={votingsdapp} />
        </div>
      </CardContent>
    </Card>
  )
}
