import { ToastContainer } from 'react-toastify'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ToastContainer style={{ fontSize: 14, padding: '5px !important', lineHeight: '15px' }} />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
