import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

const DEVNET_URL = clusterApiUrl("devnet");
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");


async function fetchWalletInfo(walletAddress: string): Promise<void> {

    const connection = new Connection(DEVNET_URL, "confirmed");

    const pubkey = new PublicKey(walletAddress);
    if (!pubkey) {
        console.error(`Invalid public key: "${walletAddress}"`);
        process.exit(1);
    }

    console.log(`Wallet  : ${pubkey.toBase58()}\n`);

    let solBalance = 0;
    try {
        const lamports = await connection.getBalance(pubkey);
        solBalance = (lamports / LAMPORTS_PER_SOL);
    } catch (err) {
        console.warn("Could not fetch SOL balance:", (err as Error).message);
    }

    let tokenAccountCount = 0;
    try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            pubkey,
            { programId: TOKEN_PROGRAM_ID }
        );
        tokenAccountCount = tokenAccounts.value.length;
    } catch (err) {
        console.warn("Could not fetch token accounts:",(err as Error).message);
    }

    let recentTx = "No transactions found";
    try {
        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 1 });
        if (signatures.length > 0) {
            recentTx = signatures[0]?.signature ?? "";
        }
    } catch (err) {
        console.warn("Could not fetch transactions:", (err as Error).message);
    }

    console.log(`SOL Balance        : ${solBalance}`);
    console.log(`Token Accounts     : ${tokenAccountCount}`);
    console.log(`Latest Transaction : ${recentTx}\n`);

}

// Entry Point 
const walletAddress = process.argv[2];

if (!walletAddress) {
    console.error(
        "Usage: npm start <WALLET_PUBLIC_KEY>\n" +
        "Example: npm start 83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"
    );
    process.exit(1);
}

try {
    await fetchWalletInfo(walletAddress);
} catch (error) {
    console.error("Unexpected error:", (error as Error).message);
    process.exit(1);
}