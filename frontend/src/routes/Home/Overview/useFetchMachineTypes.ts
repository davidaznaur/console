import { useQuery } from "@tanstack/react-query";
import { keyBy } from "lodash";
import { getWizardMachineTypes } from "../../../lib/wizard-test";
import { useCallback, useRef, useState } from "react";

const transformResponse = (items: any[] = []): any => {
  const awsTypes = items.filter((mt) => mt.cloud_provider?.id === 'aws');
  return {
    types: awsTypes,
    typesByID: keyBy(awsTypes, 'id'),
  };
};



export const useFetchHCPMachineTypesByRegion = (
selectedSecret: any
) => {
    const [installerRoleArn, setInstallerRoleArn] = useState<string | undefined>();
      const [region, setRegion] = useState<string | undefined>();
      const [availabilityZones, setAvailabilityZones] = useState<string[]>([]);
      const secretRef = useRef(selectedSecret);
        secretRef.current = selectedSecret;

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: [
      'machine-types',
      installerRoleArn,
      region,
      availabilityZones,
    ],
    queryFn: async () => {
        const secret = secretRef.current;
      if (!secret || !installerRoleArn || !region || (availabilityZones && availabilityZones.length === 0)) return [];
      const response = await getWizardMachineTypes( secret, {
        aws: {sts: {role_arn: installerRoleArn}},
        region: {id: region},
        availability_zones: availabilityZones
      }
      );
      return response.body;
    },
    select: transformResponse,
    enabled: !!installerRoleArn && !!region && !!selectedSecret && availabilityZones.length > 0,
    retry: false,
  });

  const fetch = useCallback(async (args: any): Promise<void> => {
    setAvailabilityZones(args.availability_zones);
    setInstallerRoleArn(args.role_arn);
    setRegion(args.region);
  }, []);

  return {
    data: data ?? { types: [], typesByID: {} },
    isLoading,
    isFetching,
    isError,
    error,
    fetch
  };
};