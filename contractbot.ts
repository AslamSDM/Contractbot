// import {TelegramBot} from "node-telegram-bot-api";
import TelegramBot from "node-telegram-bot-api";
import { ethers, Wallet, HDNodeWallet, Contract, parseEther ,formatEther, isAddress} from "ethers";
import axios from "axios";
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
    chatId = msg.chat.id;
    // await db()
    // const userexist: any = await (Users.find({ userid: msg.from?.username }));
    // message += "Welcome to Contract bot \n"
    // message += "From Abstra \n"
    // message += "\n"
    
    // if (userexist.length > 0) {
    //     wallet = new ethers.Wallet((userexist[0].PrivateKey), provider)
    // } else {
    //     wallet = ethers.Wallet.createRandom()
    //     const user = new Users({
        //         userid: msg.from?.username,
        //         chatID: msg.chat.id,
        //         address: (wallet.address),
        //         PrivateKey: (wallet.privateKey)
        //     })
        //     await user.save()
        // }
        wallet = ethers.Wallet.createRandom()
        const waladr = await wallet.address
        ethbalance = formatEther(String(await provider.getBalance(waladr)))
        message += `Your wallet: ${waladr}\n`
        message += `Your ETH Balance: ${ethbalance}\n`
        bot.sendMessage(chatId,message,{reply_markup:{
            inline_keyboard:[
                [{text:`Contract : ${contraddr? contraddr : "Enter Address"}` , callback_data:"contract"}],
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
bot.onText(/\/info/,async(msg:any)=>{
    bot.sendMessage(chatId,message,{reply_markup:{
        inline_keyboard:[
            [{text:`Contract : ${contraddr? contraddr : "Enter Address"}` , callback_data:"contract"}],
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


bot.on("callback_query",async(msg:any)=>{
    const data = msg.data;
    if (data=="contract"){
        let mid = 0;
        bot.sendMessage(chatId, "Enter Contract Address\n", {
            reply_markup: {
                force_reply: true
            }
        }).then((msg:any) => {
            mid = msg.message_id
            bot.onReplyToMessage(chatId, mid, (msg) => {
                contraddr = msg.text
                console.log(contraddr)
            })
        });
    }
    else if(isAddress(contraddr)){
        switch(data){
            case "deploy":
                // bot.sendMessage(chatId,"")
                //  source = getInput(chatId,"Send the code of the smart contract")
    
                // //Compilation of smartcontract 
                // const {bytecode,abi} = compileContract(source)
    
                // // Create a factory for your contract
                // let factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
                // // Deploy the contract
                // let contract = await factory.deploy();
    
                break;
            case "verify":
                //  contraddr = getInput(chatId,"Send contract Address")
                //  source = getInput(chatId,"Send source code of the contract ")
                //call the verify endpoint on the etherscan api 
    
                break;
            case "decompile":
                //  contraddr = getInput(chatId,"Send contract Address")
                 //get the contract byte code and check for similar contracts in database 
    
                break;
            case "download":
                // contraddr = await getInput(chatId,"Send contract Address",getCode)
                const code = await getCode()
                break;
            case "get_abi":
                // contraddr = await getInput(chatId,"Send contract Address",getABI)
                
                const abi =await getABI()
                break;
    
            case "explain":
    
                break;
        }
    }else if(!contraddr){
        bot.sendMessage(chatId,"Please add the contract address")
    }
})
async function getABI(){
    const abiurl =`https://api.etherscan.io/api?module=contract&action=getabi&address=${contraddr}&apikey=${process.env.ETHERSCAN_KEY}`
    const getabi = await axios.get(abiurl).then((res:any)=>{

        sendMessage(chatId,`ABI:\n${res.data.result}`)
    })
}
async function getCode() {
    const url =`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contraddr}&apikey=${process.env.ETHERSCAN_KEY}`
    const getcode = await axios.get(url).then((res:any)=>{
        sendMessage(chatId,`title: ${res.data.result[0].ContractName},\n Code: \n ${res.data.result[0].SourceCode}`)
    })
    
}
async function sendMessage(chatId: number | string, message: string, options?: TelegramBot.SendMessageOptions): Promise<void> {
    const MAX_MESSAGE_LENGTH = 4096;
    let messageToSend = message;

    while (messageToSend.length > 0) {
        let messageChunk;

        if (messageToSend.length > MAX_MESSAGE_LENGTH) {
            let lastSpaceIndex = messageToSend.slice(0, MAX_MESSAGE_LENGTH).lastIndexOf(' ');
            lastSpaceIndex = lastSpaceIndex === -1 ? MAX_MESSAGE_LENGTH : lastSpaceIndex;
            messageChunk = messageToSend.slice(0, lastSpaceIndex);
            messageToSend = messageToSend.slice(lastSpaceIndex);
        } else {
            messageChunk = messageToSend;
            messageToSend = '';
        }

        await bot.sendMessage(chatId, messageChunk, options);
    }
}