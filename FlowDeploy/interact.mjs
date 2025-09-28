import { ethers } from 'ethers';
import { marketplace_abi, credit_token_abi, carbon_coin_abi } from './abi.mjs';

const url = 'https://testnet.evm.nodes.onflow.org/';
const provider = new ethers.JsonRpcProvider(url);

async function getLatestBlock() {
  const latestBlock = await provider.getBlockNumber();
  console.log(latestBlock);
}



getLatestBlock();

const privateKey = 'bdc0d1aa1fdf85ed849add1c1776bb8df207bd1f16d2c363357ca9bc90e4f6f8';
const signer = new ethers.Wallet(privateKey, provider);

const carbon_coin = new ethers.Contract(
  '0x9793334052912bF71b3A678CA9b8D41475CB9144', 
  carbon_coin_abi,
  signer);

async function getValue() {
  const value = await carbon_coin.users
    ('0x972C7A0F8BF9D799C009d1024c0db85597F8Aa0b');
  console.log(value);
}

getValue();