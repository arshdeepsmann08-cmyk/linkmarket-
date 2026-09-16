import type { Config } from "tailwindcss";
export default { content:["./app/**/*.{ts,tsx}","./components/**/*.{ts,tsx}"], theme:{extend:{colors:{ink:"#0b1120", mint:"#20c997", sand:"#f8f7f2"},boxShadow:{soft:"0 12px 32px rgb(15 23 42 / .08)"}}}, plugins:[] } satisfies Config;
