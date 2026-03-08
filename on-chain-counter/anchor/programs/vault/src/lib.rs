use anchor_lang::prelude::*;

declare_id!("4NCMYzrQR9dg3WrceDPcBgPdRVou9uBDEDiQHmau7kx7");

#[program]
pub mod on_chain_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.authority = ctx.accounts.authority.key();
        counter.count = 0;
        counter.bump = ctx.bumps.counter;

        msg!("Counter initialized. Authority: {}", counter.authority);
        Ok(())
    }

    pub fn increment(ctx: Context<UpdateCounter>, amount: u64) -> Result<()> {
        require!(amount > 0, CounterError::ZeroAmount);

        let counter = &mut ctx.accounts.counter;
        counter.count = counter
            .count
            .checked_add(amount)
            .ok_or(CounterError::Overflow)?;

        msg!(
            "Counter incremented by {}. New count: {}",
            amount,
            counter.count
        );
        Ok(())
    }

    pub fn reset(ctx: Context<UpdateCounter>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;

        msg!("Counter reset to 0 by authority: {}", counter.authority);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer  = authority,
        space  = CounterAccount::LEN,
        seeds  = [b"counter", authority.key().as_ref()],
        bump
    )]
    pub counter: Account<'info, CounterAccount>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct UpdateCounter<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds  = [b"counter", authority.key().as_ref()],
        bump   = counter.bump,
        constraint = counter.authority == authority.key() @ CounterError::Unauthorized,
    )]
    pub counter: Account<'info, CounterAccount>,
}

#[account]
pub struct CounterAccount {
    pub authority: Pubkey,
    pub count: u64,
    pub bump: u8,
}

impl CounterAccount {
    pub const LEN: usize = 8 + 32 + 8 + 1;
}

#[cfg(test)]
mod tests;

#[error_code]
pub enum CounterError {
    #[msg("You are not the authority of this counter.")]
    Unauthorized,

    #[msg("Increment amount must be greater than zero.")]
    ZeroAmount,

    #[msg("Counter overflow: value would exceed u64::MAX.")]
    Overflow,
}
