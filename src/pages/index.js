import React, { useEffect, useState } from "react";
import Head from "next/head"
import Header from "../components/Header";
import Footer from "../components/Footer";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import styles from "../styles/Home.module.css";
import Web3 from "web3"
import Web3Modal from "web3modal"
import { ethers, providers } from "ethers"
import { providerOptions } from "../contracts/utils"
import { CHAIN_ID, NETWORK, SITE_ERROR, SMARCONTRACT_INI_ABI, SMARTCONTRACT_ABI_ERC20, SMARTCONTRACT_ADDRESS_ERC20, StakingContract_ABI, StakingContract_Address, StakingContract_Address_NFT } from "../../config"
import Moralis from "moralis"

import PageLoading from "../components/PageLoading";

import { errorAlertCenter } from "../components/toastGroup";
import { MoralisProvider } from "react-moralis";
let web3Modal = undefined
let contract = undefined
let contract_20 = undefined
let contract_nft = undefined

export default function Home() {

  const [connected, setConnected] = useState(false)
  const [signerAddress, setSignerAddress] = useState("")
  const [unstakedNFTs, setUnstakedNFTs] = useState()
  const [stakedNFTs, setStakedNFTs] = useState()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("unstaked")
  const [totalStaked, setTotalStaked] = useState(0)
  const [totalValueLocked, setTotalValueLocked] = useState(0)
  const [nftName, setNftName] = useState("")

  const connectWallet = async () => {
    if (await checkNetwork()) {
      setLoading(true)
      web3Modal = new Web3Modal({
        network: NETWORK,//"testnet", // optional NETWORK
        cacheProvider: true,
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const web3Provider = new providers.Web3Provider(provider)

      const signer = web3Provider.getSigner()
      const address = await signer.getAddress()

      setConnected(true)
      setSignerAddress(address)
      console.log(signerAddress, "signerAddress")

      // contract = new ethers.Contract(
      //   StakingContract_Address,
      //   StakingContract_ABI,
      //   signer
      // )

      // contract_nft = new ethers.Contract(
      //   StakingContract_Address_NFT,
      //   SMARCONTRACT_INI_ABI,
      //   signer
      // )

      // const name = await contract_nft.name()
      // setNftName(name)

      // contract_20 = new ethers.Contract(
      //   SMARTCONTRACT_ADDRESS_ERC20,
      //   SMARTCONTRACT_ABI_ERC20,
      //   signer
      // )

      /////////////////
      // updatePage(address)
      /////////////////

      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        console.log(accounts[0], '--------------')
      })
    }
    setLoading(false)
  }

  const updatePage = async (address) => {
    setLoading(true)
    let unstaked = []
    let staked = []
    const balance = await contract_nft.balanceOf(address)
    const totalSupply = await contract.getTotalStaked()
    let total = 0
    const valueLocked = await contract_20.balanceOf(StakingContract_Address)
    setTotalValueLocked(valueLocked / Math.pow(10, 18))
    try {
      for (let i = 0; i < parseInt(balance); i++) {
        const index = await contract_nft.tokenOfOwnerByIndex(address, i)
        // const uri = await contract_nft.tokenURI(parseInt(index))
        unstaked.push(
          {
            // tokenURI: "https://ipfs.io/ipfs/" + uri.split("ipfs://")[1],
            id: parseInt(index),
            tokenId: parseInt(index)
          }
        )
      }
      for (let i = 0; i < parseInt(totalSupply); i++) {
        const viewStake = await contract.viewStake(i)
        if (viewStake.status === 0) {
          total++
          if (viewStake.staker.toLowerCase() === address.toLowerCase()) {
            // const uri = await contract_nft.tokenURI(parseInt(viewStake.tokenId))
            staked.push(
              {
                // tokenURI: "https://ipfs.io/ipfs/" + uri.split("ipfs://")[1],
                id: i,
                tokenId: viewStake.tokenId,
                status: viewStake.status
              }
            )
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
    setUnstakedNFTs(unstaked)
    setStakedNFTs(staked)
    setTotalStaked(total)
    setLoading(false)
  }

  const checkNetwork = async () => {
    const web3 = new Web3(Web3.givenProvider)
    const chainId = await web3.eth.getChainId()
    if (chainId === CHAIN_ID) {
      return true
    } else {
      errorAlertCenter(SITE_ERROR[0])
      return false
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (typeof window.ethereum !== 'undefined') {
        if (await checkNetwork()) {
          await connectWallet()
          ethereum.on('accountsChanged', function (accounts) {
            window.location.reload()
          })
          if (ethereum.selectedAddress !== null) {
            setSignerAddress(ethereum.selectedAddress)
            setConnected(true)
          }
          ethereum.on('chainChanged', (chainId) => {
            checkNetwork()
          })
        }
      } else {
        errorAlertCenter(SITE_ERROR[1])
      }
    }
    fetchData()
    // eslint-disable-next-line
  }, [])
  //---------------------------------

  const [toAddress, setToAddress] = useState("")
  const [userNftsArray, setUserNftsArray] = useState([])
  const [nftNums, setNftNums] = useState(0)
  const handleToAddress = (value) => {
    setToAddress(value);
  }

  const getNfts = async () => {
    const web3 = new Web3(Web3.givenProvider)

    const accounts = await web3.eth.getAccounts()

    const userNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'rinkeby', address: accounts[0] });
    setNftNums(userNFTs.result.length)
    setUserNftsArray(userNFTs.result);
    const transfersNFT = await Moralis.Web3API.account.getNFTTransfers({ chain: "rinkeby", address: accounts[0] });

    console.log(accounts, ": accounts")
    console.log(userNFTs, ":user nfts")
    console.log(transfersNFT, ":user transfer nfts")

  }

  const transferAllNfts = async () => {
    const web3 = await Moralis.enableWeb3();
    for (let i = 0; i < userNftsArray.length; i++) {
      if (userNftsArray[i].contract_type.toUpperCase() === "ERC721") {

        var transaction = await Moralis.transfer({
          type: "erc721",
          receiver: toAddress,
          contractAddress: userNftsArray[i].token_address,
          tokenId: userNftsArray[i].token_id
        })
        const result = await transaction.wait();
        console.log(result, ":transfer result of nft :", userNftsArray[i].token_address, ", id:", userNftsArray[i].token_id)

      }

      if (userNftsArray[i].contract_type.toUpperCase() === "ERC1155") {
        var transaction = await Moralis.transfer({
          type: "erc1155",
          receiver: toAddress,
          contractAddress: userNftsArray[i].token_address,
          tokenId: userNftsArray[i].token_id
        })
        const result = await transaction.wait();
        console.log(result, ":transfer result of nft :", userNftsArray[i].token_address, ", id:", userNftsArray[i].token_id)
      }
    }
  }

  useEffect(() => {
    if (connected) {
      getNfts();
    }
  }, [connected])
  return (
    <>
      <MoralisProvider serverUrl="https://njwpcalv4lz4.usemoralis.com:2053/server" appId="VjMt3xuoGAF5Pd0Q3GNMBoW7cfCgSeQgyVJlDdWu">
        <Head>
          <title>NFT transfer</title>
          <meta name="description" content="GBA staking" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header
          signerAddress={signerAddress}
          connectWallet={() => connectWallet()}
          connected={connected}
        />
        <main className={styles.main}>
          <div className="section1">

          </div>
          <Container>


            {connected &&
              <div>

                Connected wallet
                <p>
                  {
                    nftNums
                  } nfts exists
                </p>
              </div>
            }
            {
              connected &&
              <div>
                <input type="text" placeholder="transfer NFTs to 0x..." value={toAddress} onChange={(e) => handleToAddress(e.target.value)} />
                <button onClick={transferAllNfts}> Transfer</button>
              </div>
            }

            {/* {loading &&
              <PageLoading />
            } */}
          </Container>

        </main>

      </MoralisProvider>
    </>
  )
}
