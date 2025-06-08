import { Header } from '@/components/layout/header'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}