
const HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = "secret disagree rubber until stairs industry short black over treat swing ready";

const privateKeys = [
    "401D12BFCEA7B6B694FDA3FF66B0446C646DD98F56798AC6D2D3D7F6C885D162",
    "8A6EDB33248DCB706AE9BFD8960525E3EBE55FCEA7422AD3F31348B032073E96",
    "25D73B122A31043BA30791725302E28C5D43F196E40D4CAD4EE33503211B0838",
    "F6060A28ECFBD3DCE97D4CC1863E4E75CE6834E641CA3E67C0634DCD369202E7",
    "A7B44F290605B79B9CF6E1A18283EE588E6A5785471B6FAA23E7DAC250DC8284",
    "7B34F4B13F03CB1BF50F52068AAFB631F7677068BD7CEF35F80ACFCBCB9C3442",
    "E838AA2F5DA7EAF91F0CDE8599F6477BB4C7CF94F4D2A94B0EE4CFC4329515F4",
    "CE0589C5F57CF95B7CB6413825F490ED034731EBFC4B779C3B999754A3A82E21",
];

const publickKeys = [
  "0x54B191C381060a6b26D9540D7EB389d2F30476bD" , "Lomé",
  "0xAd2bAC8895B4EaFcc97B72387C586f601D53B240" , "Bamako",
  "0x2389D6EedCc212D9B4bf82c62c36031ea904F265" , "Tunis",
  "0x6231B14506B07dd238ae321b2e5e8356c5F516BE" , "Sakara",
  "0xF4Cb98E14C264d1E9E3E8E9F9eD531d238814d68" , "Tombouctou",
  "0x46a24abAf8EC93eFE6ae1805986cFD2d0b331d46" , "Destination",
  "0x8C1f6CaeFd6Aaa284C8AEB50F037Ee825C327AD2" , "Rio",
  "0x31f0a8a6cCf12EeC81a088Af9EF38E6092F79Fe7" , "Paris",
];

module.exports = {
    infuraLink: "https://rinkeby.infura.io/v3/1ea2d585906a47dcbbfadfccf0daf659",
    adminDeployer : "0x54B191C381060a6b26D9540D7EB389d2F30476bD",
    networks: {
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(privateKeys, module.exports.infuraLink, 0, 1);
            },
            network_id: "4",
            from: module.exports.adminDeployer,
            gas: 4500000,
            gasPrice: 10000000000,
        },
    },
    compilers: {
        solc: {
            version: '^0.5.12',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
};
