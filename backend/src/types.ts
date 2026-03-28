import type { JWTPayload } from './db/models'
import type { DIContainer } from './utils/di'
import type { CodeAttachmentService } from './services/codeAttachmentService'

export type Env = {
  DB: D1Database
  R2?: R2Bucket
  KV: KVNamespace
  JWT_SECRET?: string
  ENVIRONMENT?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
  RESEND_FROM_NAME?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  GITHUB_REDIRECT_URI?: string
  API_URL?: string
}

export type Bindings = Env

export type Variables = {
  user: JWTPayload
  userId?: string
  currentUser?: JWTPayload
  userRole?: string
  container?: DIContainer
  codeAttachmentService?: CodeAttachmentService
}

export type AppContext = {
  Bindings: Env
  Variables: Variables
}