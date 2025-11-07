'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  connectWallet,
  getAccountAndNetwork,
  readContractBalance,
  readOwner,
  sendTip,
  switchToSepolia,
  withdrawTips,
} from '@/lib/eth'

export default function Home() {
  
  const name = '백이랑'
  const studentNumber = '92113633'

  const [account, setAccount] = useState<string | undefined>(undefined)
  const [chainId, setChainId] = useState<number | undefined>(undefined)
  const [chainName, setChainName] = useState<string | undefined>(undefined)
  const [balanceEth, setBalanceEth] = useState<string>('0')
  const [owner, setOwner] = useState<string>('')
  const [amount, setAmount] = useState<string>('0.01')
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')

  function getErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message?: unknown }).message
      if (typeof msg === 'string') return msg
    }
    return ''
  }

  const refreshBasics = useCallback(async () => {
    try {
      const info = await getAccountAndNetwork()
      setAccount(info.account)
      setChainId(info.chainId)
      setChainName(info.chainName)
      const [b, o] = await Promise.all([readContractBalance(), readOwner()])
      setBalanceEth(b)
      setOwner(o)
    } catch {
      // 무시: 초기 로드에서 지갑이 없어도 됨
    }
  }, [])

  useEffect(() => {
    refreshBasics()
  }, [refreshBasics])

  async function onConnect() {
    setLoading(true)
    setMessage('')
    try {
      const addr = await connectWallet()
      setAccount(addr)
      await refreshBasics()
      setMessage('지갑이 연결되었습니다.')
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || '지갑 연결 실패'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  async function onSendTip() {
    setLoading(true)
    setMessage('')
    try {
      const hash = await sendTip(amount)
      await refreshBasics()
      setMessage(`Tip 전송 완료: ${hash}`)
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || 'Tip 전송 실패'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  async function onWithdraw() {
    setLoading(true)
    setMessage('')
    try {
      const hash = await withdrawTips()
      await refreshBasics()
      setMessage(`인출 완료: ${hash}`)
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || '인출 실패'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  async function onSwitchToSepolia() {
    setLoading(true)
    setMessage('')
    try {
      await switchToSepolia()
      await refreshBasics()
      setMessage('Sepolia 네트워크로 전환되었습니다.')
    } catch (e: unknown) {
      const msg = getErrorMessage(e) || '네트워크 전환 실패'
      setMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  const isOwner = useMemo(
    () => owner && account && owner.toLowerCase() === account.toLowerCase(),
    [owner, account]
  )

  return (
    <div className="font-sans min-h-screen p-8 sm:p-20 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tip Jar</h1>

      <section className="mb-6 p-4 border rounded-md">
        <div className="mb-3">
          <div className="text-sm text-gray-500">이름</div>
          <div className="text-lg font-semibold">{name}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">학번</div>
          <div className="text-lg font-semibold">{studentNumber}</div>
        </div>
      </section>

      <section className="mb-6 p-4 border rounded-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">계정</div>
            <div className="font-mono break-all">
              {account ?? '연결되지 않음'}
            </div>
          </div>
          <button
            onClick={onConnect}
            disabled={loading}
            className="rounded-lg px-4 py-2.5 bg-gradient-to-r from-black to-gray-800 text-white shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {account ? '지갑 새로고침' : '지갑 연결'}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            네트워크: {chainName ?? '-'} ({chainId ?? '-'})
          </div>
          {chainId && chainId !== 11155111 && (
            <button
              onClick={onSwitchToSepolia}
              disabled={loading}
              className="rounded-md px-3 py-1 text-xs text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
            >
              Sepolia로 전환
            </button>
          )}
        </div>
        {chainId && chainId !== 11155111 && (
          <div className="mt-2 p-2 bg-orange-50 border-l-4 border-orange-400 rounded-r text-sm text-orange-700">
            ⚠️ 현재 네트워크가 Sepolia가 아닙니다. TipJar를 사용하려면 Sepolia 테스트넷으로 전환해주세요.
          </div>
        )}
      </section>

      <section className="mb-6 p-4 border rounded-md">
        <div className="text-sm text-gray-500">컨트랙트 잔액 (ETH)</div>
        <div className="text-xl font-semibold">{balanceEth}</div>
      </section>

      <section className="mb-6 p-4 border rounded-md">
        <div className="text-sm text-gray-500">오너</div>
        <div className="font-mono break-all">{owner || '-'}</div>
      </section>

      <section className="mb-6 p-4 border rounded-md">
        <div className="mb-3">
          <label className="block text-sm text-gray-500 mb-1">
            Tip 금액 (ETH)
          </label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="0.01"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSendTip}
            disabled={loading}
            className="rounded-md px-3 py-2 text-white bg-blue-600 disabled:opacity-50"
          >
            Tip 보내기
          </button>
          {isOwner && (
            <button
              onClick={onWithdraw}
              disabled={loading}
              className="rounded-md px-3 py-2 text-white bg-emerald-600 disabled:opacity-50"
            >
              잔액 인출
            </button>
          )}
        </div>
      </section>

      {message && (
        <div className="mt-4 p-3 border rounded-md bg-gray-50 text-sm break-all">
          {message}
        </div>
      )}
    </div>
  )
}
