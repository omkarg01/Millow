const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async () => {
        // Setup accounts
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        // Deploy Real Estate
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        // Mint 
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS")
        await transaction.wait()

        // Deploy Escrow
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        // Approve Escrow
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // List
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()

    })

    describe('Deployment', () => {
        it("Returns NFT address", async () => {
            const result = await escrow.nftAddress();
            expect(result).to.equal(realEstate.address)
        })

        it("Returns seller address", async () => {
            const result = await escrow.seller();
            expect(result).to.equal(seller.address)
        })

        it("Returns inspector address", async () => {
            const result = await escrow.inspector();
            expect(result).to.equal(inspector.address)
        })

        it("Returns lender address", async () => {
            const result = await escrow.lender();
            expect(result).to.equal(lender.address)
        })
    })

    describe("Listing", () => {
        it("Updated as listed", async () => {
            const result = await escrow.isListed(1)
            expect(result).to.equal(true)
        })

        it('Returns buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        

        it("Update ownership", async () => {
            const result = await realEstate.ownerOf(1)
            expect(result).to.equal(escrow.address)
        })

    })


})
