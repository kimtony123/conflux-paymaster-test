import { ConfluxPaymaster } from "@conflux-paymaster/conflux-paymaster-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_KEY;
const USER_PRIVATE_KEY = process.env.USER_PRIVATE_KEY;
const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS || "0xa7AE94401819F83DD7C3D9AA012e6dAb2c2e2D77";

if (!API_KEY || !USER_PRIVATE_KEY) {
  console.error("❌ Please set API_KEY and USER_PRIVATE_KEY in .env");
  process.exit(1);
}

async function main() {
  console.log("🚀 Conflux Paymaster - Sponsor User Transaction\n");

  const paymaster = new ConfluxPaymaster({
    rpcUrl: process.env.RPC_URL || "https://evmtestnet.confluxrpc.com",
    paymasterAddress: process.env.PAYMASTER_ADDRESS || "0x0cDE16Cf1fD5Bf2536069Aec8a2eF0832A27577B",
    signingServiceUrl: process.env.BACKEND_URL || "http://localhost:3001",
    chainId: parseInt(process.env.CHAIN_ID || "71"),
    apiKey: API_KEY,
  });

  console.log("[1] Connecting user wallet...");
  await paymaster.connect(USER_PRIVATE_KEY);
  console.log("    ✅ Connected:", paymaster.getAddress());

  console.log("[2] Setting factory...");
  await paymaster.setFactory(process.env.FACTORY_ADDRESS || "0x3d536eA50c323fFA2bc6b7DF0c1AE253f6144eAE");
  console.log("    ✅ Factory set");

  console.log("[3] Sending 1 CFX (gasless)...");
  const result = await paymaster.sendTransaction({
    to: RECIPIENT_ADDRESS,
    data: "0x",
    value: BigInt(1e18),
  });

  console.log("\n✅ Transaction submitted!");
  console.log("📝 UserOp Hash:", result.userOpHash);

  if (result.transactionHash) {
    console.log("📋 TX Hash:", result.transactionHash);
  }

  console.log("\n💰 User transferred 1 CFX - paid 0 CFX!");
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});