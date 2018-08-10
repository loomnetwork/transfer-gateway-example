# Cards Gateway Example

Example of how to use Transfer Gateway from Loom DAppChain to transfer assets (ERC721 tokens) to
Ethereum network and to transfer assets (ERC721 tokens) to DAppChain.

## Quick Start

### Requirements

* node >= 8
* wget (used to download Loom DAppChain binary)
* nc (used to check available ports before run loom, ganache or webpack)

> wget and nc can be found on command `transfer_gateway` which is a shell script
> to help put all necessary services together

### Install

Clone this repository

```bash
# Install necessary packages node_packages and loom binary
./transfer_gateway setup
```

### Running

```bash
# Start services ganache, loom and web interface and mapping configuration
./transfer_gateway start
```

### Stop

```bash
# Stop all services (loom, ganache and webserver)
./transfer_gateway stop
```

### Status

```bash
# Check status of services
./transfer_gateway status
```

### Cleanup

```bash
# Remove downloaded packages node_modules and loom binary
./transfer_gateway cleanup
```

After execute `./transfer_gateway start` and starts the necessary services, you can access the web interface on `localhost:8080`

## Example "in a nutshell"

The `cards-gateway-example` directory is divided by five sub directories, each directory has important role:

```bash
├── dappchain
├── truffle-ethereum
├── truffle-dappchain
├── transfer-gateway-scripts
└── webclient
```

### 📁 dappchain

This directory contains the `loom` binary (after setup), also a `genesis.example.json` and some private and public keys.

> Those keys are pre created in order to make the sample easier to start, also they are already used on configurations.

Continuing, let's take a loom o file `loom.yaml`, this file is not new, but it has new parameters, so let's take a look:

#### loom.yaml

```yaml
# This is the new configuration
TransferGateway:
  # Important to keep the indentation

  # Enables the Transfer Gateway Go contract, must be the same on all nodes.
  ContractEnabled: true
  # Enables the in-process Transfer Gateway Oracle.
  OracleEnabled: true

  # Address of the Ethereum node, the node should have the JSON RPC available and running
  EthereumURI: "http://127.0.0.1:8545"

  # Address of the Gateway deploy on address above (EthereumURI)
  MainnetContractHexAddress: "0xf5cad0db6415a71a5bc67403c87b56b629b4ddaa"

  # Private key of the Ethereum validator used to sign the valid transfers between Ethereum and DAppChain
  MainnetPrivateKeyPath: "oracle_eth_priv.key"

  # Private key of the Oracle
  DAppChainPrivateKeyPath: "oracle_priv.key"

  # Address of DAppChain consulted by the Oracle
  DAppChainReadURI: "http://localhost:46658/query"
  DAppChainWriteURI: "http://localhost:46658/rpc"

  # These control how often the Oracle will poll the blockchains for events.
  DAppChainPollInterval: 1 # seconds
  MainnetPollInterval: 1 # seconds

  # Number of seconds to wait before starting the Oracle.
  OracleStartupDelay: 5
  # Number of seconds to wait between reconnection attempts.
  OracleReconnectInterval: 5
```

And finally the `genesis.json`

```json
{
        // The AddressMapper is a new plugin that will be responsible for "map" addresses from Ethereum and DAppChain
        {
            "vm": "plugin",
            "format": "plugin",
            "name": "addressmapper",
            "location": "addressmapper:0.1.0",
            "init": null
        },

        // Gateway is the plugin that manages transfers from between Ethereum and DAppChain, all transfer are secure and signed

        // That plugin also manages the Oracles, which are responsible for pool information from Ethereum network and sign withdraws from DAppChain to Ethereum network
        {
            "vm": "plugin",
            "format": "plugin",
            "name": "gateway",
            "location": "gateway:0.1.0",
            "init": {
                "owner": {
                    "chain_id": "default",
                    "local": "c/IFoEFkm4+D3wdqLmFU9F3t3Sk="
                },
                "oracles": [
                    {
                        "chain_id": "default",
                        "local": "22nuyPPZ53/qAqFnhwD2EpNu9ss="
                    }
                ]
            }
        }
    ]
}
```

### 📁 truffle-ethereum

This directory contains the contracts that will be deployed on the Ethereum network, the `Gateway` and `CryptoCards` the ERC721 token representation on the Ethereum network.

The act of depositing `CryptoCards` on `Gateway` is the one of the main features on this ERC721 token, let's look on the function.

```sol
function depositToGateway(uint tokenId) public {
  safeTransferFrom(msg.sender, gateway, tokenId);
}
```

This function once called along with the `tokenId` will also call the `safeTransferFrom` which will call the function `onERC721Received` on contract `Gateway` which will register the owner of the token.

Another important function is the `withdrawERC721` on `Gateway`, called once the user wants to withdraw the token from `DAppChain` and get back the fully ownership of the token.

> The withdraw process only happen with a secure sign guaranteed by the validators of the network, no one unless the owner of the token can withdraw from DAppChain

### 📁 truffle-dappchain

This directory contains the representation of the `CryptoCards` from `truffle-ethereum` on the `DAppChain`, is a exact "mirroring" of the ERC721 tokens from Ethereum network, but now living inside the `Loom DAppChain`.

When the user deposits his/her tokens `CryptoCards` on the Ethereum network into the contract `Gateway` the `TransferGateway` will pool that information and `mint` a representation (mirror).

On the `CryptoCardsDAppChain` contract there's a `mint` only available for the authorized `TransferGateway`

```sol
function mint(uint256 _uid) public {
  require(msg.sender == gateway);
  _mint(gateway, _uid);
}
```

### 📁 transfer-gateway-scripts

Containing only one script `index.js` which will be responsible for map the `CryptoCards` on Ethereum network and the `CryptoCardsDAppChain` on Loom DAppChain. This is an very important step to make everything work together, without this the `TransferGateway` will not know which ERC721 asset should be mirrored on DAppChain

### 📁 webclient

Finally the web interface, which will require `MetaMask` to be installed on a compatible browser (Chrome / Firefox).

The web interface will be available on `http://localhost:8080`, just open the browser on this address and the interface will be presented. The interface has four areas.

The `Home` page which will require your `MetaMask` signature to map your Ethereum network address with DAppChain address (no one other than you can create that link).

Next areas are `Owned Cards` which are the cards owned by your user (yeah we just gave 5 cards to you 😉), `Cards On DAppChain` cards that are deposited on `Gateway` and properly mirrored on `DAppChain` and the `Cards On Gateway` which are the cards that you and only you owns waiting to be withdrawal to your ownership again.

Loom Network
----
[https://loomx.io](https://loomx.io)


License
----

BSD 3-Clause License
