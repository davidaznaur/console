/**
 * Perses Chart Components
 * These components use the @perses-dev/components library (ECharts)
 */

import { useMemo } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Spinner } from '@patternfly/react-core'
import { EChart, ChartsProvider, testChartsTheme } from '@perses-dev/components'
import type { EChartsOption } from 'echarts'

// Re-export ChartsProvider for use in the dashboard
export { ChartsProvider, testChartsTheme }

/**
 * Perses Bar Chart Component
 */
export interface PersesBarChartProps {
  title: string
  data: { label: string; value: number; color?: string }[]
  loading?: boolean
  height?: number
}

export function PersesBarChart({ title, data, loading, height = 250 }: PersesBarChartProps) {
  const defaultColors = ['#0066CC', '#4CB140', '#F0AB00', '#C9190B', '#6753AC', '#009596']

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.label),
        axisLabel: {
          rotate: 30,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          type: 'bar',
          data: data.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: d.color || defaultColors[i % defaultColors.length],
            },
          })),
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }),
    [data]
  )

  return (
    <Card isCompact style={{ height: '100%' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 60 }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <EChart option={option} style={{ height: height - 60, width: '100%' }} />
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Perses Pie Chart Component
 */
export interface PersesPieChartProps {
  title: string
  data: { label: string; value: number; color: string }[]
  loading?: boolean
  height?: number
}

export function PersesPieChart({ title, data, loading, height = 250 }: PersesPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        formatter: (name: string) => {
          const item = data.find((d) => d.label === name)
          return `${name}: ${item?.value || 0}`
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'center',
            formatter: () => `${total}`,
            fontSize: 24,
            fontWeight: 'bold',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 28,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.map((d) => ({
            value: d.value,
            name: d.label,
            itemStyle: {
              color: d.color,
            },
          })),
        },
      ],
    }),
    [data, total]
  )

  return (
    <Card isCompact style={{ height: '100%' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 60 }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <EChart option={option} style={{ height: height - 60, width: '100%' }} />
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Perses Stat Chart Component
 */
export interface PersesStatChartProps {
  title: string
  value: number | string
  color?: string
  loading?: boolean
  trend?: number[] // Optional trend data for sparkline
}

export function PersesStatChart({ title, value, color, loading, trend }: PersesStatChartProps) {
  const option: EChartsOption | null = useMemo(() => {
    if (!trend || trend.length === 0) return null
    return {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        show: false,
        data: trend.map((_, i) => i),
      },
      yAxis: {
        type: 'value',
        show: false,
      },
      series: [
        {
          type: 'line',
          data: trend,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
            color: color || '#0066CC',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: (color || '#0066CC') + '40' },
                { offset: 1, color: (color || '#0066CC') + '10' },
              ],
            },
          },
        },
      ],
    }
  }, [trend, color])

  return (
    <Card isCompact style={{ height: '120px' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody style={{ position: 'relative', padding: '8px 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: color || 'var(--pf-v5-global--primary-color--100)',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {value}
            </div>
            {option && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', opacity: 0.5 }}>
                <EChart option={option} style={{ height: '40px', width: '100%' }} />
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Perses Horizontal Bar Chart Component
 */
export interface PersesHorizontalBarChartProps {
  title: string
  data: { label: string; value: number; color?: string }[]
  loading?: boolean
  height?: number
}

export function PersesHorizontalBarChart({ title, data, loading, height = 250 }: PersesHorizontalBarChartProps) {
  const defaultColors = ['#0066CC', '#4CB140', '#F0AB00', '#C9190B', '#6753AC', '#009596']

  const option: EChartsOption = useMemo(
    () => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.label).reverse(),
        axisLabel: {
          fontSize: 11,
        },
      },
      series: [
        {
          type: 'bar',
          data: data
            .map((d, i) => ({
              value: d.value,
              itemStyle: {
                color: d.color || defaultColors[i % defaultColors.length],
              },
            }))
            .reverse(),
          barWidth: '60%',
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
          },
        },
      ],
    }),
    [data]
  )

  return (
    <Card isCompact style={{ height: '100%' }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 60 }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <EChart option={option} style={{ height: height - 60, width: '100%' }} />
        )}
      </CardBody>
    </Card>
  )
}
