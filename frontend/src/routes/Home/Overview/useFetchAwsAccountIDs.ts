import { useQuery } from "@tanstack/react-query"
import { getWizardAWSAccountIds } from "../../../lib/wizard-test";
import { useMemo } from "react";
import { queryClient } from "../../../components/PluginDataContextProvider";

const extractAWSID = (arn: string): string => {
  // Ex: arn = 'arn:aws:iam::268733382466:role/ManagedOpenShift-OCM-Role-15212158'
  // '268733382466' above ^^ is an example AWS account ID
  const arnSegment = arn.substr(arn.indexOf('::') + 2);
  return arnSegment.substr(0, arnSegment.indexOf(':'));
};

const getAWSIDsFromARNs = (arns: any) => {
  const ids = arns.map(extractAWSID);
  return [...new Set(ids)]; // convert to Set to remove duplicates, spread to convert back to array
};

export const invalidateAWSAccountIDs = () => {
  queryClient.invalidateQueries({
    queryKey: ['aws-account-ids-fetch'],
  })
}

type DropdownType = {
  label: string;
  value: string;
}


export const useFetchAwsAccountIDs = (selectedSecret: any) => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['aws-account-ids-fetch'],
    queryFn: async () => {
      const response = await getWizardAWSAccountIds(selectedSecret.client_id, selectedSecret.client_secret);


      return response;
    },
    enabled: !!selectedSecret,
  })
  const awsAccountIDs = useMemo(() => {
    if (!data?.items) return [];
    const stsOCMRoleLabel = data.items.filter(
      (label: any) => label.key === 'sts_ocm_role'
    );
    const stsOCMRoleValue = stsOCMRoleLabel[0]?.value ?? '';
    const arns = stsOCMRoleValue === '' ? [] : stsOCMRoleValue.split(',');
    return getAWSIDsFromARNs(arns);
  }, [data]);
  console.log("******** SAVA smalldata2", data)

  return {
    data: awsAccountIDs as DropdownType[],
    isLoading,
    isError,
    error,
    refetch
  }
}