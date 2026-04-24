/* Copyright Contributors to the Open Cluster Management project */
import { CheckIcon, ExternalLinkAltIcon } from '@patternfly/react-icons'
import {
  CatalogCardItemType,
  CatalogColor,
  DataViewStringContext,
  ICatalogCard,
  ItemView,
} from '@stolostron/react-data-view'
import { useRecoilValue, useSharedAtoms, useSetRecoilState } from '../../../../../shared-recoil';
import { selectedServiceAccountState } from './rosaHCPAtom'
import { useNavigate } from 'react-router-dom-v5-compat'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from '../../../../../lib/acm-i18next'
import { useDataViewStrings } from '../../../../../lib/dataViewStrings'
import { DOC_LINKS } from '../../../../../lib/doc-util'
import {WizSelect} from '@patternfly-labs/react-form-wizard'
import { NavigationPath, useBackCancelNavigation } from '../../../../../NavigationPath'
import { AcmPage, AcmPageHeader, Provider } from '../../../../../ui-components'
import { getTypedCreateClusterPath } from '../ClusterInfrastructureType'
import { useIsHypershiftEnabled } from '../../../../../hooks/use-hypershift-enabled'
import { HypershiftDiagramExpand } from './common/HypershiftDiagramExpand'
import { Button, Icon,Stack, StackItem, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core'
import { Secret } from '../../../../../resources';

export function CreateAWSControlPlane() {
  const [t] = useTranslation()
  const navigate = useNavigate()
  const { nextStep, back, cancel } = useBackCancelNavigation()
  const [isDiagramExpanded, setIsDiagramExpanded] = useState(true)
  const [isMouseOverControlPlaneLink, setIsMouseOverControlPlaneLink] = useState(false)
  const [isHypershiftEnabled, loaded] = useIsHypershiftEnabled()

  const { secretsState } = useSharedAtoms()
        const secrets = useRecoilValue(secretsState)
        const credentialsSecrets = useMemo(
          () =>
            secrets.filter(
              (secret) => secret?.metadata?.labels?.['cluster.open-cluster-management.io/credentials'] !== undefined && secret.metadata.labels?.['cluster.open-cluster-management.io/type'] === 'rhocm'
            ),
          [secrets]
        )

  const [selectedSecret, setSelectedSecret] = React.useState<any>();

  const onDiagramToggle = (isExpanded: boolean) => {
    if (!isMouseOverControlPlaneLink) {
      setIsDiagramExpanded(isExpanded)
    }
  }
  const cards = useMemo(() => {
    const newCards: ICatalogCard[] = [
      {
        id: 'hosted',
        title: t('Hosted'),
        items: [
          {
            type: CatalogCardItemType.Description,
            description: t(
              'Run an OpenShift cluster where the control plane is decoupled from the data plane, and is treated like a multi-tenant workload on a hosting service cluster. The data plane is on a separate network domain that allows segmentation between management and workload traffic.'
            ),
          },
          {
            type: CatalogCardItemType.List,
            title: t(''),
            icon: (
              <Icon status="success">
                <CheckIcon />
              </Icon>
            ),
            items: [
              {
                text: t('Reduces costs by efficiently reusing an OpenShift cluster to host multiple control planes.'),
              },
              { text: t('Quickly provisions clusters.') },
            ],
          },
        ],
        onClick: !isHypershiftEnabled ? () => setIsModalOpen(true) : undefined,
        alertTitle: (() => {
          if (!loaded || isHypershiftEnabled) return undefined
          return t('Hosted control plane operator must be enabled in order to continue')
        })(),
        alertVariant: 'info',
        alertContent: (() => {
          if (!loaded || isHypershiftEnabled) return undefined
          return (
            <a href={DOC_LINKS.HOSTED_ENABLE_FEATURE_AWS} target="_blank" rel="noopener noreferrer">
              {t('View documentation')} <ExternalLinkAltIcon />
            </a>
          )
        })(),
        badgeList: [
          {
            badge: t('CLI-based'),
            badgeColor: CatalogColor.purple,
          },
        ],
      },
      {
        id: 'standalone',
        title: t('Standalone'),
        items: [
          {
            type: CatalogCardItemType.Description,
            description: t(
              'Run an OpenShift cluster where the control plane and data plane are coupled. The control plane is hosted by a dedicated group of physical or virtual nodes and the network stack is shared.'
            ),
          },
          {
            type: CatalogCardItemType.List,
            title: t(''),
            icon: (
              <Icon status="success">
                <CheckIcon />
              </Icon>
            ),
            items: [
              {
                text: t('Increases resiliency with closely interconnected control plane and worker nodes.'),
              },
              {
                text: t('Provide customized control plane cluster configuration.'),
                subTitles: [t('Standard'), t('Single node OpenShift'), t('Three-node cluster')],
              },
            ],
          },
        ],
        onClick: nextStep(getTypedCreateClusterPath(Provider.aws)),
      },
    ]
    return newCards
  }, [nextStep, t, isHypershiftEnabled, loaded])

  const keyFn = useCallback((card: ICatalogCard) => card.id, [])

  const breadcrumbs = useMemo(() => {
    const newBreadcrumbs = [
      { text: t('Clusters'), to: NavigationPath.clusters },
      { text: t('Infrastructure'), to: NavigationPath.createCluster },
      { text: t('Control plane type - {{hcType}}', { hcType: 'AWS' }) },
    ]
    return newBreadcrumbs
  }, [t])

  const dataViewStrings = useDataViewStrings()

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
   //nextStep(NavigationPath.createROSAHCP)

  const close = () => {
    setIsModalOpen(false)
  }

  const setSelectedServiceAccount = useSetRecoilState(selectedServiceAccountState)


        console.log("************credentialsSecrets**************", credentialsSecrets)

  return (
    <AcmPage
      header={
        <AcmPageHeader
          title={t('Control plane type - {{hcType}}', { hcType: 'AWS' })}
          description={t('Choose a control plane type for your cluster.')}
          breadcrumb={breadcrumbs}
        />
      }
    >
      <DataViewStringContext.Provider value={dataViewStrings}>
        <ItemView
          items={cards}
          itemKeyFn={keyFn}
          itemToCardFn={(card) => card}
          onBack={back(NavigationPath.createCluster)}
          onCancel={cancel(NavigationPath.clusters)}
          customCatalogSection={
            <HypershiftDiagramExpand
              isDiagramExpanded={isDiagramExpanded}
              onDiagramToggle={onDiagramToggle}
              setIsMouseOverControlPlaneLink={setIsMouseOverControlPlaneLink}
              t={t}
            />
          }
        />
      </DataViewStringContext.Provider>

      <Modal isOpen={isModalOpen} style={{width: '50%'}}>
        <ModalHeader>Select service account</ModalHeader>
        <ModalBody>
   
   <Stack hasGutter>
    <StackItem>TEST</StackItem>
    <StackItem>
<WizSelect label="Select service account" path="cluster.service_account"

                      options={credentialsSecrets.map((secret) => {
                        console.log("SECRET", secret)
                        return ({
                          label: secret.metadata.name ?? '',
                          value: secret.metadata.name
                      })})}
                      isCreatable
                      onValueChange={(item) => {
                        console.log("ITEM", item)
                          const filteredServiceAccount = credentialsSecrets.filter((secret) => secret.metadata.name === item)
                          setSelectedSecret(filteredServiceAccount)
                          setSelectedServiceAccount(filteredServiceAccount[0] as unknown as Secret)
                      }}
                      />
    </StackItem>
    <StackItem>TEST</StackItem>
   </Stack>
          
        </ModalBody>
        <ModalFooter>
          <Button onClick={nextStep(NavigationPath.createROSAHCP)}>Next</Button>
          <Button onClick={close}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </AcmPage>
  )
}
