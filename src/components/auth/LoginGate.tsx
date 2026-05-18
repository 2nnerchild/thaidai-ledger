import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { hasPassword, isAuthenticated, setPassword, verifyPassword } from '@/features/auth/auth';

interface LoginGateProps {
  children: ReactNode;
}

export function LoginGate({ children }: LoginGateProps) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [passwordExists, setPasswordExists] = useState(hasPassword);
  const [password, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authenticated) {
    return <>{children}</>;
  }

  const isSetup = !passwordExists;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('비밀번호는 8자 이상으로 설정해 주세요.');
      return;
    }

    if (isSetup && password !== confirmPassword) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSetup) {
        await setPassword(password);
        setPasswordExists(true);
        setAuthenticated(true);
        return;
      }

      const ok = await verifyPassword(password);
      if (!ok) {
        setError('비밀번호가 올바르지 않습니다.');
        return;
      }
      setAuthenticated(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cream-light border-2 border-walnut-dark shadow-flat p-5">
        <div className="border-b-2 border-walnut-dark pb-4 mb-5">
          <p className="font-mono text-xs text-burnt-orange tracking-widest mb-2">PRIVATE LEDGER</p>
          <h1 className="font-display text-3xl text-black-ink">THAIDAI</h1>
          <p className="font-body text-sm text-grey-border mt-1">
            {isSetup ? '처음 사용을 위해 앱 잠금 비밀번호를 설정합니다.' : '장부를 열려면 비밀번호를 입력해 주세요.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="비밀번호"
            type="password"
            autoComplete={isSetup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPasswordValue(event.target.value)}
          />

          {isSetup && (
            <Input
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          )}

          {error && (
            <div className="border-2 border-red-warn bg-white px-3 py-2 text-sm font-body text-red-warn">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" fullWidth disabled={isSubmitting}>
            {isSubmitting ? '확인 중...' : isSetup ? '비밀번호 설정' : '로그인'}
          </Button>
        </form>

        <p className="font-body text-xs text-grey-border leading-relaxed mt-4">
          이 잠금은 현재 브라우저의 로컬 장부를 보호합니다. 서버 계정 로그인과 기기 간 동기화는 Supabase
          인증 단계에서 별도로 붙이는 구조가 맞습니다.
        </p>
      </div>
    </div>
  );
}
