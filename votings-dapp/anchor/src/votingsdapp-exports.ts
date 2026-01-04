// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { Votingsdapp, VOTINGSDAPP_DISCRIMINATOR, VOTINGSDAPP_PROGRAM_ADDRESS, getVotingsdappDecoder } from './client/js'
import VotingsdappIDL from '../target/idl/votingsdapp.json'

export type VotingsdappAccount = Account<Votingsdapp, string>

// Re-export the generated IDL and type
export { VotingsdappIDL }

export * from './client/js'

export function getVotingsdappProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getVotingsdappDecoder(),
    filter: getBase58Decoder().decode(VOTINGSDAPP_DISCRIMINATOR),
    programAddress: VOTINGSDAPP_PROGRAM_ADDRESS,
  })
}
