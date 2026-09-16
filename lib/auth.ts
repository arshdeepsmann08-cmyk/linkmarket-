import { SignJWT, jwtVerify } from "jose"; import { cookies } from "next/headers";
const key=()=>new TextEncoder().encode(process.env.AUTH_SECRET||"development-only-change-me"); export type Session={id:string;name:string;email:string;role:"USER"|"ADMIN"};
export async function makeSession(user:Session){return new SignJWT(user).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(key())}
export async function getSession():Promise<Session|null>{const token=(await cookies()).get("linkmarket_session")?.value;if(!token)return null;try{return (await jwtVerify(token,key())).payload as unknown as Session}catch{return null}}
export async function requireUser(){const s=await getSession();if(!s)throw new Error("UNAUTHORIZED");return s} export async function requireAdmin(){const s=await requireUser();if(s.role!=="ADMIN")throw new Error("FORBIDDEN");return s}
