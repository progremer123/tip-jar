import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  JsonRpcSigner,
  formatEther,
  parseEther,
} from 'ethers'
import abiJson from '@/lib/contractABI.json'
import { contractAddress, chainId } from '@/lib/constants'

const abi = abiJson

export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === 'undefined') return null
  const anyWindow = window as unknown as { ethereum?: Eip1193Provider }
  return anyWindow.ethereum ?? null
}

export function getBrowserProvider(): BrowserProvider {
  const injected = getInjectedProvider()
  if (!injected) {
    throw new Error('지갑(예: MetaMask)이 설치되어 있지 않습니다.')
  }
  return new BrowserProvider(injected)
}

export async function getSigner(): Promise<JsonRpcSigner> {
  const provider = getBrowserProvider()
  return await provider.getSigner()
}

export async function switchToSepolia(): Promise<void> {
  const injected = getInjectedProvider()
  if (!injected || !('request' in injected)) {
    throw new Error('지갑이 설치되지 않았습니다.')
  }

  try {
    // Sepolia 네트워크로 전환 시도
    await injected.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
    })
  } catch (switchError: unknown) {
    // 네트워크가 없는 경우 추가
    if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
      try {
        await injected.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia test network',
              rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        })
      } catch {
        throw new Error('Sepolia 네트워크를 추가할 수 없습니다.')
      }
    } else {
      throw new Error('네트워크를 전환할 수 없습니다.')
    }
  }
}

export async function ensureNetwork(): Promise<void> {
  const provider = getBrowserProvider()
  const network = await provider.getNetwork()
  if (Number(network.chainId) !== chainId) {
    throw new Error(`네트워크가 올바르지 않습니다. 필요한 체인 ID: ${chainId} (Sepolia)`)
  }
}

export async function connectWallet(): Promise<string> {
  const injected = getInjectedProvider()
  if (!injected || !('request' in injected)) {
    throw new Error('EIP-1193 provider를 찾을 수 없습니다.')
  }
  const accounts = (await injected.request({
    method: 'eth_requestAccounts',
  })) as string[]
  if (!accounts || accounts.length === 0) {
    throw new Error('지갑 계정을 가져올 수 없습니다.')
  }
  return accounts[0]
}

export async function getContract(withSigner = false): Promise<Contract> {
  try {
    const provider = getBrowserProvider()
    console.log('Provider created:', !!provider)
    
    if (withSigner) {
      const signer = await getSigner()
      console.log('Signer created:', !!signer)
      return new Contract(contractAddress, abi, signer)
    }
    
    console.log('Creating read-only contract with address:', contractAddress)
    return new Contract(contractAddress, abi, provider)
  } catch (error) {
    console.error('Error creating contract:', error)
    throw error
  }
}

export async function readContractBalance(): Promise<string> {
  try {
    console.log('Reading balance from contract:', contractAddress)
    const contract = await getContract(false)
    console.log('Contract instance created for balance')
    const raw = (await contract.getBalance()) as bigint
    console.log('Raw balance:', raw.toString())
    const formatted = formatEther(raw)
    console.log('Formatted balance:', formatted)
    return formatted
  } catch (error) {
    console.error('Error reading contract balance:', error)
    throw error
  }
}

export async function readOwner(): Promise<string> {
  try {
    console.log('Reading owner from contract:', contractAddress)
    const contract = await getContract(false)
    console.log('Contract instance created')
    const owner = (await contract.owner()) as string
    console.log('Owner read successfully:', owner)
    return owner
  } catch (error) {
    console.error('Error reading owner:', error)
    throw error
  }
}

export async function sendTip(amountEth: string): Promise<string> {
  await ensureNetwork()
  const contract = await getContract(true)
  const tx = await contract.tip({ value: parseEther(amountEth) })
  const receipt = await tx.wait()
  return receipt?.hash ?? tx.hash
}

export async function withdrawTips(): Promise<string> {
  await ensureNetwork()
  const contract = await getContract(true)
  const tx = await contract.withdrawTips()
  const receipt = await tx.wait()
  return receipt?.hash ?? tx.hash
}

export async function getAccountAndNetwork(): Promise<{
  account?: string
  chainId?: number
  chainName?: string
}> {
  try {
    const provider = getBrowserProvider()
    const signer = await provider.getSigner()
    const address = await signer.getAddress().catch(() => undefined)
    const net = await provider.getNetwork()
    return {
      account: address,
      chainId: Number(net.chainId),
      chainName: net.name,
    }
  } catch {
    return {}
  }
}
