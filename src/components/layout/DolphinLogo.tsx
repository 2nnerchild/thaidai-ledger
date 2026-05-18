interface DolphinLogoProps {
  size?: number;
  color?: string;
}

export function DolphinLogo({ size = 32, color = '#C75D2C' }: DolphinLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="THAIDAI 돌핀 로고"
    >
      {/* 몸통 */}
      <path
        d="M8 38 C12 20, 28 14, 44 18 C52 20, 58 26, 56 34 C54 42, 44 46, 32 44 C20 42, 10 46, 8 38Z"
        fill={color}
      />
      {/* 등지느러미 */}
      <path
        d="M36 18 C38 10, 46 8, 48 16 C46 16, 42 16, 36 18Z"
        fill={color}
      />
      {/* 꼬리 */}
      <path
        d="M8 38 C4 34, 2 28, 6 24 C8 30, 10 34, 8 38Z"
        fill={color}
      />
      <path
        d="M8 38 C4 42, 2 48, 6 50 C8 44, 10 40, 8 38Z"
        fill={color}
      />
      {/* 눈 */}
      <circle cx="48" cy="26" r="2.5" fill="#FAF5E9" />
      <circle cx="48.8" cy="25.2" r="1" fill="#1A1410" />
      {/* 부리 */}
      <path
        d="M52 30 C56 29, 60 30, 58 32 C56 30, 52 31, 52 30Z"
        fill={color}
      />
    </svg>
  );
}
