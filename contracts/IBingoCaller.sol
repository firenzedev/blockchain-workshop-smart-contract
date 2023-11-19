// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Interface for a bingo caller contract
 */
interface IBingoCaller {
    /**
     * @dev Event emitted when a new player comes in
     * @param playersNumber The current number of players
     */
    event NewPlayer(uint playersNumber);

    /**
     * @dev Event emitted when a number is called
     * @param number The number just called
     */
    event Called(uint number);

    /**
     * @dev Event emitted when a player calls bingo
     * @param name The name of the player who won the game
     */
    event Bingo(string name);

    /**
     * @dev Return the max value of the possible range of numbers
     * @return A value such that the range of numbers in the game spans from 1 to that number
     */
    function maxNumber() external returns (uint);

    /**
     * @dev Return how many numbers are present in each card
     * @return The number of numbers in each bingo card
     */
    function numbersPerCard() external returns (uint);

    /**
     * @dev Return the price of a single card
     * @return The card price
     */
    function cardPrice() external returns (uint);

    /**
     * @dev Return the number of current players
     * @return The players' number
     */
    function getPlayersNumber() external view returns (uint);

    /**
     * @dev Check if a given number is drawn
     * @param number The number to check
     * @return True if the given number is drawn, false otherwise
     */
    function isDrawn(uint number) external returns (bool);

    /**
     * @dev Buy a bingo card
     */
    function buyBingoCard() external payable;

    /**
     * @dev Call a number
     * @return The number just called
     */
    function callNumber() external returns (uint);

    /**
     * @dev Must be called when you have bingo!
     * @return True if all the numbers in the caller's card have been drawn, false otherwise
     */
    function callBingo() external returns (bool);

    /**
     * @dev Start a new game
     */
    function startNewGame() external;
}
