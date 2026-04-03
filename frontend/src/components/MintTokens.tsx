import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import toast from 'react-hot-toast'
import artifact from '../abi/TempoPirate.json'
const abi = artifact.abi

const CONTRACT = import.meta.env.VITE_TPIRATE_ADDRESS as `0x${string}`

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

export function MintTokens() {
  const { address }                    = useAccount()
  const [secsLeft, setSecsLeft]        = useState(0)
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: lastMint, refetch } = useReadContract({
    address:         CONTRACT,
    abi,
    functionName:    'lastMintTime',
    args:            address ? [address] : undefined,
    query:           { enabled: !!address, refetchInterval: 10_000 },
  })

  // Compute cooldown seconds remaining and tick every second
  useEffect(() => {
    const update = () => {
      const nowSec      = Math.floor(Date.now() / 1000)
      const cooldownEnd = lastMint ? Number(lastMint as bigint) + 86400 : 0
      setSecsLeft(Math.max(0, cooldownEnd - nowSec))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [lastMint])

  // Show success toast and refetch on confirmed tx
  useEffect(() => {
    if (isSuccess) {
      toast.success('Minted 1,000 TPirate! ☠️', {
        style: {
          background: '#111118',
          color:      '#f5c518',
          border:     '1px solid #f5c51840',
        },
      })
      refetch()
    }
  }, [isSuccess, refetch])

  // Show error toast
  useEffect(() => {
    if (error) {
      const msg =
        (error as { shortMessage?: string }).shortMessage ??
        error.message ??
        'Transaction failed'
      toast.error(msg, {
        style: {
          background: '#111118',
          color:      '#c0392b',
          border:     '1px solid #c0392b40',
        },
      })
    }
  }, [error])

  const onCooldown = secsLeft > 0 && Number(lastMint as bigint ?? 0) > 0
  const isDisabled = !address || onCooldown || isPending || isConfirming

  function handleMint() {
    writeContract({
      address:      CONTRACT,
      abi,
      functionName: 'publicMint',
    })
  }

  let buttonLabel = 'Mint 1,000 TPirate'
  if (!address)         buttonLabel = 'Connect Wallet First'
  else if (isPending)   buttonLabel = 'Confirm in Wallet…'
  else if (isConfirming) buttonLabel = 'Minting…'
  else if (onCooldown)  buttonLabel = `Cooldown: ${formatCooldown(secsLeft)}`

  return (
    <div
      style={{
        background:   '#111118',
        border:       '1px solid #f5c51830',
        borderRadius: 12,
        padding:      24,
        boxShadow:    '0 0 20px #f5c51808',
        display:      'flex',
        flexDirection: 'column',
        gap:           16,
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
          margin:        0,
          letterSpacing: '0.05em',
        }}
      >
        Faucet
      </h2>

      <p style={{ color: '#f5c51899', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
        Claim 1,000 TPirate every 24 hours. No cost — just USDC gas.
      </p>

      <button
        onClick={handleMint}
        disabled={isDisabled}
        style={{
          background:   isDisabled ? 'transparent' : '#f5c518',
          border:       isDisabled ? '1px solid #f5c51840' : 'none',
          borderRadius: 8,
          padding:      '14px 24px',
          color:        isDisabled ? '#f5c51840' : '#0a0a0f',
          fontWeight:   600,
          fontSize:     15,
          cursor:       isDisabled ? 'not-allowed' : 'pointer',
          opacity:      isDisabled ? 0.4 : 1,
          transition:   'all 0.15s ease',
          fontFamily:   '"Inter", sans-serif',
        }}
      >
        {(isPending || isConfirming) && (
          <span
            style={{
              display:      'inline-block',
              width:        14,
              height:       14,
              border:       '2px solid #0a0a0f40',
              borderTop:    '2px solid #0a0a0f',
              borderRadius: '50%',
              animation:    'spin 0.7s linear infinite',
              marginRight:  8,
              verticalAlign: 'middle',
            }}
          />
        )}
        {buttonLabel}
      </button>

      {txHash && (
        <a
          href={`https://explore.tempo.xyz/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color:          '#f5c518',
            fontSize:       12,
            textDecoration: 'none',
            wordBreak:      'break-all',
            borderBottom:   '1px solid #f5c51840',
            paddingBottom:  2,
          }}
        >
          Tx: {txHash.slice(0, 10)}…{txHash.slice(-8)} ↗
        </a>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
