import React from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'
import { swimmingTheme } from './theme/swimming-theme'

const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ChakraProvider theme={swimmingTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
