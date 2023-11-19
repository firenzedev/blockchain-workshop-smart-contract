const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Player contract', () => {
  const PLAYER_NAME = 'Player Name';
  const CARD_PRICE = '0.01';
  const NUMBERS = [11, 12, 13];

  let owner, user, contract, callerContract;

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    callerContract = await ethers.deployContract('MockBingoCaller', [ethers.parseEther(CARD_PRICE), NUMBERS]);
    contract = await ethers.deployContract('Player', [PLAYER_NAME, callerContract.getAddress()]);
  });

  it("should return the player's name", async () => {
    expect(await contract.name()).to.equal(PLAYER_NAME);
  });

  it('should revert if trying to buy a card with no enough money', async () => {
    await expect(contract.buyBingoCard()).to.be.revertedWith('Not enough money to buy a bingo card');
  });

  it('should assign numbers to the player when buy a bingo card', async () => {
    //expect(await contract.cardNumbers(0).length).to.equal(0);
    await contract.buyBingoCard({ value: ethers.parseEther(CARD_PRICE) });
    expect(await contract.cardNumbers(0)).to.equal(NUMBERS[0]);
    expect(await contract.cardNumbers(1)).to.equal(NUMBERS[1]);
    expect(await contract.cardNumbers(2)).to.equal(NUMBERS[2]);
  });

  it('should call the corresponding function on the caller when the player calls bingo', async () => {
    await expect(contract.callBingo()).to.emit(callerContract, 'Bingo');
  });

  it('should accept a transfer of value', async () => {
    const value = ethers.parseEther('13');
    await expect(
      user.sendTransaction({
        to: contract.getAddress(),
        value,
      })
    ).to.changeEtherBalance(contract, value);
  });

  it('should prevent any user but the owner to call the withdraw function', async () => {
    await expect(contract.connect(user).withdraw()).to.be.revertedWith('Only the owner can call this function');
  });

  it('should let the owner to call the withdraw function', async () => {
    const value = ethers.parseEther('13');
    await user.sendTransaction({
      to: contract.getAddress(),
      value,
    });
    await expect(contract.withdraw()).to.changeEtherBalances([owner, contract], [value, -value]);
  });
});
