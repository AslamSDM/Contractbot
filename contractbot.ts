// import {TelegramBot} from "node-telegram-bot-api";
import TelegramBot from "node-telegram-bot-api";
import { ethers, Wallet, HDNodeWallet, Contract, parseEther ,formatEther} from "ethers";
// import axios from "axios";
import "dotenv/config";
import db from "./dbconnect";
import Users from "./userschema";
import { chunkArray, formatDate, padString } from "./utils";

const polygon = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.APIKEY}`
const provider = new ethers.JsonRpcProvider(polygon)
const token: any = process.env.KEY;
console.log(token)
const bot = new TelegramBot(token, { polling: true });
let message:string
let wallet:HDNodeWallet|Wallet
let chatId:any
let ethbalance:any

bot.onText(/\/start/,async(msg:any)=>{
    await db()
    chatId = msg.chat.id;
    const userexist: any = await (Users.find({ userid: msg.from?.username }));
    message += "Welcome to Contract bot \n"
    message += "From Abstra \n"
    message += "\n"

    if (userexist.length > 0) {
        wallet = new ethers.Wallet((userexist[0].PrivateKey), provider)
    } else {
        wallet = ethers.Wallet.createRandom()
        const user = new Users({
            userid: msg.from?.username,
            chatID: msg.chat.id,
            address: (wallet.address),
            PrivateKey: (wallet.privateKey)
        })
        await user.save()
    }
    const waladr = await wallet.address
    ethbalance = formatEther(String(await provider.getBalance(waladr)))
    message += `Your wallet: ${waladr}\n`
    message += `Your ETH Balance: ${ethbalance}\n`
    bot.sendMessage(chatId,message,{reply_markup:{
        inline_keyboard:[
            [{text:"Deploy Contract" , callback_data:"deploy"}],
            [{text:"Change Liquidity" , callback_data:"liquidity"}],
            [{text:"Verify Contract" , callback_data:"verify"}],
            [{text:"Download Contract Code" , callback_data:"download"}],
            [{text:"Get ABI" , callback_data:"get_abi"}],
            [{text:"Decompile" , callback_data:"decompile"}],
            [{text:"Explain Contract (AI🔮)" , callback_data:"explain"}],
        ]
    }})

})