import { RootLayout } from '@payloadcms/next/layouts'
import config from '@payload-config'
import { importMap } from './admin/importMap'
import { handleServerFunctions } from './_actions'
import React from 'react'
import '@/admin/custom.css'

export const dynamic = 'force-dynamic'

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={handleServerFunctions}>
      {children}
    </RootLayout>
  )
}
