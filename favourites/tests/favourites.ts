import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Favourites } from "../target/types/favourites";
import { expect } from "chai";

describe("favourites", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Favourites as Program<Favourites>;
  const user = provider.wallet as anchor.Wallet;

  const [favouritesPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("favourites"), user.publicKey.toBuffer()],
    program.programId
  );

  it("Sets favourites successfully", async () => {
    const number = new anchor.BN(42);
    const movie = "The Matrix";
    const games = ["Zelda", "Portal", "Halo"];

    const tx = await program.methods
      .setFavourties(number, movie, games)
      .accounts({
        user: user.publicKey,
        favourtiesAccount: favouritesPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Set favourites transaction signature:", tx);

    const accountData = await program.account.favourites.fetch(favouritesPda);

    expect(accountData.number.toNumber()).to.equal(42);
    expect(accountData.movie).to.equal("The Matrix");
    expect(accountData.games).to.deep.equal(["Zelda", "Portal", "Halo"]);
  });

  it("Gets favourites successfully", async () => {
    const favourites = await program.methods
      .getFavourties()
      .accounts({
        user: user.publicKey,
        favourtiesAccount: favouritesPda,
      })
      .view();

    console.log("Retrieved favourites:", {
      number: favourites.number.toNumber(),
      movie: favourites.movie,
      games: favourites.games
    });

    expect(favourites.number.toNumber()).to.equal(42);
    expect(favourites.movie).to.equal("The Matrix");
    expect(favourites.games).to.have.lengthOf(3);
  });

  it("Updates favourites successfully", async () => {
    const newNumber = new anchor.BN(100);
    const newMovie = "Inception";
    const newGames = ["Minecraft", "Fortnite"];

    await program.methods
      .setFavourties(newNumber, newMovie, newGames)
      .accounts({
        user: user.publicKey,
        favourtiesAccount: favouritesPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const accountData = await program.account.favourites.fetch(favouritesPda);

    expect(accountData.number.toNumber()).to.equal(100);
    expect(accountData.movie).to.equal("Inception");
    expect(accountData.games).to.deep.equal(["Minecraft", "Fortnite"]);
  });

  it("Handles empty games array", async () => {
    const number = new anchor.BN(7);
    const movie = "Interstellar";
    const games = [];

    await program.methods
      .setFavourties(number, movie, games)
      .accounts({
        user: user.publicKey,
        favourtiesAccount: favouritesPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const accountData = await program.account.favourites.fetch(favouritesPda);

    expect(accountData.games).to.be.empty;
  });

  it("Handles maximum games array length", async () => {
    const number = new anchor.BN(99);
    const movie = "The Godfather";
    const games = ["Game1", "Game2", "Game3", "Game4"];

    await program.methods
      .setFavourties(number, movie, games)
      .accounts({
        user: user.publicKey,
        favourtiesAccount: favouritesPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const accountData = await program.account.favourites.fetch(favouritesPda);

    expect(accountData.games).to.have.lengthOf(4);
  });

  it("Fails with movie too long", async () => {
    const number = new anchor.BN(42);
    const movie = "A".repeat(31);
    const games = ["Zelda"];

    try {
      await program.methods
        .setFavourties(number, movie, games)
        .accounts({
          user: user.publicKey,
          favourtiesAccount: favouritesPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.message).to.include("Movie title is too long");
    }
});

it("Fails with too many games", async () => {
    const number = new anchor.BN(42);
    const movie = "Matrix";
    const games = ["Game1", "Game2", "Game3", "Game4", "Game5"];

    try {
      await program.methods
        .setFavourties(number, movie, games)
        .accounts({
          user: user.publicKey,
          favourtiesAccount: favouritesPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error.message).to.include("Too many games");
    }
});
});