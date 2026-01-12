/* Copyright Contributors to the Open Cluster Management project */

/**
 * Perses Dashboard POC - Main Dashboard Page
 * Demonstrates integration of Perses library with ACM Search API
 * 
 * This component uses the actual @perses-dev npm packages:
 * - @perses-dev/core - Core types and utilities
 * - @perses-dev/dashboards - Dashboard components
 * - @perses-dev/plugin-system - Plugin system
 * - @perses-dev/stat-chart-plugin - Stat chart panels
 * - @perses-dev/table-plugin - Table panels
 * - @perses-dev/bar-chart-plugin - Bar chart panels
 * - @perses-dev/pie-chart-plugin - Pie chart panels
 */

import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom-v5-compat'
import { NavigationPath, createRoutePathFunction } from '../../../../NavigationPath';
// Import the Perses-based dashboard view
import { PersesDashboardView } from './perses'

/**
 * Main Perses Dashboard Component
 * This is the entry point for the Perses Dashboard POC
 */
export default function PersesDashboard() {
  return <PersesDashboardView />
}
