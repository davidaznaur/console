/* Copyright Contributors to the Open Cluster Management project */

/**
 * Dashboard Panel Components for Perses POC
 * These components provide Perses-style panel visualizations
 */

import React from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Skeleton,
  Stack,
  StackItem,
  Flex,
  FlexItem,
  Label,
  Title,
  Text,
  TextVariants,
  Bullseye,
} from '@patternfly/react-core'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  QuestionCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from '@patternfly/react-icons'

export interface DashboardPanelProps {
  title: string
  description?: string
  loading?: boolean
  error?: Error | null
  height?: number
  children?: React.ReactNode
}

/**
 * Base Dashboard Panel wrapper component
 */
export function DashboardPanel({
  title,
  description,
  loading,
  error,
  height = 200,
  children,
}: DashboardPanelProps) {
  return (
    <Card
      isCompact
      style={{
        height: `${height}px`,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--pf-v5-global--BorderColor--100)',
      }}
    >
      <CardHeader>
        <CardTitle>
          <Flex>
            <FlexItem>
              <Title headingLevel="h4" size="md">
                {title}
              </Title>
            </FlexItem>
          </Flex>
          {description && (
            <Text component={TextVariants.small} style={{ color: 'var(--pf-v5-global--Color--200)' }}>
              {description}
            </Text>
          )}
        </CardTitle>
      </CardHeader>
      <CardBody style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
        {loading ? (
          <Stack hasGutter>
            <StackItem>
              <Skeleton width="100%" height="30px" />
            </StackItem>
            <StackItem>
              <Skeleton width="80%" height="20px" />
            </StackItem>
            <StackItem>
              <Skeleton width="60%" height="20px" />
            </StackItem>
          </Stack>
        ) : error ? (
          <Bullseye>
            <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <ExclamationCircleIcon color="var(--pf-v5-global--danger-color--100)" size="lg" />
              </FlexItem>
              <FlexItem>
                <Text component={TextVariants.small} style={{ color: 'var(--pf-v5-global--danger-color--100)' }}>
                  {error.message}
                </Text>
              </FlexItem>
            </Flex>
          </Bullseye>
        ) : (
          children
        )}
      </CardBody>
    </Card>
  )
}

export interface StatPanelProps {
  title: string
  description?: string
  value: number | string
  suffix?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  color?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  loading?: boolean
  error?: Error | null
  height?: number
}

/**
 * Stat Panel - displays a single metric value with optional trend
 */
export function StatPanel({
  title,
  description,
  value,
  suffix,
  trend,
  trendValue,
  color = 'default',
  loading,
  error,
  height = 150,
}: StatPanelProps) {
  const colorMap = {
    success: 'var(--pf-v5-global--success-color--100)',
    warning: 'var(--pf-v5-global--warning-color--100)',
    danger: 'var(--pf-v5-global--danger-color--100)',
    info: 'var(--pf-v5-global--info-color--100)',
    default: 'var(--pf-v5-global--Color--100)',
  }

  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : MinusIcon
  const trendColor =
    trend === 'up' ? 'var(--pf-v5-global--success-color--100)' : trend === 'down' ? 'var(--pf-v5-global--danger-color--100)' : 'var(--pf-v5-global--Color--200)'

  return (
    <DashboardPanel title={title} description={description} loading={loading} error={error} height={height}>
      <Bullseye>
        <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: colorMap[color] }}>
              {value}
              {suffix && <span style={{ fontSize: '1.5rem', marginLeft: '4px' }}>{suffix}</span>}
            </span>
          </FlexItem>
          {trend && trendValue && (
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <TrendIcon color={trendColor} />
                </FlexItem>
                <FlexItem>
                  <Text component={TextVariants.small} style={{ color: trendColor }}>
                    {trendValue}
                  </Text>
                </FlexItem>
              </Flex>
            </FlexItem>
          )}
        </Flex>
      </Bullseye>
    </DashboardPanel>
  )
}

export interface StatusBreakdownItem {
  label: string
  value: number
  color: 'success' | 'warning' | 'danger' | 'info' | 'default'
}

export interface StatusBreakdownPanelProps {
  title: string
  description?: string
  items: StatusBreakdownItem[]
  loading?: boolean
  error?: Error | null
  height?: number
}

/**
 * Status Breakdown Panel - displays multiple status values with colors
 */
export function StatusBreakdownPanel({
  title,
  description,
  items,
  loading,
  error,
  height = 200,
}: StatusBreakdownPanelProps) {
  const colorMap = {
    success: { bg: 'var(--pf-v5-global--success-color--100)', icon: CheckCircleIcon },
    warning: { bg: 'var(--pf-v5-global--warning-color--100)', icon: ExclamationTriangleIcon },
    danger: { bg: 'var(--pf-v5-global--danger-color--100)', icon: ExclamationCircleIcon },
    info: { bg: 'var(--pf-v5-global--info-color--100)', icon: QuestionCircleIcon },
    default: { bg: 'var(--pf-v5-global--Color--200)', icon: QuestionCircleIcon },
  }

  const total = items.reduce((sum, item) => sum + item.value, 0)

  return (
    <DashboardPanel title={title} description={description} loading={loading} error={error} height={height}>
      <Stack hasGutter>
        {items.map((item) => {
          const { icon: Icon, bg } = colorMap[item.color]
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
          return (
            <StackItem key={item.label}>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Icon color={bg} />
                    </FlexItem>
                    <FlexItem>
                      <Text>{item.label}</Text>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <strong>{item.value}</strong>
                    </FlexItem>
                    <FlexItem>
                      <Text component={TextVariants.small} style={{ color: 'var(--pf-v5-global--Color--200)' }}>
                        ({percentage}%)
                      </Text>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </StackItem>
          )
        })}
      </Stack>
    </DashboardPanel>
  )
}

