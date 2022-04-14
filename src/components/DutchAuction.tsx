import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import { utils } from 'ethers/lib/';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import DutchAuctionArtifact from '../artifacts/contracts/DutchAuction.sol/DutchAuction.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';



const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledDutchAuctionDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledRow = styled.div`
  position: relative;
  width: 100%;
  padding: 0.4rem;
`;

const StyledCol = styled.div`
  float: left;
  width: 33%;
`;

const StyledColLabel = styled.div`
white-space: nowrap;
display: inline-block;
text-align: right;
  width: 45%;
`;
const StyledColInput = styled.div`
display: inline-block;
  width: 55%;
`;

const StyledLabel = styled.label`
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  margin-right: 0.5rem;
`;

const StyledShortInput = styled.input`
  padding: 0.4rem;
  width: 14rem;
  line-height: 2fr;
`;

const StyledLongInput = styled.input`
  padding: 0.4rem;
  width: 20rem;
  line-height: 2fr;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

export function DutchAuction(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [dutchAuctionContract, setDutchAuctionContract] = useState<Contract>();
  const [dutchAuctionContractAddr, setDutchAuctionContractAddr] = useState<string>('');
  const [dutchAuctionReservePrice, setDutchAuctionReservePrice] = useState<string>('');
  const [dutchAuctionJudgeAddr, setDutchAuctionJudgeAddr] = useState<string>('');
  const [dutchAuctionBlocksOpen, setDutchAuctionBlocksOpen] = useState<string>('');
  const [dutchAuctionPriceDecrement, setDutchAuctionPriceDecrement] = useState<string>('');
  const [bidValue, setBidValue] = useState<string>('');


  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!dutchAuctionContract) {
      return;
    }

  }, [dutchAuctionContract]);


  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (dutchAuctionContract || !signer) {
      return;
    }

    async function deployDutchAuctionContract(signer: Signer): Promise<void> {
      const DutchAuction = new ethers.ContractFactory(
        DutchAuctionArtifact.abi,
        DutchAuctionArtifact.bytecode,
        signer
      );

      try {

        var ReservePrice = dutchAuctionReservePrice;
        var PriceDecrement = dutchAuctionPriceDecrement;
        var nReservePrice = utils.parseEther(ReservePrice);
        var nPriceDecrement = utils.parseEther(PriceDecrement);
        var judgeAddr = dutchAuctionJudgeAddr;
        var BlocksOpen = dutchAuctionBlocksOpen;
        const dutchAuctionContract = await DutchAuction.deploy(nReservePrice, judgeAddr, BlocksOpen, nPriceDecrement);
        await dutchAuctionContract.deployed();

        
        setDutchAuctionContract(dutchAuctionContract);

        window.alert(`DutchAuction deployed to: ${dutchAuctionContract.address}`);

        setDutchAuctionContractAddr(dutchAuctionContract.address);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployDutchAuctionContract(signer);
  }



  function handleReservePriceChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionReservePrice(event.target.value);
  }

  function handleJudgeAddrChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionJudgeAddr(event.target.value);
  }

  function handleBlocksOpenChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionBlocksOpen(event.target.value);
  }

  function handlePriceDecrementChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionPriceDecrement(event.target.value);
  }

  function handleBidValueChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setBidValue(event.target.value);
  }

  function handleDutchAuctionSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!dutchAuctionContract) {
      window.alert('Undefined dutchAuctionContract');
      return;
    }

    if (!bidValue) {
      window.alert('bidValueInput cannot be empty');
      return;
    }

    async function submitBid(dutchAuctionContract: Contract): Promise<void> {
      try {

        let overrides = {
          // The amount to send with the transaction (i.e. msg.value)
          value: utils.parseEther(bidValue),
        };
        const setBidTxn = await dutchAuctionContract.bid(overrides);

        await setBidTxn.wait();
        window.alert(`DutchAuction Bid success!`);
        

      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    submitBid(dutchAuctionContract);
  }

  function handleDutchAuctionFinalize(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!dutchAuctionContract) {
      window.alert('Undefined dutchAuctionContract');
      return;
    }

    async function Finaliz(dutchAuctionContract: Contract): Promise<void> {
      try {

       
        const setBidTxn = await dutchAuctionContract.finalize();

        await setBidTxn.wait();
        window.alert(`Congratulation, Finalize success!`);

      } catch (error: any) {
        window.alert(
          'Error or bid is not finish!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    Finaliz(dutchAuctionContract);
  }



  return (
    <>
      <StyledRow>
        <StyledCol>
          <StyledColLabel>
            <StyledLabel htmlFor="reservePrice">reservePrice</StyledLabel>
          </StyledColLabel>
          <StyledColInput>
            <StyledShortInput
              id="reservePrice"
              type="text"
              //  placeholder={greeting ? '' : '<Contract not yet deployed>'}
              onChange={handleReservePriceChange}
              style={{ fontStyle: 'normal' }}
            ></StyledShortInput>
          </StyledColInput>

        </StyledCol>
        <StyledCol>

        </StyledCol>
        <StyledCol>
          <StyledColLabel>
            <StyledLabel htmlFor="blocksOpen">blocksOpen</StyledLabel>
          </StyledColLabel>
          <StyledColInput>
            <StyledShortInput
              id="blocksOpen"
              type="text"
              //  placeholder={greeting ? '' : '<Contract not yet deployed>'}
              onChange={handleBlocksOpenChange}
              style={{ fontStyle: 'normal' }}
            ></StyledShortInput>
          </StyledColInput>
        </StyledCol>
        <StyledCol>
          <StyledColLabel><StyledLabel htmlFor="priceDecrement">priceDecrement</StyledLabel></StyledColLabel>
          <StyledColInput>
            <StyledShortInput
              id="priceDecrement"
              type="text"
              //  placeholder={greeting ? '' : '<Contract not yet deployed>'}
              onChange={handlePriceDecrementChange}
              style={{ fontStyle: 'normal' }}
            ></StyledShortInput>
          </StyledColInput>
        </StyledCol>
      </StyledRow>
      <StyledRow>
        <StyledCol>
          <StyledColLabel>
            <StyledLabel htmlFor="judgeAddr">judgeAddr</StyledLabel>
          </StyledColLabel>
          <StyledColInput>
            <StyledLongInput
              id="judgeAddr"
              type="text"
              //  placeholder={greeting ? '' : '<Contract not yet deployed>'}
              onChange={handleJudgeAddrChange}
              style={{ fontStyle: 'normal' }}
            ></StyledLongInput>
          </StyledColInput>
        </StyledCol>
      </StyledRow>
      <StyledRow>
        <StyledDeployContractButton
          disabled={!active || dutchAuctionContract ? true : false}
          style={{
            float: 'right',
            cursor: !active || dutchAuctionContract ? 'not-allowed' : 'pointer',
            borderColor: !active || dutchAuctionContract ? 'unset' : 'blue'
          }}
          onClick={handleDeployContract}
        >
          Deploy
        </StyledDeployContractButton>
      </StyledRow>
      <StyledRow>
        <SectionDivider />
      </StyledRow>

      <StyledRow>
        <StyledCol>
        <StyledColLabel>
        <StyledLabel>Contract addr</StyledLabel>
          </StyledColLabel>
          <StyledColInput>
          <div>
            {dutchAuctionContractAddr ? (
              dutchAuctionContractAddr
            ) : (
              <em>{`<Contract not yet deployed>`}</em>
            )}
          </div>

          {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}

          <div></div>


          {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
         </StyledColInput>
        </StyledCol>
      </StyledRow>
      <StyledRow>
        <StyledCol>
          <StyledColLabel>
            <StyledLabel htmlFor="Value(Eth)">Value(Eth)</StyledLabel>
          </StyledColLabel>
          <StyledColInput>
            <StyledShortInput
              id="Value(Eth)"
              type="text"
              //  placeholder={greeting ? '' : '<Contract not yet deployed>'}
              onChange={handleBidValueChange}
              style={{ fontStyle: 'normal' }}
            ></StyledShortInput>
          </StyledColInput>
        </StyledCol>

        <StyledCol>
          <StyledButton
            disabled={!active || !dutchAuctionContract ? true : false}
            style={{
              cursor: !active || !dutchAuctionContract ? 'not-allowed' : 'pointer',
              borderColor: !active || !dutchAuctionContract ? 'unset' : 'blue'
            }}
            onClick={handleDutchAuctionSubmit}
          >
            Bid
          </StyledButton>
          <span> </span>
          <StyledButton
            disabled={!active || !dutchAuctionContract ? true : false}
            style={{
              cursor: !active || !dutchAuctionContract ? 'not-allowed' : 'pointer',
              borderColor: !active || !dutchAuctionContract ? 'unset' : 'blue'
            }}
            onClick={handleDutchAuctionFinalize}
          >
            Finalize
          </StyledButton>
        </StyledCol>

      </StyledRow>

    </>
  );

}

