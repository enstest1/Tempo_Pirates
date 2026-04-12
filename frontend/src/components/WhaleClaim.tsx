import { useEffect, useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import toast from 'react-hot-toast'
import whaleFaucetArtifact from '../abi/WhaleFaucet.json'

const whaleFaucetAbi = whaleFaucetArtifact.abi

const WHALE_FAUCET = import.meta.env.VITE_WHALE_FAUCET_ADDRESS as `0x${string}`
const WHALE_NFT    = import.meta.env.VITE_WHALE_NFT_ADDRESS as `0x${string}`
const TEMPO_CHAIN_ID = 4217

const ERC721_BALANCE_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

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

export function WhaleClaim() {
  const { address } = useAccount()
  const [secsLeft, setSecsLeft] = useState(0)
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: nftBalance } = useReadContract({
    address:      WHALE_NFT,
    abi:          ERC721_BALANCE_ABI,
    chainId:      TEMPO_CHAIN_ID,
    functionName: 'balanceOf',
    args:         address ? [address] : undefined,
    query:        { enabled: !!address, refetchInterval: 30_000 },
  })

  const { data: lastClaim, refetch } = useReadContract({
    address:      WHALE_FAUCET,
    abi:          whaleFaucetAbi,
    chainId:      TEMPO_CHAIN_ID,
    functionName: 'lastClaimTime',
    args:         address ? [address] : undefined,
    query:        { enabled: !!address, refetchInterval: 10_000 },
  })

  const { data: faucetBalance } = useReadContract({
    address:      WHALE_FAUCET,
    abi:          whaleFaucetAbi,
    chainId:      TEMPO_CHAIN_ID,
    functionName: 'faucetBalance',
    query:        { refetchInterval: 30_000 },
  })

  const { data: claimAmount } = useReadContract({
    address:      WHALE_FAUCET,
    abi:          whaleFaucetAbi,
    chainId:      TEMPO_CHAIN_ID,
    functionName: 'claimAmount',
  })

  useEffect(() => {
    const update = () => {
      const nowSec = Math.floor(Date.now() / 1000)
      const cooldownEnd = lastClaim ? Number(lastClaim as bigint) + 43200 : 0 // 12h = 43200s
      setSecsLeft(Math.max(0, cooldownEnd - nowSec))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [lastClaim])

  useEffect(() => {
    if (isSuccess) {
      toast.success('Whel claimed 10,000 TPirate! 🐋', {
        style: {
          background: '#111118',
          color:      '#00d4ff',
          border:     '1px solid #00d4ff40',
        },
      })
      refetch()
    }
  }, [isSuccess, refetch])

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

  const hasWhale = nftBalance ? Number(nftBalance) > 0 : false
  const onCooldown = secsLeft > 0 && Number(lastClaim as bigint ?? 0n) > 0
  const isDisabled = !address || !hasWhale || onCooldown || isPending || isConfirming

  function handleClaim() {
    writeContract({
      address:      WHALE_FAUCET,
      abi:          whaleFaucetAbi,
      chainId:      TEMPO_CHAIN_ID,
      functionName: 'whaleClaim',
    })
  }

  const formattedBalance = faucetBalance
    ? (Number(faucetBalance) / 1e6).toLocaleString()
    : '...'

  const formattedClaimAmt = claimAmount
    ? (Number(claimAmount) / 1e6).toLocaleString()
    : '10,000'

  let buttonLabel = `Whel Claim ${formattedClaimAmt} TPirate`
  if (!address)           buttonLabel = 'Connect Wallet First'
  else if (!hasWhale)     buttonLabel = 'No Stable Whel NFT Found'
  else if (isPending)     buttonLabel = 'Confirm in Wallet...'
  else if (isConfirming)  buttonLabel = 'Claiming...'
  else if (onCooldown)    buttonLabel = `Cooldown: ${formatCooldown(secsLeft)}`

  return (
    <div
      style={{
        background:    'linear-gradient(135deg, #0a1628 0%, #111118 100%)',
        border:        '1px solid #00d4ff30',
        borderRadius:  12,
        padding:       24,
        boxShadow:     '0 0 20px #00d4ff08',
        display:       'flex',
        flexDirection: 'column',
        gap:           16,
        position:      'relative',
        overflow:      'hidden',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 30px #00d4ff18'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px #00d4ff08'
      }}
    >
      <div
        style={{
          position:      'absolute',
          top:           -30,
          right:         -30,
          width:         80,
          height:        80,
          background:    'radial-gradient(circle, #00d4ff10 0%, transparent 70%)',
          borderRadius:  '50%',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 24 }}>🐋</span>
        <h2
          style={{
            fontFamily:    '"Pirata One", cursive',
            color:         '#00d4ff',
            fontSize:      20,
            margin:        0,
            letterSpacing: '0.05em',
          }}
        >
          Whel Faucet
        </h2>
        {hasWhale && (
          <span
            style={{
              background:   '#00d4ff20',
              color:        '#00d4ff',
              fontSize:     10,
              padding:      '3px 8px',
              borderRadius: 20,
              fontWeight:   600,
              fontFamily:   '"Inter", sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Whel Holder
          </span>
        )}
      </div>

      <p style={{ color: '#00d4ff99', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
        Hold a <strong style={{ color: '#00d4ff' }}>Stable Whel NFT</strong> to claim{' '}
        <strong style={{ color: '#00d4ff' }}>{formattedClaimAmt} TPirate</strong> every 12 hours.
        {' '}10x the regular faucet.
      </p>

      <div
        style={{
          display:       'flex',
          justifyContent: 'space-between',
          background:    '#0a0a0f',
          borderRadius:  8,
          padding:       '10px 14px',
          fontSize:      12,
          fontFamily:    '"Inter", sans-serif',
        }}
      >
        <span style={{ color: '#00d4ff66' }}>Faucet Balance</span>
        <span style={{ color: '#00d4ff', fontWeight: 600 }}>{formattedBalance} TPirate</span>
      </div>

      <button
        onClick={handleClaim}
        disabled={isDisabled}
        style={{
          background:   isDisabled ? 'transparent' : 'linear-gradient(135deg, #00d4ff 0%, #0088cc 100%)',
          border:       isDisabled ? '1px solid #00d4ff40' : 'none',
          borderRadius: 8,
          padding:      '14px 24px',
          color:        isDisabled ? '#00d4ff40' : '#fff',
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
              display:       'inline-block',
              width:         14,
              height:        14,
              border:        '2px solid #ffffff40',
              borderTop:     '2px solid #fff',
              borderRadius:  '50%',
              animation:     'spin 0.7s linear infinite',
              marginRight:   8,
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
            color:          '#00d4ff',
            fontSize:       12,
            textDecoration: 'none',
            wordBreak:      'break-all',
            borderBottom:   '1px solid #00d4ff40',
            paddingBottom:  2,
          }}
        >
          Tx: {txHash.slice(0, 10)}...{txHash.slice(-8)} &uarr;
        </a>
      )}
    </div>
  )
}
