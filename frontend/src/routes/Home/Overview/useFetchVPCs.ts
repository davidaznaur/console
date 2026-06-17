import { useQuery } from "@tanstack/react-query"
import { getWizardVPCs } from "../../../lib/wizard-test";
import { useCallback, useRef, useState } from "react";
import { VPCRefetchArgs } from "@redhat-cloud-services/nxtcm-rosa-hcp-wizard/dist/types";


export const useFetchVPCs = (selectedSecret: any) => {
  const [awsAccountId, setAwsAccountId] = useState<string | undefined>();
  const [installerRoleArn, setInstallerRoleArn] = useState<string | undefined>();
  const [region, setRegion] = useState<string | undefined>();
  const secretRef = useRef(selectedSecret);
  secretRef.current = selectedSecret;
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vpcs', awsAccountId, installerRoleArn, region],
    queryFn: async () => {
      const secret = secretRef.current;
      if (!secret || !awsAccountId || !installerRoleArn || !region) return [];
      const response = await getWizardVPCs(secret, {
        aws: { account_id: awsAccountId, sts: { role_arn: installerRoleArn } },
        region: { id: region },
      });

      return response.body;
    },
    enabled: !!selectedSecret && !!awsAccountId && !!installerRoleArn && !!region,
    retry: false,
  });
   const fetch = useCallback(async (args: VPCRefetchArgs): Promise<void> => {
    setAwsAccountId(args.account_id);
    setInstallerRoleArn(args.role_arn);
    setRegion(args.region);
    await refetch();
  }, []);

  return {
    data: data?.items ?? [],
    isLoading,
    error: error ? String(error) : null,
    fetch,
  };
};