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

## Inside Example

The `cards-gateway-example` directory is divided by five sub directories, each directory has important role:

```bash
├── dappchain
├── transfer-gateway-scripts
├── truffle-dappchain
├── truffle-ethereum
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
    ...
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

