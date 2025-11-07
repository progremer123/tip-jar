# TipJar DApp

**학생 정보**
- 이름: 백이랑
- 학번: 92113633

## 프로젝트 소개

이더리움 블록체인을 활용한 탈중앙화 팁 jar 애플리케이션입니다. 사용자는 스마트 컨트랙트를 통해 ETH를 팁으로 보낼 수 있으며, 컨트랙트 소유자는 누적된 팁을 인출할 수 있습니다.

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Blockchain**: Ethereum, Ethers.js v6
- **Network**: Sepolia Testnet
- **Deployment**: Vercel

## 컨트랙트 정보

- **네트워크**: Sepolia Testnet
- **컨트랙트 주소**: `0xC73496345E0355De0b49aa239a33456A2b46D2a8`
- **Chain ID**: 11155111

## 주요 기능

✨ **지갑 연결**: MetaMask 등의 이더리움 지갑 연결  
💰 **팁 보내기**: ETH로 팁을 스마트 컨트랙트에 전송  
💳 **잔액 조회**: 컨트랙트에 누적된 총 ETH 잔액 확인  
🔐 **소유자 인출**: 컨트랙트 소유자만 누적된 팁 인출 가능  
📱 **반응형 디자인**: 모바일과 데스크톱에서 최적화된 UI

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
