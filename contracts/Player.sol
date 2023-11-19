// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPlayer} from "./IPlayer.sol";
import {IBingoCaller} from "./IBingoCaller.sol";

contract Player is IPlayer {
    string public name;
    uint[] public cardNumbers;

    address private owner;
    IBingoCaller private caller;
    uint private cardPrice;

    constructor(string memory playerName, address bingoCallerAddress) {
        owner = msg.sender;
        name = playerName;

        caller = IBingoCaller(bingoCallerAddress);
        cardPrice = caller.cardPrice();
    }

    function buyBingoCard() external payable {
        require(msg.value >= cardPrice, "Not enough money to buy a bingo card");
        caller.buyBingoCard{value: msg.value}();
    }

    function assignBingoCardNumbers(uint[] calldata numbers) external {
        cardNumbers = numbers;
    }

    function callBingo() external returns (bool) {
        return caller.callBingo();
    }

    function withdraw() external {
        require(msg.sender == owner, "Only the owner can call this function");
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {}
}
