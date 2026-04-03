import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'

const TEMPO_CHAIN_ID = 4217

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect }                     = useConnect()
  const { disconnect }                  = useDisconnect()
  const { switchChain }                 = useSwitchChain()

  const wrongChain = isConnected && chain?.id !== TEMPO_CHAIN_ID

  const truncate = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  async function addTempoAndSwitch() {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId:           '0x1079',
            chainName:         'Tempo',
            nativeCurrency:    { name: 'USDC', symbol: 'USDC', decimals: 6 },
            rpcUrls:           ['https://tempo.drpc.org'],
            blockExplorerUrls: ['https://explore.tempo.xyz'],
          },
        ],
      })
    } catch (err) {
      console.error('Failed to add Tempo network:', err)
    }
  }

  function handleSwitchToTempo() {
    switchChain({ chainId: TEMPO_CHAIN_ID })
  }

  return (
    <div
      style={{
        background:   '#111118',
        border:       wrongChain ? '1px solid #c0392b' : '1px solid #f5c51830',
        borderRadius: 12,
        padding:      24,
        boxShadow:    wrongChain ? '0 0 20px #c0392b20' : '0 0 20px #f5c51808',
        display:      'flex',
        flexDirection: 'column',
        gap:          12,
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          wrongChain ? '0 0 30px #c0392b30' : '0 0 30px #f5c51815'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          wrongChain ? '0 0 20px #c0392b20' : '0 0 20px #f5c51808'
      }}
    >
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
        }}
      >
        <span style={{ color: wrongChain ? '#c0392b' : '#f5c518', fontWeight: 600, fontSize: 14 }}>
          {wrongChain ? `Wrong Network (${chain?.name ?? 'Unknown'})` : 'Tempo Mainnet'}
        </span>
        {isConnected && address && (
          <span
            style={{
              background:   '#f5c51820',
              border:       '1px solid #f5c51840',
              borderRadius: 6,
              padding:      '2px 10px',
              color:        '#f5c518',
              fontSize:     13,
              fontFamily:   'monospace',
            }}
          >
            {truncate(address)}
          </span>
        )}
      </div>

      {wrongChain && (
        <div
          style={{
            background:   '#c0392b18',
            border:       '1px solid #c0392b40',
            borderRadius: 8,
            padding:      '10px 14px',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
            gap:          12,
          }}
        >
          <span style={{ color: '#c0392b', fontSize: 13, fontWeight: 500 }}>
            Switch to Tempo Chain to use the faucet
          </span>
          <button
            onClick={handleSwitchToTempo}
            style={{
              background:   '#c0392b',
              border:       'none',
              borderRadius: 6,
              padding:      '8px 16px',
              color:        '#fff',
              fontWeight:   600,
              cursor:       'pointer',
              fontSize:     13,
              whiteSpace:   'nowrap',
            }}
          >
            Switch Network
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            style={{
              background:   'transparent',
              border:       '1px solid #c0392b',
              borderRadius: 8,
              padding:      '10px 20px',
              color:        '#c0392b',
              fontWeight:   600,
              cursor:       'pointer',
              fontSize:     14,
            }}
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: injected(), chainId: TEMPO_CHAIN_ID })}
            style={{
              background:   '#f5c518',
              border:       'none',
              borderRadius: 8,
              padding:      '12px 24px',
              color:        '#0a0a0f',
              fontWeight:   600,
              cursor:       'pointer',
              fontSize:     14,
            }}
          >
            Connect Wallet
          </button>
        )}

        <button
          onClick={addTempoAndSwitch}
          style={{
            background:   'transparent',
            border:       '1px solid #f5c51840',
            borderRadius: 8,
            padding:      '10px 20px',
            color:        '#f5c51899',
            fontWeight:   500,
            cursor:       'pointer',
            fontSize:     13,
          }}
        >
          Add Tempo to MetaMask
        </button>
      </div>
    </div>
  )
}
