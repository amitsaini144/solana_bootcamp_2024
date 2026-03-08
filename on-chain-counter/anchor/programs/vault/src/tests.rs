#[cfg(test)]
mod tests {
    use crate::ID as PROGRAM_ID;
    use litesvm::LiteSVM;
    use solana_sdk::{
        hash,
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        signature::Keypair,
        signer::Signer,
        system_program,
        transaction::Transaction,
    };

    const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

    /// Anchor instruction discriminator = first 8 bytes of sha256("global:<name>").
    fn anchor_discriminator(name: &str) -> [u8; 8] {
        let preimage = format!("global:{}", name);
        let h = hash::hash(preimage.as_bytes());
        h.to_bytes()[0..8].try_into().unwrap()
    }

    fn get_counter_pda(authority: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"counter", authority.as_ref()], &PROGRAM_ID)
    }

    fn create_initialize_ix(authority: &Pubkey, counter_pda: &Pubkey) -> Instruction {
        let data = anchor_discriminator("initialize").to_vec();

        Instruction {
            program_id: PROGRAM_ID,
            accounts: vec![
                AccountMeta::new(*authority, true),
                AccountMeta::new(*counter_pda, false),
                AccountMeta::new_readonly(system_program::ID, false),
            ],
            data,
        }
    }

    fn create_increment_ix(authority: &Pubkey, counter_pda: &Pubkey, amount: u64) -> Instruction {
        let mut data = anchor_discriminator("increment").to_vec();
        data.extend_from_slice(&amount.to_le_bytes());

        Instruction {
            program_id: PROGRAM_ID,
            accounts: vec![
                AccountMeta::new_readonly(*authority, true),
                AccountMeta::new(*counter_pda, false),
            ],
            data,
        }
    }

    fn create_reset_ix(authority: &Pubkey, counter_pda: &Pubkey) -> Instruction {
        let data = anchor_discriminator("reset").to_vec();

        Instruction {
            program_id: PROGRAM_ID,
            accounts: vec![
                AccountMeta::new_readonly(*authority, true),
                AccountMeta::new(*counter_pda, false),
            ],
            data,
        }
    }

    /// CounterAccount layout: 8 (discriminator) + 32 (authority) + 8 (count) + 1 (bump).
    fn read_count_from_account_data(data: &[u8]) -> u64 {
        assert!(data.len() >= 8 + 32 + 8, "counter account too small");
        let count_start = 8 + 32;
        u64::from_le_bytes(data[count_start..count_start + 8].try_into().unwrap())
    }

    #[test]
    fn test_initialize_counter() {
        let mut svm = LiteSVM::new();

        let program_bytes = include_bytes!("../../../target/deploy/vault.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();

        let (counter_pda, _bump) = get_counter_pda(&authority.pubkey());

        let ix = create_initialize_ix(&authority.pubkey(), &counter_pda);
        let blockhash = svm.latest_blockhash();
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        );

        let result = svm.send_transaction(tx);
        assert!(result.is_ok(), "Initialize should succeed");

        let counter_account = svm.get_account(&counter_pda).unwrap();
        let count = read_count_from_account_data(&counter_account.data);
        assert_eq!(count, 0, "Initial count should be 0");
    }

    #[test]
    fn test_increment_counter() {
        let mut svm = LiteSVM::new();

        let program_bytes = include_bytes!("../../../target/deploy/vault.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();

        let (counter_pda, _bump) = get_counter_pda(&authority.pubkey());

        // Initialize
        let init_ix = create_initialize_ix(&authority.pubkey(), &counter_pda);
        let blockhash = svm.latest_blockhash();
        svm.send_transaction(Transaction::new_signed_with_payer(
            &[init_ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ))
        .unwrap();

        // Increment by 1
        let inc_ix = create_increment_ix(&authority.pubkey(), &counter_pda, 1);
        let blockhash = svm.latest_blockhash();
        let result = svm.send_transaction(Transaction::new_signed_with_payer(
            &[inc_ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ));
        assert!(result.is_ok(), "Increment should succeed");

        let counter_account = svm.get_account(&counter_pda).unwrap();
        assert_eq!(read_count_from_account_data(&counter_account.data), 1);

        // Increment by 10
        let inc_ix2 = create_increment_ix(&authority.pubkey(), &counter_pda, 10);
        let blockhash = svm.latest_blockhash();
        svm.send_transaction(Transaction::new_signed_with_payer(
            &[inc_ix2],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ))
        .unwrap();

        let counter_account = svm.get_account(&counter_pda).unwrap();
        assert_eq!(read_count_from_account_data(&counter_account.data), 11);
    }

    #[test]
    fn test_reset_counter() {
        let mut svm = LiteSVM::new();

        let program_bytes = include_bytes!("../../../target/deploy/vault.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();

        let (counter_pda, _bump) = get_counter_pda(&authority.pubkey());

        // Initialize and increment
        let init_ix = create_initialize_ix(&authority.pubkey(), &counter_pda);
        let inc_ix = create_increment_ix(&authority.pubkey(), &counter_pda, 42);
        let blockhash = svm.latest_blockhash();
        svm.send_transaction(Transaction::new_signed_with_payer(
            &[init_ix, inc_ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ))
        .unwrap();

        let counter_account = svm.get_account(&counter_pda).unwrap();
        assert_eq!(read_count_from_account_data(&counter_account.data), 42);

        // Reset
        let reset_ix = create_reset_ix(&authority.pubkey(), &counter_pda);
        let blockhash = svm.latest_blockhash();
        let result = svm.send_transaction(Transaction::new_signed_with_payer(
            &[reset_ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ));
        assert!(result.is_ok(), "Reset should succeed");

        let counter_account = svm.get_account(&counter_pda).unwrap();
        assert_eq!(read_count_from_account_data(&counter_account.data), 0);
    }

    #[test]
    fn test_increment_zero_fails() {
        let mut svm = LiteSVM::new();

        let program_bytes = include_bytes!("../../../target/deploy/vault.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        let authority = Keypair::new();
        svm.airdrop(&authority.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();

        let (counter_pda, _bump) = get_counter_pda(&authority.pubkey());

        let init_ix = create_initialize_ix(&authority.pubkey(), &counter_pda);
        let blockhash = svm.latest_blockhash();
        svm.send_transaction(Transaction::new_signed_with_payer(
            &[init_ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ))
        .unwrap();

        let inc_ix = create_increment_ix(&authority.pubkey(), &counter_pda, 0);
        let blockhash = svm.latest_blockhash();
        let result = svm.send_transaction(Transaction::new_signed_with_payer(
            &[inc_ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ));

        assert!(result.is_err(), "Increment by 0 should fail with ZeroAmount");
    }

    #[test]
    fn test_reset_unauthorized_fails() {
        let mut svm = LiteSVM::new();

        let program_bytes = include_bytes!("../../../target/deploy/vault.so");
        svm.add_program(PROGRAM_ID, program_bytes);

        let authority = Keypair::new();
        let other = Keypair::new();
        svm.airdrop(&authority.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();
        svm.airdrop(&other.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();

        let (counter_pda, _bump) = get_counter_pda(&authority.pubkey());

        let init_ix = create_initialize_ix(&authority.pubkey(), &counter_pda);
        let blockhash = svm.latest_blockhash();
        svm.send_transaction(Transaction::new_signed_with_payer(
            &[init_ix],
            Some(&authority.pubkey()),
            &[&authority],
            blockhash,
        ))
        .unwrap();

        // Other user tries to reset
        let reset_ix = create_reset_ix(&other.pubkey(), &counter_pda);
        let blockhash = svm.latest_blockhash();
        let result = svm.send_transaction(Transaction::new_signed_with_payer(
            &[reset_ix],
            Some(&other.pubkey()),
            &[&other],
            blockhash,
        ));

        assert!(result.is_err(), "Reset by non-authority should fail with Unauthorized");
    }
}
