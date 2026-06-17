import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../../../components/PluginDataContextProvider';
import { getOpenshiftVersions } from '../../../lib/wizard-test';

export const versionRegEx =
  /(?<major>\d+).(?<minor>\d+).(?<revision>\d+)(?:-(rc|fc).(?<patch>\d+))?/;

export const versionComparator = (v1: string, v2: string): number => {
  const g1 = versionRegEx.exec(v1)?.groups;
  const g2 = versionRegEx.exec(v2)?.groups;
  if (g1 && g2) {
    if (g1.major !== g2.major) {
      return parseInt(g1.major, 10) > parseInt(g2.major, 10) ? 1 : -1;
    }
    if (g1.minor !== g2.minor) {
      return parseInt(g1.minor, 10) > parseInt(g2.minor, 10) ? 1 : -1;
    }
    if (g1.revision !== g2.revision) {
      return parseInt(g1.revision, 10) > parseInt(g2.revision, 10) ? 1 : -1;
    }
    if (g1.patch !== g2.patch) {
      // e.g. 4.6.0 is later than 4.6.0-rc.4
      if (g1.patch === undefined) {
        return 1;
      }
      if (g2.patch === undefined) {
        return -1;
      }
      return parseInt(g1.patch, 10) > parseInt(g2.patch, 10) ? 1 : -1;
    }
  }
  return 0;
};

interface DropdownType {
  label: string;
  value: string;
}

export interface OpenShiftVersionsData {
  default?: DropdownType;
  latest?: DropdownType;
  releases: DropdownType[];
}

// export interface VersionsResource {
//   data: OpenShiftVersionsData;
//   error: any;
//   isLoading: boolean;
//   fetch: () => Promise<void>;
// }

const filterAndSortHCPVersions = (versions: any[]): any[] => {
  const now = Date.now();

  return versions
    .filter((version) => version)
    .filter(
      (version) =>
        !version.end_of_life_timestamp ||
        new Date(version.end_of_life_timestamp).getTime() > now,
    )
    .filter((version) => version.hosted_control_plane_enabled)
    .filter((version) => version.rosa_enabled)
    .filter((version) => version.channel_group === 'stable')
    .sort((a, b) => versionComparator(b.raw_id!, a.raw_id!));
};

const transformToVersionsData = (versions: any[]): any => {
  const sorted = filterAndSortHCPVersions(versions);

  // Log the first version's keys so we can see what the API actually returns
  if (sorted.length > 0) {
    console.log('Version object keys:', Object.keys(sorted[0]))
    console.log('First version sample:', JSON.stringify(sorted[0], null, 2))
  }

  const defaultVersion = sorted.find(
    (version) => version.hosted_control_plane_default || version.default,
  );
  console.log('Default version found:', defaultVersion)
  const latestVersion = sorted[0];

  const releases: DropdownType[] = sorted.slice(0, 5).map((version) => ({
    label: version.raw_id ?? version.id ?? '',
    value: version.raw_id ?? version.id ?? '',
  }));

  return {
    default: defaultVersion
      ? { label: defaultVersion.raw_id ?? '', value: defaultVersion.raw_id ?? '' }
      : undefined,
    latest: latestVersion
      ? { label: latestVersion.raw_id ?? '', value: latestVersion.raw_id ?? '' }
      : undefined,
    releases,
  };
};

export const refetchHCPVersions = (): void => {
  queryClient.invalidateQueries({
    queryKey: ["fetchOpenshiftVersions"],
  });
};

export const useFetchHCPVersions = (secrets: any) => {
    const {client_id, client_secret} = secrets;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["fetchOpenshiftVersions"],
    queryFn: async () => {
      const response = await getOpenshiftVersions(client_id, client_secret);
      return response.items ?? [];
    },
    select: transformToVersionsData,
  });


console.log("DATA IN QUERY", data)
  return {
    data,
    error,
    isLoading,
    refetch,
  };
};
