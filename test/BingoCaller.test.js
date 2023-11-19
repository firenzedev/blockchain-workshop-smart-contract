const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('BingoCaller contract', () => {
  const MAX_NUMBER = 20;
  const NUMBERS_PER_CARD = 6;
  const CARD_PRICE = '0.01';
  let user, contract;

  beforeEach(async () => {
    [, user] = await ethers.getSigners();
    contract = await ethers.deployContract('BingoCaller', []);
  });

  it('should return the constant values', async () => {
    expect(await contract.maxNumber()).to.equal(MAX_NUMBER);
    expect(await contract.numbersPerCard()).to.equal(NUMBERS_PER_CARD);
    expect(await contract.cardPrice()).to.equal(ethers.parseEther(CARD_PRICE));
  });

  it('should call random numbers and put them in the drawn list', async () => {
    for (let i = 1; i <= MAX_NUMBER; i++) {
      expect(await contract.isDrawn(i)).to.be.false;
    }

    const calledNumber1 = await callNumber();
    expect(await contract.isDrawn(calledNumber1)).to.be.true;

    const calledNumber2 = await callNumber();
    expect(calledNumber2).to.not.equal(calledNumber1);
    expect(await contract.isDrawn(calledNumber2)).to.be.true;
  });

  it('should call each time a different number till all numbers have been called', async () => {
    for (let i = 1; i <= MAX_NUMBER; i++) {
      expect(await contract.isDrawn(i)).to.be.false;
    }

    for (let i = 1; i <= MAX_NUMBER; i++) {
      const calledNumber = await callNumber();
      expect(await contract.isDrawn(calledNumber)).to.be.true;
    }

    for (let i = 1; i <= MAX_NUMBER; i++) {
      expect(await contract.isDrawn(i)).to.be.true;
    }

    await expect(contract.callNumber()).to.be.revertedWith('All numbers have been called');
  });

  it('should prevent an EOA to directly buy a bingo card', async () => {
    await expect(contract.connect(user).buyBingoCard({ value: ethers.parseEther(CARD_PRICE) })).to.be.reverted;
  });

  it('should fail if a player contract is trying to buy a bingo card with not enough money', async () => {
    await expect(contract.connect(user).buyBingoCard()).to.be.reverted;
  });

  it('should assign random numbers to a contract calling buyBingoCard', async () => {
    const contractAddress = await contract.getAddress();
    const player = await ethers.deployContract('MockPlayer', [contractAddress]);
    expect(await player.totalNumbers()).to.equal(0);
    expect(await contract.getPlayersNumber()).to.equal(0);

    await expect(player.buyBingoCard({ value: ethers.parseEther(CARD_PRICE) }))
      .to.emit(contract, 'NewPlayer')
      .withArgs(1);

    expect(await contract.getPlayersNumber()).to.equal(1);
    expect(await player.totalNumbers()).to.equal(NUMBERS_PER_CARD);
    for (let i = 0; i < NUMBERS_PER_CARD; i++) {
      for (let j = 0; j < NUMBERS_PER_CARD; j++) {
        if (i == j) {
          continue;
        }
        expect(await player.cardNumbers(i)).to.not.equal(await player.cardNumbers(j));
      }
    }
    expect(await player.cardNumbers(NUMBERS_PER_CARD - 1)).to.not.equal(await player.cardNumbers(0));
  });

  it("should give an error if a user who didn't buy a card tries to call bingo", async () => {
    await expect(contract.connect(user).callBingo()).to.be.revertedWith('This is not a player of this game');
  });

  it('should not emit the Bingo event if a player tries to call bingo when one or more of the numbers are not drawn', async () => {
    const contractAddress = await contract.getAddress();
    const player = await ethers.deployContract('MockPlayer', [contractAddress]);
    await player.buyBingoCard({ value: ethers.parseEther(CARD_PRICE) });
    await expect(player.callBingo()).not.to.emit(contract, 'Bingo');
  });

  it('should emit the Bingo event if a player calls bingo when all the numbers are drawn', async () => {
    const contractAddress = await contract.getAddress();
    const player = await ethers.deployContract('MockPlayer', [contractAddress]);
    await player.buyBingoCard({ value: ethers.parseEther(CARD_PRICE) });
    for (let i = 1; i <= MAX_NUMBER; i++) {
      await callNumber();
    }

    await expect(player.callBingo())
      .to.emit(contract, 'Bingo')
      .withArgs(await player.NAME());
  });

  it('should prevent any user but the owner from starting a new game', async () => {
    await expect(contract.connect(user).startNewGame()).to.be.revertedWith('Only the owner can call this function');
  });

  it('should let the owner start a new game, resetting all values', async () => {
    const calledNumber = await callNumber();
    expect(await contract.isDrawn(calledNumber)).to.be.true;
    await contract.startNewGame();
    expect(await contract.isDrawn(calledNumber)).to.be.false;
  });

  async function callNumber() {
    const txn = await contract.callNumber();
    const response = await txn.wait();
    const event = response.logs.map((log) => contract.interface.parseLog(log)).find((log) => log.name == 'Called');
    return event.args.number;
  }
});
