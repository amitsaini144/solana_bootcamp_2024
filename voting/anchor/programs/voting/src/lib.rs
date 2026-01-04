#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("GZPfjpepjfSQ22p6Lk8RyS1pEHJ8icfv6rfr5VpNgpQU");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_poll(
        ctx: Context<InitializePoll>,
        poll_id: u64,
        description: String,
        poll_start: u64,
        poll_end: u64,
    ) -> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.description = description;
        poll.poll_start = poll_start;
        poll.poll_end = poll_end;
        poll.candidate_count = 0;
        Ok(())
    }


    pub fn initialize_candidate(
        ctx: Context<InitializeCandidate>,
        _poll_id: u64,
        candidate_name: String,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        let poll = &mut ctx.accounts.poll;

        poll.candidate_count += 1;
        candidate.candiate_name = candidate_name;
        candidate.candidate_votes = 0;

        Ok(())
    }


    pub fn vote(
        ctx: Context<Vote>,
        _poll_id: u64,
        candidate_name: String,
    ) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;

        candidate.candidate_votes = candidate.candidate_votes + 1;
        Ok(())
    }
}


#[derive(Accounts)]
#[instruction(poll_id: u64, candiate_name: String)]
pub struct Vote<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candiate_name.as_bytes()],
        bump,
    )]
    pub candidate: Account<'info, Candidate>
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(poll_id: u64, candiate_name: String)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"poll".as_ref(), poll_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = payer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candiate_name.as_bytes()],
        bump,
    )]
    pub candidate: Account<'info, Candidate>,
    pub system_program: Program<'info, System>,
}


#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(260)]
    pub description: String,
    pub poll_start: u64,
    pub poll_end: u64,
    pub candidate_count: u64,
}


#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(30)]
    pub candiate_name: String,
    pub candidate_votes: u64
}