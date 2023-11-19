// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IPlayer} from "../IPlayer.sol";
import {IBingoCaller} from "../IBingoCaller.sol";

contract MockPlayer is IPlayer {
    string public constant NAME = "MOCK_PLAYER_NAME";
    IBingoCaller private bingoCaller;
    uint[] public cardNumbers;
    uint public totalNumbers;

    constructor(address bingoCallerAddress) {
        bingoCaller = IBingoCaller(bingoCallerAddress);
    }

    function name() external pure override returns (string memory) {
        return NAME;
    }

    function buyBingoCard() external payable override {
        bingoCaller.buyBingoCard{value: msg.value}();
    }

    function assignBingoCardNumbers(uint[] calldata numbers) external override {
        cardNumbers = numbers;
        totalNumbers = cardNumbers.length;
    }

    function callBingo() external override returns (bool) {
        return bingoCaller.callBingo();
    }

    function withdraw() external override {}
}
