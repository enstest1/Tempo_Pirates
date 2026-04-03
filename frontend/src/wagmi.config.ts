import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'

const tempoMainnet = {
  id: 4217,
  name: 'Tempo',
  network: 'tempo',
  nativeCurrency: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: {
    default: { http: ['https://tempo.drpc.org'] },
    public:  { http: ['https://tempo.drpc.org'] },
  },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://explore.tempo.xyz' },
  },
  testnet: false,
} as const

export const config = createConfig({
  chains: [tempoMainnet],
  connectors: [injected()],
  transports: { [tempoMainnet.id]: http() },
})
