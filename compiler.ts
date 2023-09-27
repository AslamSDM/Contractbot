import solc from 'solc';

async function compileContract(source: string) {
    // Define the input for the compiler
    const input = {
        language: 'Solidity',
        sources: {
            'contract.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Get the contract object
    const contractName = Object.keys(output.contracts['contract.sol'])[0];
    const contract = output.contracts['contract.sol'][contractName];

    // Get the bytecode and ABI
    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;
    console.log(bytecode,abi)
    return { bytecode, abi };
}
// const source =`// contracts/GLDToken.sol
// // SPDX-License-Identifier: MIT
// pragma solidity ^0.6.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// contract GLDToken is ERC20 {
//     constructor(uint256 initialSupply) public ERC20("Gold", "GLD") {
//         _mint(msg.sender, initialSupply);
//     }
// }`
// const { bytecode, abi } = await compileContract(source);
export default compileContract