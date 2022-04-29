import React from "react"
import AppBar from "@material-ui/core/AppBar"
import Container from "@material-ui/core/Container"
import Toolbar from "@material-ui/core/Toolbar"
import Button from "@material-ui/core/Button"

export default function Header({
  connected,
  signerAddress,
  connectWallet
}) {

  return (
    <div>
      <AppBar position="static" className="appbar-color">
        <Container maxWidth="lg">
          <Toolbar className="nav-header">
            <a href="#">
              <img src="./logo.jpg" alt="logo" className="logo" />
            </a>
            <Button variant="contained" color="secondary" className="wallet-button" onClick={() => connectWallet()}>
              {!connected ?
                <>
                  Wallet connect
                </>
                :
                <span className="wallet-address">
                  {`0x${signerAddress.slice(2, 5)}...${signerAddress.slice(-5)}`}
                </span>
              }
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  )
}