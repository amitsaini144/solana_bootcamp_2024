use anchor_lang::prelude::*;

#[error_code]
pub enum FavouritesError {
    #[msg("Movie title is too long. Maximum 30 characters allowed.")]
    MovieTooLong,
    
    #[msg("Too many games. Maximum 4 games allowed.")]
    TooManyGames,
    
    #[msg("Game name is too long. Maximum 30 characters per game.")]
    GameNameTooLong,
    
    #[msg("Movie title cannot be empty.")]
    EmptyMovie,
}