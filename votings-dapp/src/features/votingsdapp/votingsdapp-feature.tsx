import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { VotingsdappUiButtonInitialize } from './ui/votingsdapp-ui-button-initialize'
import { VotingsdappUiList } from './ui/votingsdapp-ui-list'
import { VotingsdappUiProgramExplorerLink } from './ui/votingsdapp-ui-program-explorer-link'
import { VotingsdappUiProgramGuard } from './ui/votingsdapp-ui-program-guard'

export default function VotingsdappFeature() {
  const { account } = useSolana()

  return (
    <VotingsdappUiProgramGuard>
      <AppHero
        title="Votingsdapp"
        subtitle={
          account
            ? "Initialize a new votingsdapp onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <VotingsdappUiProgramExplorerLink />
        </p>
        {account ? (
          <VotingsdappUiButtonInitialize account={account} />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>
      {account ? <VotingsdappUiList account={account} /> : null}
    </VotingsdappUiProgramGuard>
  )
}
