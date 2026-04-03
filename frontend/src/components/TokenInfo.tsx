import { useAccount, useReadContract } from 'wagmi'
import abi from '../abi/TempoPirate.json'

const CONTRACT = import.meta.env.VITE_TPIRATE_ADDRESS as `0x${string}`
const DECIMALS  = 1_000_000n

function fmt(raw: bigint): string {
  const whole = raw / DECIMALS
  return whole.toLocaleString('en-US')
}

function formatCooldown(secondsLeft: number): string {
  const h = Math.floor(secondsLeft / 3600)
  const m = Math.floor((secondsLeft % 3600) / 60)
  const s = secondsLeft % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(' ')
}

export function TokenInfo() {
  const { address } = useAccount()
  const opts         = { address: CONTRACT, abi, refetchInterval: 10_000 }

  const { data: name }        = useReadContract({ ...opts, functionName: 'name' })
  const { data: symbol }      = useReadContract({ ...opts, functionName: 'symbol' })
  const { data: totalSupply } = useReadContract({ ...opts, functionName: 'totalSupply' })
  const { data: maxSupply }   = useReadContract({ ...opts, functionName: 'MAX_SUPPLY' })
  const { data: balance }     = useReadContract({
    ...opts,
    functionName: 'balanceOf',
    args:         address ? [address] : undefined,
    query:        { enabled: !!address },
  })
  const { data: lastMint }    = useReadContract({
    ...opts,
    functionName: 'lastMintTime',
    args:         address ? [address] : undefined,
    query:        { enabled: !!address },
  })

  const nowSec      = Math.floor(Date.now() / 1000)
  const cooldownEnd = lastMint ? Number(lastMint as bigint) + 86400 : 0
  const secsLeft    = Math.max(0, cooldownEnd - nowSec)
  const onCooldown  = secsLeft > 0 && Number(lastMint as bigint) > 0

  const mintStatus = !address
    ? 'Connect wallet to check'
    : onCooldown
    ? `Cooldown: ${formatCooldown(secsLeft)} remaining`
    : 'Ready to mint ✓'

  const row = (label: string, value: string) => (
    <div
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '10px 0',
        borderBottom:   '1px solid #f5c51815',
      }}
    >
      <span style={{ color: '#f5c51899', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#ffffff', fontSize: 14, fontWeight: 500 }}>{value}</span>
    </div>
  )

  return (
    <div
      style={{
        background:   '#111118',
        border:       '1px solid #f5c51830',
        borderRadius: 12,
        padding:      24,
        boxShadow:    '0 0 20px #f5c51808',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px #f5c51815'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px #f5c51808'
      }}
    >
      <h2
        style={{
          fontFamily:    '"Pirata One", cursive',
          color:         '#f5c518',
          fontSize:      20,
          margin:        '0 0 16px 0',
          letterSpacing: '0.05em',
        }}
      >
        Token Info
      </h2>

      {row('Token', `${(name as string) ?? '—'} (${(symbol as string) ?? '—'})`)}
      {row(
        'Total Supply',
        totalSupply != null ? `${fmt(totalSupply as bigint)} TPirate` : '—',
      )}
      {row(
        'Max Supply',
        maxSupply != null ? `${fmt(maxSupply as bigint)} TPirate` : '1,000,000,000 TPirate',
      )}
      {row(
        'Your Balance',
        address && balance != null ? `${fmt(balance as bigint)} TPirate` : '—',
      )}

      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '10px 0',
        }}
      >
        <span style={{ color: '#f5c51899', fontSize: 13 }}>Mint Status</span>
        <span
          style={{
            color:      onCooldown ? '#c0392b' : '#2ecc71',
            fontSize:   14,
            fontWeight: 500,
          }}
        >
          {mintStatus}
        </span>
      </div>
    </div>
  )
}
