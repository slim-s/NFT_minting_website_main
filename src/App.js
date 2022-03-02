import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 20px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60%;
  @media (min-width: 60px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 5%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click below to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={3}
        ai={"center"}
        style={{ padding: 0, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/backdrop.png" : null}
      >
        <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.SpacerLarge />

        <ResponsiveWrapper style={{ padding: 0 }} test>
          <s.Container jc={"flex-start"} ai={"center"}>
            <StyledImg alt={"example"} src={"/config/images/example.gif"} />
          </s.Container>
          <s.SpacerLarge />
          <s.Container
            flex={3}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 20,
              borderRadius: 20,
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
            }}
          >
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME}
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "Mint"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
        </ResponsiveWrapper>
        <s.SpacerLarge />

        <s.Container jc={"center"} ai={"center"} style={{ width: "50%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize: 60,
            }}
          >
            <h3>!WELCOME!</h3>
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize: 20,
            }}
          >
            Welcome to the Goat Nation, a club of 10,000 randomly generated
            Goats, stored as ERC721 on Polygon blockchain and hosted on
            Inter-Planetry File System(IPFS).<br></br>
            !!HAPPY MINTING!!
          </s.TextDescription>
        </s.Container>
        <s.SpacerLarge />
        <s.Container jc={"center"} ai={"end"} style={{ width: "50%" }}>
          <s.TextDescription
            style={{
              textAlign: "end",
              color: "var(--primary)",
              fontSize: 60,
            }}
          >
            <h3>!STORY!</h3>
          </s.TextDescription>
        </s.Container>
        <s.SpacerLarge />

        <s.Container jc={"center"} ai={"center"} style={{ width: "80%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary)",
              fontSize: 60,
            }}
          >
           <h4>!TYPE OF DemiGOATS!</h4>
          </s.TextDescription>
          <s.SpacerLarge />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize:30,
            }}
            >
              DemiGoats &nbsp; GrimReaper &nbsp; TheEmperor




          </s.TextDescription>
        </s.Container>
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.Container jc={"center"} ai={"center"} style={{ width: "50%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary)",
              fontSize: 60,
            }}
          >
            <h4>!ROADMAP!</h4>
          </s.TextDescription>
        </s.Container>
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.Container jc={"center"} ai={"start"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary)",
              fontSize: 40,
            }}
          >
            <h5>The Launch!</h5>
          </s.TextDescription>
        </s.Container>
        <s.Container jc={"center"} ai={"start"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "start",
              color: "var(--primary)",
              fontSize: 21,
            }}
          >
            DemiGoats Pack will be unleashed on xx-xx-xx.
            Only the whitelisted addresses <br></br>will be allowed 
            to become a DemiGoat.
            500 NFTs will be minted randomly <br></br> in 
            the first round, among those, there 
            might be some of the GrimReaper <br></br>
            and The Emperor NFTs.
             </s.TextDescription>
        </s.Container>
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.Container jc={"center"} ai={"start"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary)",
              fontSize: 40,
            }}
          >
            <h5>Public availability!</h5>
          </s.TextDescription>
        </s.Container>              
        <s.Container jc={"center"} ai={"start"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "start",
              color: "var(--primary)",
              fontSize: 21,
            }}
          >There will be a public launch of DemiGoats 
           after the second round minting is<br></br> completed.
          
            
          </s.TextDescription>
        </s.Container>
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.SpacerLarge />
        <s.Container jc={"center"} ai={"end"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "end",
              color: "var(--primary)",
              fontSize: 40,
            }}
          >
            <h5>GrimReaper collection!</h5>
          </s.TextDescription>
        </s.Container>
        <s.Container jc={"center"} ai={"center"} style={{ width: "80%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary)",
              fontSize: 60,
            }}
          >
            <h5>!TEAM!</h5>
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize: 30,
            }}
          >
            1 &nbsp; 2&nbsp; 3 &nbsp;4&nbsp;5
          </s.TextDescription>
        </s.Container>

        <s.SpacerLarge />

        <s.Container jc={"center"} ai={"start"} style={{ width: "65%" }}>
          <s.TextDescription
            style={{
              textAlign: "start",
              color: "var(--primary)",
              fontSize: 25,
            }}
          >
            <h6>FAQs:</h6>
            Where can I view my DemiGoat NFTs?
            <br></br>
            Once you have minted a DemiGoat NFT, you will be able to see it by
            connecting you crypto-wallet.
            <br></br>
            When is the Presale event dated?
            <br></br>
            we will be holding a presale event on the date addressed above for
            our Whitelist members. Please join our Discord to learn how you can
            join the Whitelist. The Whitelist spots will be very limited.
            <br></br>
            What can I do with my DemiGoat ?<br></br>
            You can use your DemiGoat as a profile picture online, and you can
            also resell your DemiGoat for profit. Once Metavers is launched, you
            will be able to use them in the Metavers and earn DemiGoat tokens.
            <br></br>
          </s.TextDescription>
          <s.SpacerSmall />
        </s.Container>

        <s.SpacerLarge />
        <s.Container jc={"center"} ai={"center"} style={{ width: "80%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize: 16,
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
              fontSize: 20,
            }}
          >
            Smart Contract: <br></br>
            0x83Cede07Ef0CEfE7e2bdd0B28F0936a6E5c43258
          </s.TextDescription>
        </s.Container>
      </s.Container>
    </s.Screen>
  );
}

export default App;
