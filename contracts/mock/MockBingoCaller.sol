// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IBingoCaller} from "../IBingoCaller.sol";
import {IPlayer} from "../IPlayer.sol";

contract MockBingoCaller is IBingoCaller {
    uint private price;
    uint[] private numbers;

    constructor(uint _cardPrice, uint8[] memory _numbers) {
        price = _cardPrice;
        numbers = _numbers;
    }

    function maxNumber() external override returns (uint) {}

    function numbersPerCard() external override returns (uint) {}

    function cardPrice() external view override returns (uint) {
        return price;
    }

    function getPlayersNumber() external pure override returns (uint) {
        return 42;
    }

    function isDrawn(uint number) external override returns (bool) {}

    function buyBingoCard() external payable override {
        IPlayer player = IPlayer(msg.sender);
        player.assignBingoCardNumbers(numbers);
    }

    function callNumber() external override returns (uint) {}

    function callBingo() external override returns (bool) {
        emit Bingo("");
        return true;
    }

    function startNewGame() external override {}
}
