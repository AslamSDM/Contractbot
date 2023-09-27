// import {TelegramBot} from "node-telegram-bot-api";
import TelegramBot from "node-telegram-bot-api";
import { ethers, Wallet, HDNodeWallet, Contract, parseEther ,formatEther} from "ethers";
// import axios from "axios";
import "dotenv/config";
import db from "./dbconnect";
import Users from "./userschema";
import { chunkArray, formatDate, padString } from "./utils";
import compileContract from "./compiler";

const polygon = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.APIKEY}`
const provider = new ethers.JsonRpcProvider(polygon)
const token: any = process.env.KEY;
console.log(token)
const bot = new TelegramBot(token, { polling: true });
let message:string
let wallet:HDNodeWallet|Wallet
let chatId:any
let ethbalance:any
let contraddr:any
let source:any

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
function getInput(chatID,text){
    let mid = 0
    let input:any
    bot.sendMessage(chatID,text,{reply_markup:{
        force_reply:true
    }}).then((m:any)=>mid=m.message_id)
    bot.onReplyToMessage(chatID,mid,(m:any)=>{
        input=m.text
    })
    return input
}
bot.on("callback_query",async(msg:any)=>{
    const data = msg.data;
    switch(data){
        case "deploy":
            // bot.sendMessage(chatId,"")
             source = getInput(chatId,"Send the code of the smart contract")

            //Compilation of smartcontract 
            const {bytecode,abi} = compileContract(source)

            // Create a factory for your contract
            let factory = new ethers.ContractFactory(abi, bytecode, wallet);

            // Deploy the contract
            let contract = await factory.deploy();

            break;
        case "verify":
             contraddr = getInput(chatId,"Send contract Address")
             source = getInput(chatId,"Send source code of the contract ")
            //call the verify endpoint on the etherscan api 

            break;
        case "decompile":
             contraddr = getInput(chatId,"Send contract Address")
             //get the contract byte code and check for similar contracts in database 


            break;
        case "download":

            break;
        case "download":
            break;
        case "download":
            break;

    }
})