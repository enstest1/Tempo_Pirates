import { WagmiProvider }         from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster }                from 'react-hot-toast'
import { config }                 from './wagmi.config'
import { WalletConnect }          from './components/WalletConnect'
import { TokenInfo }              from './components/TokenInfo'
import { MintTokens }             from './components/MintTokens'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background:   '#111118',
              color:        '#f5c518',
              border:       '1px solid #f5c51840',
              fontFamily:   '"Inter", sans-serif',
              fontSize:     14,
            },
          }}
        />

        <div
          style={{
            minHeight:       '100vh',
            background:      '#0a0a0f',
            display:         'flex',
            justifyContent:  'center',
            padding:         '40px 16px 60px',
            boxSizing:       'border-box',
            fontFamily:      '"Inter", sans-serif',
          }}
        >
          <div
            style={{
              width:     '100%',
              maxWidth:  480,
              display:   'flex',
              flexDirection: 'column',
              gap:       20,
            }}
          >
            {/* ── Header ── */}
            <div style={{ textAlign: 'center', paddingBottom: 8 }}>
              <div style={{ fontSize: 48, lineHeight: 1.1, marginBottom: 8 }}>☠️</div>
              <h1
                style={{
                  fontFamily:    '"Pirata One", cursive',
                  fontSize:      48,
                  color:         '#f5c518',
                  letterSpacing: '0.1em',
                  margin:        '0 0 6px 0',
                  lineHeight:    1,
                }}
              >
                TEMPO PIRATE
              </h1>
              <p
                style={{
                  color:        '#f5c51899',
                  fontSize:     14,
                  margin:       '0 0 20px 0',
                  fontFamily:   '"Inter", sans-serif',
                }}
              >
                TPirate · Sail the Stablecoin Seas
              </p>
              <hr
                style={{
                  border:     'none',
                  borderTop:  '1px solid #f5c51840',
                  margin:     0,
                }}
              />
            </div>

            {/* ── Cards ── */}
            <WalletConnect />
            <TokenInfo />
            <MintTokens />

            {/* ── Footer ── */}
            <p
              style={{
                textAlign:  'center',
                color:      '#f5c51844',
                fontSize:   12,
                margin:     0,
                paddingTop: 8,
              }}
            >
              Deployed on Tempo Chain ⚡ Chain ID 4217
            </p>
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
