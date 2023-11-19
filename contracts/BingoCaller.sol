// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IBingoCaller} from "./IBingoCaller.sol";
import {IPlayer} from "./IPlayer.sol";

contract BingoCaller is IBingoCaller {
    uint public constant maxNumber = 20;
    uint public constant numbersPerCard = 6;
    uint public constant cardPrice = 0.01 ether;

    address private owner;
    uint private randomNonce = 0;
    address[] private players;
    mapping(address => bool) private isPlaying;
    mapping(address => uint[]) private playerCard;

    uint[] private numbers;
    mapping(uint => bool) public isDrawn;
    bool private gameOver;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        resetNumbers();
    }

    function getPlayersNumber() public view returns (uint) {
        return players.length;
    }

    function buyBingoCard() external payable {
        require(!isPlaying[msg.sender], "This player has already a bingo card");
        require(msg.value >= cardPrice, "Not enough money to buy a bingo card");

        players.push(msg.sender);
        isPlaying[msg.sender] = true;
        playerCard[msg.sender] = randomCardNumbers();

        IPlayer player = IPlayer(msg.sender);
        player.assignBingoCardNumbers(playerCard[msg.sender]);

        emit NewPlayer(getPlayersNumber());
    }

    function callNumber() external onlyOwner returns (uint) {
        require(!gameOver, "Game is over");
        require(numbers.length > 0, "All numbers have been called");

        uint index = random(numbers.length);
        uint called = numbers[index];

        isDrawn[called] = true;
        numbers[index] = numbers[numbers.length - 1];
        numbers.pop();

        emit Called(called);
        return called;
    }

    function callBingo() external returns (bool) {
        require(isPlaying[msg.sender], "This is not a player of this game");

        if (!playerNumbersAreAllDrawn()) {
            return false;
        }

        gameOver = true;
        IPlayer player = IPlayer(msg.sender);
        emit Bingo(player.name());

        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        return success;
    }

    function startNewGame() external onlyOwner {
        resetPlayers();
        resetNumbers();
        gameOver = false;
    }

    function playerNumbersAreAllDrawn() private view returns (bool) {
        require(
            playerCard[msg.sender].length == numbersPerCard,
            "This player has got no card"
        );

        for (uint i = 0; i < numbersPerCard; i++) {
            if (!isDrawn[playerCard[msg.sender][i]]) {
                return false;
            }
        }

        return true;
    }

    function resetPlayers() private {
        for (uint i = 0; i < players.length; i++) {
            isPlaying[players[i]] = false;
        }
        delete players;
    }

    function resetNumbers() private {
        delete numbers;
        for (uint i = 1; i <= maxNumber; i++) {
            numbers.push(i);
            isDrawn[i] = false;
        }
    }

    function randomCardNumbers() private returns (uint[] memory) {
        uint[] memory availableNumbers = getAvailableNumbers();
        uint remainingNumbers = uint(availableNumbers.length);
        uint[] memory cardNumbers = new uint[](numbersPerCard);

        for (uint i = 0; i < numbersPerCard; i++) {
            uint index = random(remainingNumbers);
            uint selected = availableNumbers[index];

            availableNumbers[index] = availableNumbers[remainingNumbers - 1];
            remainingNumbers--;

            cardNumbers[i] = selected;
        }

        return cardNumbers;
    }

    function getAvailableNumbers() private pure returns (uint[] memory) {
        uint[] memory availableNumbers = new uint[](maxNumber);

        for (uint i = 0; i < maxNumber; i++) {
            availableNumbers[i] = i + 1;
        }

        return availableNumbers;
    }

    function random(uint maxValue) private returns (uint) {
        randomNonce++;
        return
            uint(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, randomNonce)
                )
            ) % maxValue;
    }
}
