import { EnglishApp } from '@/components/english-app';
import { AccountGate } from '@/components/account-gate';
import { isPortuguese } from '@/lib/workspace';
export default function Home() {
  return isPortuguese ? <EnglishApp /> : <AccountGate />;
}
