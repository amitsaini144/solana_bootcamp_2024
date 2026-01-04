use anchor_lang::prelude::*;

declare_id!("55zUR3fNw7Xb2vpysKdZx2uQJuDNcJjncKtqoWfp9Ct9");

pub mod error;
use error::FavouritesError;

#[program]
pub mod favourites {
    use super::*;

    pub fn set_favourties(
        ctx: Context<SetFavourites>,
        number: u64,
        movie: String,
        games: Vec<String>,
    ) -> Result<()> {
        require!(!movie.is_empty(), FavouritesError::EmptyMovie);
        require!(movie.len() <= 30, FavouritesError::MovieTooLong);
        require!(games.len() <= 4, FavouritesError::TooManyGames);
        
        for game in &games {
            require!(game.len() <= 30, FavouritesError::GameNameTooLong);
        }

        ctx.accounts.favourties_account.set_inner(Favourites {
            number,
            movie,
            games,
        });
        Ok(())
    }

    pub fn get_favourties(ctx: Context<GetFavourites>) -> Result<Favourites> {
        let favourites = &ctx.accounts.favourties_account;

        Ok(Favourites {
            number: favourites.number,
            movie: favourites.movie.clone(),
            games: favourites.games.clone(),
        })
    }
}

#[account]
#[derive(InitSpace)]
pub struct Favourites {
    pub number: u64,

    #[max_len(30)]
    pub movie: String,

    #[max_len(4, 30)]
    pub games: Vec<String>,
}

#[derive(Accounts)]
pub struct SetFavourites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
    init_if_needed,
    payer = user,
    space = 8 + Favourites::INIT_SPACE,
    seeds = [b"favourites", user.key().as_ref()],
    bump
    )]
    pub favourties_account: Account<'info, Favourites>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetFavourites<'info> {
    pub user: Signer<'info>,

    #[account(
    seeds = [b"favourites", user.key().as_ref()],
    bump
    )]
    pub favourties_account: Account<'info, Favourites>,
}
