// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @dev Interface of a bingo player contract
 */
interface IPlayer {
    /**
     * @dev Return the name of the player
     * @return A string containing the player's name
     */
    function name() external returns (string memory);

    /**
     * @dev Call the corresponding method on the caller's contract
     */
    function buyBingoCard() external payable;

    /**
     * @dev Callback function invoked by the Bingo contract to assign a card to the player
     * @param numbers The list of numbers that belongs to the bingo card
     */
    function assignBingoCardNumbers(uint[] calldata numbers) external;

    /**
     * @dev Call the corresponding method on the caller's contract
     * @return True if the current player's numbers have been all drawn, false otherwise
     */
    function callBingo() external returns (bool);

    /**
     * @dev Let the contract owner to get all the contract's balance
     */
    function withdraw() external;
}
