const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Bingo Game', () => {
  const PLAYER1_NAME = 'Player One';
  const PLAYER2_NAME = 'Player Two';
  let callerOwner, player1, player2, callerContract, player1Contract, player2Contract, cardPrice, numbersPerCard;

  beforeEach(async () => {
    [callerOwner, player1, player2] = await ethers.getSigners();
    callerContract = await ethers.deployContract('BingoCaller', [], callerOwner);
    player1Contract = await ethers.deployContract('Player', [PLAYER1_NAME, callerContract.getAddress()], player1);
    player2Contract = await ethers.deployContract('Player', [PLAYER2_NAME, callerContract.getAddress()], player2);
    cardPrice = await callerContract.cardPrice();
    numbersPerCard = await callerContract.numbersPerCard();
  });

  it('should let one or more players to join the game until one of them calls bingo', async () => {
    expect(await callerContract.getPlayersNumber()).to.equal(0);

    await expect(player1Contract.connect(player1).buyBingoCard({ value: cardPrice }))
      .to.emit(callerContract, 'NewPlayer')
      .withArgs(1);

    await expect(player2Contract.connect(player2).buyBingoCard({ value: cardPrice }))
      .to.emit(callerContract, 'NewPlayer')
      .withArgs(2);

    expect(await callerContract.getPlayersNumber()).to.equal(2);
    let player1Numbers = await getNumbers(player1Contract);
    let player2Numbers = await getNumbers(player2Contract);

    while (player1Numbers.length > 0 && player2Numbers.length > 0) {
      const calledNumber = await callNumber();
      player1Numbers = player1Numbers.filter((n) => n !== calledNumber);
      player2Numbers = player2Numbers.filter((n) => n !== calledNumber);
    }

    if (player1Numbers.length == 0) {
      await expect(player1Contract.connect(player1).callBingo())
        .to.emit(callerContract, 'Bingo')
        .withArgs(PLAYER1_NAME);
      await expect(player1Contract.connect(player1).withdraw()).to.changeEtherBalance(player1, cardPrice + cardPrice);
    } else {
      await expect(player2Contract.connect(player2).callBingo())
        .to.emit(callerContract, 'Bingo')
        .withArgs(PLAYER2_NAME);
      await expect(player2Contract.connect(player2).withdraw()).to.changeEtherBalance(player2, cardPrice + cardPrice);
    }
  });

  async function getNumbers(contract) {
    const result = [];
    for (let i = 0; i < numbersPerCard; i++) {
      result.push(await contract.cardNumbers(i));
    }
    return result;
  }

  async function callNumber() {
    const txn = await callerContract.callNumber();
    const response = await txn.wait();
    const event = response.logs
      .map((log) => callerContract.interface.parseLog(log))
      .find((log) => log.name == 'Called');
    return event.args.number;
  }
});
