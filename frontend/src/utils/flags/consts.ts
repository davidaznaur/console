/* Copyright Contributors to the Open Cluster Management project */
export const FEATURE_FLAGS: { [FeatureFlag: string]: string } = {
  ACM_ACCESS_CONTROL_MANAGEMENT: 'fine-grained-rbac',
}

export const MCE_FEATURE_FLAGS: { [FeatureFlag: string]: string } = {
  MCE_CLUSTER_API: 'cluster-api',
  MCE_CAPA: 'cluster-api-provider-aws',
}
