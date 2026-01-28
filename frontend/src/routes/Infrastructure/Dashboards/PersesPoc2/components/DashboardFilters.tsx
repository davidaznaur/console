/**
 * Dashboard Filters Component
 * Provides filtering capabilities for the Perses dashboard using ACM Search API
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  Badge,
} from '@patternfly/react-core'
import { FilterIcon, SearchIcon, TimesIcon } from '@patternfly/react-icons'
import { DashboardFilterState, DashboardFilterOptions, DEFAULT_FILTER_STATE } from '../types'

export interface DashboardFiltersProps {
  filters: DashboardFilterState
  options: DashboardFilterOptions
  onFiltersChange: (filters: DashboardFilterState) => void
  loading?: boolean
}

type FilterSelectType = 'clusters' | 'namespaces' | 'kinds'

export function DashboardFilters({ filters, options, onFiltersChange, loading = false }: DashboardFiltersProps) {
  const [clusterSelectOpen, setClusterSelectOpen] = useState(false)
  const [namespaceSelectOpen, setNamespaceSelectOpen] = useState(false)
  const [kindSelectOpen, setKindSelectOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(filters.searchText)

  // Update search text with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.searchText) {
        onFiltersChange({ ...filters, searchText: searchValue })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, filters, onFiltersChange])

  const handleSelectToggle = (type: FilterSelectType, isOpen: boolean) => {
    switch (type) {
      case 'clusters':
        setClusterSelectOpen(isOpen)
        break
      case 'namespaces':
        setNamespaceSelectOpen(isOpen)
        break
      case 'kinds':
        setKindSelectOpen(isOpen)
        break
    }
  }

  const handleSelect = useCallback(
    (type: FilterSelectType, value: string) => {
      const currentValues = filters[type]
      const newValues = currentValues.includes(value) ? currentValues.filter((v) => v !== value) : [...currentValues, value]
      onFiltersChange({ ...filters, [type]: newValues })
    },
    [filters, onFiltersChange]
  )

  const handleClearFilter = useCallback(
    (type: FilterSelectType, value?: string) => {
      if (value) {
        onFiltersChange({
          ...filters,
          [type]: filters[type].filter((v) => v !== value),
        })
      } else {
        onFiltersChange({ ...filters, [type]: [] })
      }
    },
    [filters, onFiltersChange]
  )

  const handleClearAllFilters = useCallback(() => {
    setSearchValue('')
    onFiltersChange(DEFAULT_FILTER_STATE)
  }, [onFiltersChange])

  const hasActiveFilters =
    filters.clusters.length > 0 || filters.namespaces.length > 0 || filters.kinds.length > 0 || filters.searchText !== ''

  const activeFilterCount =
    filters.clusters.length + filters.namespaces.length + filters.kinds.length + (filters.searchText ? 1 : 0)

  const renderSelectToggle = (type: FilterSelectType, label: string, isOpen: boolean, selectedCount: number) => (
    <MenuToggle onClick={() => handleSelectToggle(type, !isOpen)} isExpanded={isOpen} isDisabled={loading} style={{ minWidth: '150px' }}>
      {label}
      {selectedCount > 0 && (
        <Badge isRead style={{ marginLeft: '8px' }}>
          {selectedCount}
        </Badge>
      )}
    </MenuToggle>
  )

  return (
    <div
      style={{
        backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
        padding: '12px 16px',
        borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
      }}
    >
      <Toolbar clearAllFilters={handleClearAllFilters}>
        <ToolbarContent>
          <ToolbarGroup variant="filter-group">
            <ToolbarItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <FilterIcon style={{ color: 'var(--pf-v5-global--Color--200)' }} />
                </FlexItem>
                <FlexItem>
                  <span style={{ fontWeight: 500, color: 'var(--pf-v5-global--Color--200)' }}>Filters</span>
                </FlexItem>
              </Flex>
            </ToolbarItem>

            {/* Cluster Select */}
            <ToolbarItem>
              <Select
                isOpen={clusterSelectOpen}
                onOpenChange={(isOpen) => setClusterSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setClusterSelectOpen(!clusterSelectOpen)}
                    isExpanded={clusterSelectOpen}
                    isDisabled={loading}
                    style={{ minWidth: '150px' }}
                  >
                    Cluster
                    {filters.clusters.length > 0 && (
                      <Badge isRead style={{ marginLeft: '8px' }}>
                        {filters.clusters.length}
                      </Badge>
                    )}
                  </MenuToggle>
                )}
                onSelect={(_, value) => handleSelect('clusters', value as string)}
              >
                <SelectList>
                  {options.availableClusters.length === 0 ? (
                    <SelectOption isDisabled>No clusters available</SelectOption>
                  ) : (
                    options.availableClusters.map((cluster) => (
                      <SelectOption key={cluster} value={cluster} hasCheckbox isSelected={filters.clusters.includes(cluster)}>
                        {cluster}
                      </SelectOption>
                    ))
                  )}
                </SelectList>
              </Select>
            </ToolbarItem>

            {/* Namespace Select */}
            <ToolbarItem>
              <Select
                isOpen={namespaceSelectOpen}
                onOpenChange={(isOpen) => setNamespaceSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setNamespaceSelectOpen(!namespaceSelectOpen)}
                    isExpanded={namespaceSelectOpen}
                    isDisabled={loading}
                    style={{ minWidth: '150px' }}
                  >
                    Namespace
                    {filters.namespaces.length > 0 && (
                      <Badge isRead style={{ marginLeft: '8px' }}>
                        {filters.namespaces.length}
                      </Badge>
                    )}
                  </MenuToggle>
                )}
                onSelect={(_, value) => handleSelect('namespaces', value as string)}
              >
                <SelectList>
                  {options.availableNamespaces.length === 0 ? (
                    <SelectOption isDisabled>No namespaces available</SelectOption>
                  ) : (
                    options.availableNamespaces.slice(0, 50).map((ns) => (
                      <SelectOption key={ns} value={ns} hasCheckbox isSelected={filters.namespaces.includes(ns)}>
                        {ns}
                      </SelectOption>
                    ))
                  )}
                </SelectList>
              </Select>
            </ToolbarItem>

            {/* Kind Select */}
            <ToolbarItem>
              <Select
                isOpen={kindSelectOpen}
                onOpenChange={(isOpen) => setKindSelectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setKindSelectOpen(!kindSelectOpen)}
                    isExpanded={kindSelectOpen}
                    isDisabled={loading}
                    style={{ minWidth: '150px' }}
                  >
                    Kind
                    {filters.kinds.length > 0 && (
                      <Badge isRead style={{ marginLeft: '8px' }}>
                        {filters.kinds.length}
                      </Badge>
                    )}
                  </MenuToggle>
                )}
                onSelect={(_, value) => handleSelect('kinds', value as string)}
              >
                <SelectList>
                  {options.availableKinds.map((kind) => (
                    <SelectOption key={kind} value={kind} hasCheckbox isSelected={filters.kinds.includes(kind)}>
                      {kind}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </ToolbarItem>
          </ToolbarGroup>

          {/* Search Input */}
          <ToolbarItem variant="search-filter" style={{ flexGrow: 1, maxWidth: '400px' }}>
            <TextInputGroup>
              <TextInputGroupMain
                icon={<SearchIcon />}
                value={searchValue}
                onChange={(_, value) => setSearchValue(value)}
                placeholder="Search resources by name..."
                aria-label="Search resources"
              />
              {searchValue && (
                <TextInputGroupUtilities>
                  <Button
                    variant="plain"
                    onClick={() => {
                      setSearchValue('')
                      onFiltersChange({ ...filters, searchText: '' })
                    }}
                    aria-label="Clear search"
                  >
                    <TimesIcon />
                  </Button>
                </TextInputGroupUtilities>
              )}
            </TextInputGroup>
          </ToolbarItem>

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <ToolbarItem>
              <Button variant="link" onClick={handleClearAllFilters}>
                Clear all filters ({activeFilterCount})
              </Button>
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div style={{ paddingTop: '8px' }}>
          <Flex gap={{ default: 'gapMd' }} wrap={{ default: 'wrap' }}>
            {filters.clusters.length > 0 && (
              <FlexItem>
                <ChipGroup categoryName="Cluster" isClosable onClick={() => handleClearFilter('clusters')}>
                  {filters.clusters.map((cluster) => (
                    <Chip key={cluster} onClick={() => handleClearFilter('clusters', cluster)}>
                      {cluster}
                    </Chip>
                  ))}
                </ChipGroup>
              </FlexItem>
            )}
            {filters.namespaces.length > 0 && (
              <FlexItem>
                <ChipGroup categoryName="Namespace" isClosable onClick={() => handleClearFilter('namespaces')}>
                  {filters.namespaces.map((ns) => (
                    <Chip key={ns} onClick={() => handleClearFilter('namespaces', ns)}>
                      {ns}
                    </Chip>
                  ))}
                </ChipGroup>
              </FlexItem>
            )}
            {filters.kinds.length > 0 && (
              <FlexItem>
                <ChipGroup categoryName="Kind" isClosable onClick={() => handleClearFilter('kinds')}>
                  {filters.kinds.map((kind) => (
                    <Chip key={kind} onClick={() => handleClearFilter('kinds', kind)}>
                      {kind}
                    </Chip>
                  ))}
                </ChipGroup>
              </FlexItem>
            )}
            {filters.searchText && (
              <FlexItem>
                <ChipGroup categoryName="Search">
                  <Chip onClick={() => onFiltersChange({ ...filters, searchText: '' })}>{filters.searchText}</Chip>
                </ChipGroup>
              </FlexItem>
            )}
          </Flex>
        </div>
      )}
    </div>
  )
}

export default DashboardFilters
