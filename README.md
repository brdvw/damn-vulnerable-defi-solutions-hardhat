# Solution to part of the challenges in Damn-Vulnerable-Defi(V3, hardhat)

**Damn-Vulnerable-Defi: A set of challenges to learn offensive security of smart contracts in Ethereum.**




## Origin

The challenges comes from the [damnvulnerabledefi-v3](https://github.com/theredguild/damn-vulnerable-defi) (branch: v3-dev)

or visit [damnvulnerabledefi.xyz](https://damnvulnerabledefi.xyz) to view more details.

## Disclaimer

This repo only includes solutions to challenges: abi-smuggling, selfie, side-entrance and truster. (v3 tests are written with hardhat)

```bash
nvm install
nvm use
yarn install
yarn abi-smuggling
yarn selfie
yarn side-entrance
yarn truster
```
Actually you can recreate this repo by
```bash
git clone https://github.com/theredguild/damn-vulnerable-defi.git --branch v3-dev
```
then change or add the content in test scripts in test/ and contracts/playercontracts of corresponding  challenges as in this repo (.nvmrc added to indicate the proper node version) 

Leave comments in the issues if you are interested in the other challenges.
