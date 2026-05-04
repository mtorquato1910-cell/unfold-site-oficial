'use server'

import type { ServerFunctionArgs } from 'payload'
import { handleServerFunctions as _handleServerFunctions } from '@payloadcms/next/layouts'

export async function handleServerFunctions(args: ServerFunctionArgs) {
  return _handleServerFunctions(args)
}
