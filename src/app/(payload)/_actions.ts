'use server'

import type { ServerFunctionHandler } from 'payload'
import { handleServerFunctions as _handleServerFunctions } from '@payloadcms/next/layouts'

export const handleServerFunctions: ServerFunctionHandler = async (args) => {
  return _handleServerFunctions(args)
}
