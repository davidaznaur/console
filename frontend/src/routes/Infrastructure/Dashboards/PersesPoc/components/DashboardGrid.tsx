/* Copyright Contributors to the Open Cluster Management project */

/**
 * Dashboard Grid Layout Component
 * Provides a responsive grid layout for dashboard panels similar to Perses
 */

import React from 'react'
import { Grid, GridItem } from '@patternfly/react-core'

export interface DashboardGridProps {
  children: React.ReactNode
}

/**
 * Dashboard Grid - wrapper for dashboard layout
 */
export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <Grid hasGutter style={{ padding: '16px' }}>
      {children}
    </Grid>
  )
}

export interface DashboardRowProps {
  children: React.ReactNode
  title?: string
}

/**
 * Dashboard Row - groups panels in a row
 */
export function DashboardRow({ children, title }: DashboardRowProps) {
  return (
    <>
      {title && (
        <GridItem span={12}>
          <h3 style={{ 
            marginTop: '16px', 
            marginBottom: '8px',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--pf-v5-global--Color--100)',
            borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
            paddingBottom: '8px'
          }}>
            {title}
          </h3>
        </GridItem>
      )}
      {children}
    </>
  )
}

export interface DashboardCellProps {
  children: React.ReactNode
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  smSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  mdSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lgSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  xlSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
}

/**
 * Dashboard Cell - individual grid cell for panels
 */
export function DashboardCell({ 
  children, 
  span = 12, 
  smSpan, 
  mdSpan, 
  lgSpan, 
  xlSpan 
}: DashboardCellProps) {
  return (
    <GridItem 
      span={span} 
      sm={smSpan}
      md={mdSpan}
      lg={lgSpan}
      xl={xlSpan}
    >
      {children}
    </GridItem>
  )
}

/**
 * Pre-defined layout helpers
 */
export function FourColumnLayout({ children }: { children: React.ReactNode[] }) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <DashboardCell key={index} span={12} mdSpan={6} lgSpan={3}>
          {child}
        </DashboardCell>
      ))}
    </>
  )
}

export function ThreeColumnLayout({ children }: { children: React.ReactNode[] }) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <DashboardCell key={index} span={12} mdSpan={6} lgSpan={4}>
          {child}
        </DashboardCell>
      ))}
    </>
  )
}

export function TwoColumnLayout({ children }: { children: React.ReactNode[] }) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <DashboardCell key={index} span={12} lgSpan={6}>
          {child}
        </DashboardCell>
      ))}
    </>
  )
}

export function FullWidthLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardCell span={12}>
      {children}
    </DashboardCell>
  )
}

