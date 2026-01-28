/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Panel Renderer
 * 
 * This component renders panels using ECharts (same library as Perses)
 * with Perses-compatible styling and data formats.
 * 
 * Note: We use ECharts directly instead of Perses's Panel component
 * due to react-query version conflicts between Perses and the parent app.
 */

import { useMemo, useEffect, useRef, ReactNode } from 'react'
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material'
import * as echarts from 'echarts'

// Perses core types (these don't have react-query dependencies)
import { 
  PanelDefinition, 
  TimeSeriesData,
  TimeSeries,
  DashboardResource,
} from '@perses-dev/core'

// Custom types
import { ChartDataPoint, ACMSearchResultItem } from './plugins'

// ============================================================================
// Types
// ============================================================================

export interface PanelData {
  /** Single stat value */
  statValue?: number | string
  /** Chart data points for bar/pie charts */
  chartData?: ChartDataPoint[]
  /** Table rows */
  tableRows?: Record<string, unknown>[]
  /** Table columns */
  tableColumns?: { key: string; header: string }[]
  /** Raw items */
  items?: ACMSearchResultItem[]
}

export interface PersesPanelProps {
  /** Panel key from dashboard definition */
  panelKey: string
  /** Panel definition */
  definition: PanelDefinition
  /** Dashboard resource for context */
  dashboard?: DashboardResource
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Data to display in the panel */
  data?: PanelData
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: Error | null
}

// ============================================================================
// Data Transformation Utilities
// ============================================================================

/**
 * Convert chart data points to Perses TimeSeries format
 */
export function chartDataToTimeSeries(
  chartData: ChartDataPoint[],
  panelKind: string
): TimeSeriesData {
  const now = Date.now()
  
  const series: TimeSeries[] = chartData.map((point) => ({
    name: point.label,
    values: [[now, point.value] as [number, number]],
    formattedName: point.label,
  }))

  return {
    timeRange: { start: new Date(now - 3600000), end: new Date(now) },
    stepMs: 3600000,
    series,
  }
}

/**
 * Convert a single stat value to Perses TimeSeries format
 */
export function statValueToTimeSeries(value: number | string): TimeSeriesData {
  const now = Date.now()
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value

  return {
    timeRange: { start: new Date(now - 3600000), end: new Date(now) },
    stepMs: 3600000,
    series: [
      {
        name: 'value',
        values: [[now, numValue] as [number, number]],
        formattedName: 'Value',
      },
    ],
  }
}

/**
 * Convert table data to query data format
 */
export function tableDataToQueryData(
  rows: Record<string, unknown>[],
  columns?: { key: string; header: string }[]
) {
  return { rows, columns }
}

// ============================================================================
// ECharts-based Panel Components (Perses-styled)
// ============================================================================

interface StatPanelProps {
  title: string
  value: number | string
  description?: string
  color?: string
  loading?: boolean
  width?: number
  height?: number
}

/**
 * StatChart Panel using ECharts (same library as Perses)
 */
export function PersesStatChartPanel({
  title,
  value,
  description,
  color = '#0066CC',
  loading,
  width = 200,
  height = 120,
}: StatPanelProps) {
  if (loading) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color,
          fontSize: '2.5rem',
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  )
}

interface BarChartPanelProps {
  title: string
  data: ChartDataPoint[]
  orientation?: 'horizontal' | 'vertical'
  loading?: boolean
  width?: number
  height?: number
}

/**
 * BarChart Panel using ECharts (same library as Perses)
 */
export function PersesBarChartPanel({
  title,
  data,
  orientation = 'vertical',
  loading,
  width = 400,
  height = 300,
}: BarChartPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || loading) return

    // Initialize or get existing chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark')
    }

    const chart = chartInstance.current

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: orientation === 'horizontal' ? '25%' : '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: orientation === 'horizontal'
        ? { type: 'value', splitLine: { lineStyle: { color: '#333' } } }
        : { 
            type: 'category', 
            data: data.map((d) => d.label),
            axisLabel: { 
              rotate: data.length > 5 ? 45 : 0,
              color: '#B0B0B0',
            },
          },
      yAxis: orientation === 'horizontal'
        ? { 
            type: 'category', 
            data: data.map((d) => d.label),
            axisLabel: { color: '#B0B0B0' },
          }
        : { type: 'value', splitLine: { lineStyle: { color: '#333' } } },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.value,
            itemStyle: { color: d.color || '#0066CC' },
          })),
          barWidth: '60%',
        },
      ],
    }

    chart.setOption(option)

    return () => {
      // Don't dispose on every render, just on unmount
    }
  }, [data, orientation, loading])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  return <div ref={chartRef} style={{ width, height }} />
}

interface PieChartPanelProps {
  title: string
  data: ChartDataPoint[]
  loading?: boolean
  width?: number
  height?: number
}

/**
 * PieChart Panel using ECharts (same library as Perses)
 */
export function PersesPieChartPanel({
  title,
  data,
  loading,
  width = 400,
  height = 300,
}: PieChartPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || loading) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark')
    }

    const chart = chartInstance.current
    const total = data.reduce((sum, d) => sum + d.value, 0)

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#B0B0B0' },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#1e1e1e',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => `${total}`,
            fontSize: 24,
            fontWeight: 'bold',
            color: '#E0E0E0',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 28,
              fontWeight: 'bold',
            },
          },
          data: data.map((d) => ({
            name: d.label,
            value: d.value,
            itemStyle: { color: d.color },
          })),
        },
      ],
    }

    chart.setOption(option)
  }, [data, loading])

  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  return <div ref={chartRef} style={{ width, height }} />
}