export interface HorizontalBarItem {
  label: string
  value: number
  color?: string
}

export interface HorizontalBarChartPanelProps {
  title: string
  description?: string
  items: HorizontalBarItem[]
  loading?: boolean
  error?: Error | null
  height?: number
}

/**
 * Horizontal Bar Chart Panel - displays data as horizontal bars
 */
export function HorizontalBarChartPanel({
  title,
  description,
  items,
  loading,
  error,
  height = 250,
}: HorizontalBarChartPanelProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1)
  const defaultColors = [
    'var(--pf-v5-chart-color-blue-100)',
    'var(--pf-v5-chart-color-gold-100)',
    'var(--pf-v5-chart-color-green-100)',
    'var(--pf-v5-chart-color-purple-100)',
    'var(--pf-v5-chart-color-cyan-100)',
    'var(--pf-v5-chart-color-orange-100)',
  ]

  return (
    <DashboardPanel title={title} description={description} loading={loading} error={error} height={height}>
      <Stack hasGutter>
        {items.map((item, index) => {
          const percentage = (item.value / maxValue) * 100
          const barColor = item.color || defaultColors[index % defaultColors.length]
          return (
            <StackItem key={item.label}>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                    <FlexItem>
                      <Text component={TextVariants.small}>{item.label}</Text>
                    </FlexItem>
                    <FlexItem>
                      <Text component={TextVariants.small}>
                        <strong>{item.value}</strong>
                      </Text>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </FlexItem>
              </Flex>
            </StackItem>
          )
        })}
      </Stack>
    </DashboardPanel>
  )
}

export interface DonutChartSegment {
  label: string
  value: number
  color: string
}

export interface DonutChartPanelProps {
  title: string
  description?: string
  segments: DonutChartSegment[]
  centerLabel?: string
  centerValue?: string | number
  loading?: boolean
  error?: Error | null
  height?: number
}

/**
 * Donut Chart Panel - displays data as a donut/pie chart
 */
export function DonutChartPanel({
  title,
  description,
  segments,
  centerLabel,
  centerValue,
  loading,
  error,
  height = 250,
}: DonutChartPanelProps) {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0)
  const size = 120
  const strokeWidth = 20
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let currentOffset = 0

  return (
    <DashboardPanel title={title} description={description} loading={loading} error={error} height={height}>
      <Flex justifyContent={{ default: 'justifyContentCenter' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {segments.map((segment) => {
                const percentage = total > 0 ? segment.value / total : 0
                const dashLength = percentage * circumference
                const dashOffset = -currentOffset
                currentOffset += dashLength

                return (
                  <circle
                    key={segment.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  />
                )
              })}
            </svg>
            {(centerLabel || centerValue) && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                {centerValue && (
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{centerValue}</div>
                )}
                {centerLabel && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    {centerLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        </FlexItem>
        <FlexItem>
          <Stack>
            {segments.map((segment) => (
              <StackItem key={segment.label}>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: segment.color,
                        marginRight: 8,
                      }}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Text component={TextVariants.small}>
                      {segment.label}: <strong>{segment.value}</strong>
                    </Text>
                  </FlexItem>
                </Flex>
              </StackItem>
            ))}
          </Stack>
        </FlexItem>
      </Flex>
    </DashboardPanel>
  )
}

export interface TableColumn {
  key: string
  header: string
  width?: number
}

export interface TablePanelProps {
  title: string
  description?: string
  columns: TableColumn[]
  rows: Record<string, unknown>[]
  loading?: boolean
  error?: Error | null
  height?: number
  maxRows?: number
}

/**
 * Table Panel - displays data in a table format
 */
export function TablePanel({
  title,
  description,
  columns,
  rows,
  loading,
  error,
  height = 300,
  maxRows = 10,
}: TablePanelProps) {
  const displayRows = rows.slice(0, maxRows)

  return (
    <DashboardPanel title={title} description={description} loading={loading} error={error} height={height}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--pf-v5-global--BorderColor--100)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--pf-v5-global--Color--200)',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.875rem',
                    }}
                  >
                    {String(row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > maxRows && (
          <Text
            component={TextVariants.small}
            style={{ padding: '8px', color: 'var(--pf-v5-global--Color--200)' }}
          >
            Showing {maxRows} of {rows.length} items
          </Text>
        )}
      </div>
    </DashboardPanel>
  )
}

/**
 * Label List Panel - displays a list of labels/tags
 */
export interface LabelListPanelProps {
  title: string
  description?: string
  labels: { name: string; color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'grey' }[]
  loading?: boolean
  error?: Error | null
  height?: number
}

export function LabelListPanel({
  title,
  description,
  labels,
  loading,
  error,
  height = 150,
}: LabelListPanelProps) {
  return (
    <DashboardPanel title={title} description={description} loading={loading} error={error} height={height}>
      <Flex wrap={{ default: 'wrap' }}>
        {labels.slice(0, 20).map((label, index) => (
          <FlexItem key={index} style={{ margin: 2 }}>
            <Label color={label.color || 'blue'}>{label.name}</Label>
          </FlexItem>
        ))}
        {labels.length > 20 && (
          <FlexItem>
            <Label color="grey">+{labels.length - 20} more</Label>
          </FlexItem>
        )}
      </Flex>
    </DashboardPanel>
  )
}

