# Create a private network using the IBFT 2.0 (Proof of Authority) consensus protocol

A private network provides a configurable network for testing. This private network uses the IBFT 2.0 (Proof of Authority) consensus protocol.

## Prerequisites
Hyperledger Besu
Curl (or similar webservice client).

## Steps

### 1. Create directories
Each node requires a data directory for the blockchain data.

Create directories for your private network, each of the four nodes, and a data directory for each node:
```
IBFT-Network/
├── Node-1
│   ├── data
├── Node-2
│   ├── data
├── Node-3
│   ├── data
└── Node-4
    ├── data
```
### 2. Create a configuration file
The configuration file defines the IBFT 2.0 genesis file and the number of node key pairs to generate.

The configuration file has two nested JSON nodes. The first is the genesis property defining the IBFT 2.0 genesis file, except for the extraData string, which Besu generates automatically in the resulting genesis file. The second is the blockchain property defining the number of key pairs to generate.

Copy the following configuration file definition to a file called ibftConfigFile.json and save it in the IBFT-Network directory:
```
{
 "genesis": {
   "config": {
      "chainId": 2018,
      "muirglacierblock": 0,
      "ibft2": {
        "blockperiodseconds": 2,
        "epochlength": 30000,
        "requesttimeoutseconds": 4
      }
    },
    "nonce": "0x0",
    "timestamp": "0x58ee40ba",
    "gasLimit": "0x47b760",
    "difficulty": "0x1",
    "mixHash": "0x63746963616c2062797a616e74696e65206661756c7420746f6c6572616e6365",
    "coinbase": "0x0000000000000000000000000000000000000000",
    "alloc": {
       "fe3b557e8fb62b89f4916b721be55ceb828dbd73": {
          "privateKey": "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63",
          "comment": "private key and this comment are ignored.  In a real chain, the private key should NOT be stored",
          "balance": "0xad78ebc5ac6200000"
       },
       "627306090abaB3A6e1400e9345bC60c78a8BEf57": {
         "privateKey": "c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
         "comment": "private key and this comment are ignored.  In a real chain, the private key should NOT be stored",
         "balance": "90000000000000000000000"
       },
       "f17f52151EbEF6C7334FAD080c5704D77216b732": {
         "privateKey": "ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f",
         "comment": "private key and this comment are ignored.  In a real chain, the private key should NOT be stored",
         "balance": "90000000000000000000000"
       }
      }
 },
 "blockchain": {
   "nodes": {
     "generate": true,
       "count": 4
   }
 }
}
```
### 3. Generate node keys and a genesis file
In the IBFT-Network directory, generate the node key and genesis file:
```
besu operator generate-blockchain-config --config-file=ibftConfigFile.json --to=networkFiles --private-key-file-name=key
```
Besu creates the following in the networkFiles directory:

- genesis.json: The genesis file including the extraData property specifying the four nodes are validators.
- A directory for each node named using the node address and containing the public and private key for each node.
```
networkFiles/
├── genesis.json
└── keys
    ├── 0x438821c42b812fecdcea7fe8235806a412712fc0
    │   ├── key
    │   └── key.pub
    ├── 0xca9c2dfa62f4589827c0dd7dcf48259aa29f22f5
    │   ├── key
    │   └── key.pub
    ├── 0xcd5629bd37155608a0c9b28c4fd19310d53b3184
    │   ├── key
    │   └── key.pub
    └── 0xe96825c5ab8d145b9eeca1aba7ea3695e034911a
        ├── key
        └── key.pub
```
### 4. Copy the genesis file to the IBFT-Network directory
  
Copy the genesis.json file to the IBFT-Network directory.

```
IBFT-Network/
├── genesis.json
├── Node-1
│   ├── data
│   │    ├── key
│   │    ├── key.pub
├── Node-2
│   ├── data
│   │    ├── key
│   │    ├── key.pub
├── Node-3
│   ├── data
│   │    ├── key
│   │    ├── key.pub
├── Node-4
│   ├── data
│   │    ├── key
│   │    ├── key.pub
```
### 5. Modify Genesis extradata
* Create file toEncode.json:
Extract nodeAddress from all 4 nodes. NodeAddress can be obtained from the keys directory. Important: Do not include "0x".

```json
[
  "20c5b6250f99e3c41d8ae1593eef0520e4e3fcc1",
  "8c0b92801cc7fdc62f74b7c0c248053fe92f9959",
  "0xab601b7d7382e24eecb369e508c2de2e710d88d6",
  "6f81cf8b4e36b4ae99567d2c96b8a4ca40585e92"
]
```

In this step, we create our genesis.json. For this, we first need the `Node Public Key` we generated in the previous step of the nodes we want as validators. We will then create a json file with an array of said public keys, and encode it to RLP format. We then have to put the result in `extradata` of our genesis.json.

```sh
cd /data/alastria-node-besu/validator
$ bin/besu rlp encode --from=toEncode.json
# result:
#0xf87ea00000000000000000000000000000000000000000000000000000000000000000f854948c0b92801cc7fdc62f74b7c0c248053fe92f99599420c5b6250f99e3c41d8ae1593eef0520e4e3fcc194ab601b7d7382e24eecb369e508c2de2e710d88d6946f81cf8b4e36b4ae99567d2c96b8a4ca40585e92808400000000c0
$ vi genesis.json
```

* Fill [genesis.json](../configs/genesis.json) with this extradata


### 6. Start the first node as the bootnode
In the Node-1 directory, start Node-1:
```
 ~/besu/build/distributions/besu-21.2.0-SNAPSHOT/bin/besu --data-path=data --genesis-file=../genesis.json --rpc-http-enabled --rpc-http-api=ETH,NET,IBFT --host-allowlist="*" --rpc-http-cors-origins="all"
```
When the node starts, the enode URL displays. Copy the enode URL to specify Node-1 as the bootnode in the following steps. IMPORTANT: enode can be obtained from key.pub, adding @IP:30303, so steps 6, 7 ad 8 may be skipped if you want to get the enode. Notice theses steps are also neccesary for starting Besu network.
 
### 7. Start Node-2
Start another terminal, change to the Node-2 directory and start Node-2 specifying the Node-1 enode URL copied when starting Node-1 as the bootnode:
```
~/besu/build/distributions/besu-21.2.0-SNAPSHOT/bin/besu --data-path=data --genesis-file=../genesis.json --bootnodes=enode://e02ab849aec20314d84f12ddd09bf8be3d9022c501c6cad52449802eb29d2bd7e20d9bece843e904cc4d1f2259e44c4d505a3cbae51e3d1e1d149bcc3d6e24ae@159.8.212.39:30303, enode://dc2f7131f7592de8175c1e2d45039731083371aed80edf093dad17048a1e02e6fc4fb6bbe3941d34d962ed6dea0deae8079430dc0186cb12d837371707483f57@159.8.212.35:30303, enode://e11288c9bb4b84a89cd7d4fd915bcc052f0d210b6bc8e000c24f3fe077a915a44dc8adf75a310812a6828d1368bd13303444564ccf928e31d13bcabef004cae9@159.8.212.41:30303, enode://a174aa1f59c55ebfa63c97ca1694d66453d9c09b09d6509986b657c02a730f323c0f441ec49a67f8d945e95daca25fb64b9c51dc892e8b1daa85edefb1f784dc@159.8.212.44:30303 --rpc-http-enabled --rpc-http-api=ETH,NET,IBFT --host-allowlist="*" --rpc-http-cors-origins="all"
```
### 8. Start Node-3 and Node-4
Replicate step 7 in Node-3 and Node-4 directory.