interface GaugeChartPanelProps {
  title: string
  value: number
  max?: number
  loading?: boolean
  width?: number
  height?: number
  thresholds?: { value: number; color: string }[]
}

/**
 * GaugeChart Panel using ECharts (same library as Perses)
 */
export function PersesGaugeChartPanel({
  title,
  value,
  max = 100,
  loading,
  width = 300,
  height = 250,
  thresholds,
}: GaugeChartPanelProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || loading) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark')
    }

    const chart = chartInstance.current

    // Build color stops from thresholds
    let axisLineColor: [number, string][] = [[1, '#0066CC']]
    if (thresholds && thresholds.length > 0) {
      const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value)
      axisLineColor = sortedThresholds.map((t, i) => {
        const nextValue = sortedThresholds[i + 1]?.value ?? max
        return [nextValue / max, t.color] as [number, string]
      })
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max,
          splitNumber: 5,
          itemStyle: {
            color: thresholds ? axisLineColor[axisLineColor.length - 1][1] : '#0066CC',
          },
          progress: {
            show: true,
            width: 20,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 20,
              color: axisLineColor,
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: true,
            distance: 30,
            color: '#B0B0B0',
            fontSize: 10,
          },
          anchor: {
            show: false,
          },
          title: {
            show: true,
            offsetCenter: [0, '70%'],
            fontSize: 12,
            color: '#B0B0B0',
          },
          detail: {
            valueAnimation: true,
            fontSize: 32,
            fontWeight: 'bold',
            offsetCenter: [0, '0%'],
            formatter: '{value}%',
            color: '#E0E0E0',
          },
          data: [{ value, name: title }],
        },
      ],
    }

    chart.setOption(option)
  }, [value, max, thresholds, title, loading])

  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  return <div ref={chartRef} style={{ width, height }} />
}

interface TablePanelProps {
  title: string
  columns: { key: string; header: string }[]
  rows: Record<string, unknown>[]
  loading?: boolean
  width?: number
  height?: number
}

/**
 * Table Panel with Perses-style dark theme
 */
export function PersesTablePanel({
  title,
  columns,
  rows,
  loading,
  width = 600,
  height = 400,
}: TablePanelProps) {
  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width,
        height,
        overflow: 'auto',
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        },
        '& th': {
          textAlign: 'left',
          padding: '12px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          fontWeight: 600,
          color: 'text.secondary',
          position: 'sticky',
          top: 0,
        },
        '& td': {
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          color: 'text.primary',
        },
        '& tr:hover td': {
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
        },
      }}
    >
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 50).map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.key}>{String(row[col.key] ?? '-')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 50 && (
        <Box sx={{ p: 1, color: 'text.secondary', fontSize: '0.75rem', textAlign: 'center' }}>
          Showing 50 of {rows.length} rows
        </Box>
      )}
    </Box>
  )
}

// ============================================================================
// Generic Panel Wrapper (for future Perses Panel integration)
// ============================================================================

/**
 * Generic panel wrapper that can render different panel types
 * based on the panel definition
 */
export function PersesPanelWithData({
  panelKey,
  definition,
  width = 400,
  height = 300,
  data,
  loading,
  error,
}: PersesPanelProps) {
  const panelKind = definition.spec.plugin.kind

  if (error) {
    return (
      <Paper sx={{ width, height, p: 2 }}>
        <Alert severity="error">{error.message}</Alert>
      </Paper>
    )
  }

  // Route to appropriate panel component based on kind
  switch (panelKind) {
    case 'StatChart':
      return (
        <PersesStatChartPanel
          title={definition.spec.display?.name || panelKey}
          value={data?.statValue ?? 0}
          description={definition.spec.display?.description}
          loading={loading}
          width={width}
          height={height}
        />
      )
    case 'BarChart':
      return (
        <PersesBarChartPanel
          title={definition.spec.display?.name || panelKey}
          data={data?.chartData ?? []}
          loading={loading}
          width={width}
          height={height}
        />
      )
    case 'PieChart':
      return (
        <PersesPieChartPanel
          title={definition.spec.display?.name || panelKey}
          data={data?.chartData ?? []}
          loading={loading}
          width={width}
          height={height}
        />
      )
    case 'GaugeChart':
      return (
        <PersesGaugeChartPanel
          title={definition.spec.display?.name || panelKey}
          value={Number(data?.statValue) || 0}
          loading={loading}
          width={width}
          height={height}
        />
      )
    case 'Table':
      return (
        <PersesTablePanel
          title={definition.spec.display?.name || panelKey}
          columns={data?.tableColumns ?? []}
          rows={data?.tableRows ?? []}
          loading={loading}
          width={width}
          height={height}
        />
      )
    default:
      return (
        <Paper sx={{ width, height, p: 2 }}>
          <Typography color="text.secondary">
            Unsupported panel kind: {panelKind}
          </Typography>
        </Paper>
      )
  }
}

// ============================================================================
// Exports
// ============================================================================

export default PersesPanelWithData
