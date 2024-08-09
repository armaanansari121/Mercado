/* eslint-disable no-unused-vars */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router } from "react-router-dom";
import { ThirdwebProvider } from 'thirdweb/react';
import { ThirdwebSDKProvider } from '@thirdweb-dev/react';
import { createThirdwebClient } from 'thirdweb';
import { StateContextProvider } from './contexts';

const client = createThirdwebClient({
  clientId: "279bdbf9028501a51bf797ada51321ac",
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThirdwebSDKProvider client={client}>
   <StateContextProvider>
    <Router>
      <App />
    </Router>
   </StateContextProvider>
  </ThirdwebSDKProvider>
)


