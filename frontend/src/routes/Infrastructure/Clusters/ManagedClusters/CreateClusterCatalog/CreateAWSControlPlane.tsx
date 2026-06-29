/* Copyright Contributors to the Open Cluster Management project */
import { CheckIcon, ExternalLinkAltIcon, HelpIcon, OutlinedQuestionCircleIcon, PlusCircleIcon } from '@patternfly/react-icons'
import {
  CatalogCardItemType,
  CatalogColor,
  DataViewStringContext,
  ICatalogCard,
  ItemView,
} from '@stolostron/react-data-view'
import { useRecoilValue, useSharedAtoms } from '../../../../../shared-recoil';
import { Link, useLocation, useNavigate } from 'react-router-dom-v5-compat'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from '../../../../../lib/acm-i18next'
import { useDataViewStrings } from '../../../../../lib/dataViewStrings'
import { DOC_LINKS } from '../../../../../lib/doc-util'
import { NavigationPath, useBackCancelNavigation } from '../../../../../NavigationPath'
import { AcmPage, AcmPageHeader, Provider } from '../../../../../ui-components'
import { getTypedCreateClusterPath } from '../ClusterInfrastructureType'
import { useIsHypershiftEnabled } from '../../../../../hooks/use-hypershift-enabled'
import { HypershiftDiagramExpand } from './common/HypershiftDiagramExpand'
import { Button, Icon, Stack, Modal, ModalBody, ModalFooter, ModalHeader, SelectOption, StackItem, Title, Content, ContentVariants, EmptyState, EmptyStateBody, EmptyStateFooter, FlexItem, Flex, Popover, FormGroup, FormHelperText, HelperText, HelperTextItem, Card, CardTitle, CardBody, List, ListItem, CardFooter } from '@patternfly/react-core'
import CreateROSAHCPButton from '../CreateCluster/RosaHcpWizard/CreateROSAHcpButton/CreateROSAHCPButton';
import useNoAvailableHostsAlert from '../../../../../hooks/use-available-hosts-alert';
import { AcmSelectBase } from '../../../../../components/AcmSelectBase';
import { getTypedCreateCredentialsPath } from '../../../../Credentials/CreateCredentialsCatalog';


const CreateButtonLink = (props: any) => <Link {...props} to={NavigationPath.prerequisites} />;
export function CreateAWSControlPlane() {
  const [t] = useTranslation()
  const navigate = useNavigate()
  const { nextStep, back, cancel } = useBackCancelNavigation()
  const [isDiagramExpanded, setIsDiagramExpanded] = useState(true)
  const [isMouseOverControlPlaneLink, setIsMouseOverControlPlaneLink] = useState(false)
  const [isHypershiftEnabled, loaded] = useIsHypershiftEnabled()
  //const noAvailableHostsAlert = useNoAvailableHostsAlert('hosted')

  const { secretsState } = useSharedAtoms()
  const secrets = useRecoilValue(secretsState)
  const credentialsSecrets = useMemo(
    () =>
      secrets.filter(
        (secret) => secret?.metadata?.labels?.['cluster.open-cluster-management.io/credentials'] !== undefined && secret.metadata.labels?.['cluster.open-cluster-management.io/type'] === 'rhocm'
      ),
    [secrets]
  )

  const [selectedSecret, setSelectedSecret] = React.useState<any>(undefined);

  const onDiagramToggle = (isExpanded: boolean) => {
    if (!isMouseOverControlPlaneLink) {
      setIsDiagramExpanded(isExpanded)
    }
  }

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  //nextStep(NavigationPath.createROSAHCP)

  const close = () => {
    setSelectedSecret(undefined)
    setIsModalOpen(false)

  }

  const withCliClick = nextStep((NavigationPath.createAWSCLI))

  const HostedCard = () => {
    return(
      <Flex direction={{default: 'row'}} alignItems={{ default: 'alignItemsStretch' }}>
        <FlexItem flex={{ default: 'flex_1' }}>
      <Card isFullHeight>
        <CardTitle>
        <Content component={ContentVariants.h4}>ROSA</Content>
        <Content component={ContentVariants.p}>Managed by Red Hat</Content>
        </CardTitle>
        <CardBody>
          <Stack hasGutter>
            <StackItem>
    <List>
            <ListItem>
              Red Hat SRE managed
            </ListItem>
            <ListItem>
              Zero-cost control plane infra
            </ListItem>
            <ListItem>
              Full compliance certifications
            </ListItem>
          </List>
            </StackItem>

            <StackItem>
              <Stack hasGutter>
                <StackItem>
 <Button variant='primary' onClick={() => setIsModalOpen(true)}>
            Deploy with web interface
          </Button>
                </StackItem>

                <StackItem>
   <Button
                    variant="link"
                    className="create-button"
                    component={CreateButtonLink}
                  >
                    View ROSA prerequisites
                  </Button>
                </StackItem>
              </Stack>
  
               
            </StackItem>
          </Stack>
      
       
{/* <CreateROSAHCPButton onCliClick={withCliClick} onInterfaceClick={setIsModalOpen} /> */}
        </CardBody>
      </Card>
        </FlexItem>
      
      <FlexItem flex={{ default: 'flex_1' }}>
              <Card isFullHeight>
        <CardTitle>
      <Content component={ContentVariants.h4}>AWS (self managed)</Content>
       <Content component={ContentVariants.p}>Managed by you</Content>
        </CardTitle>
        <CardBody>
        <Stack hasGutter>
          <StackItem>
            <List>
              <ListItem>
        Efficiently reuse existing OpenShift clusters to host multiple control planes
              </ListItem>
              <ListItem>
                Fully self-managed control
              </ListItem>
            </List>
          </StackItem>
        </Stack>
        </CardBody>
        <CardFooter>
          <Button variant='primary' onClick={() => withCliClick()}>Deploy with CLI</Button>
        </CardFooter>
      </Card>
      </FlexItem>


      </Flex>
    )
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
          {
            type: CatalogCardItemType.Description,
            description: (
              <HostedCard />
            ) as unknown as string,
          },
        ],
        onClick: () => { },
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



  //const setSelectedServiceAccount = useSetRecoilState(selectedServiceAccountState)

  const { state } = useLocation()
  const handleNext = useCallback(() => {
    if (!selectedSecret?.length) return

    console.log("SELECTED SECRET", selectedSecret)
    navigate(NavigationPath.createROSAHCP, {
      state: {
        ...state,
        selectedSecretName: selectedSecret[0]?.metadata?.name,
        maxBackSteps: state?.maxBackSteps ? state.maxBackSteps + 1 : 1,
        cancelSteps: state?.cancelSteps ? state.cancelSteps + 1 : 0,
      },
    })
  }, [selectedSecret, navigate])


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

      <Modal isOpen={isModalOpen} onClose={close} variant='small'>
        <ModalHeader>
          <Title headingLevel='h3'>{t('Select service account')}
          </Title>
          <Content component={ContentVariants.p}>{t('To create a ROSA cluster, select a service account credential. This establishes the connection between Advanced Cluster Manager (ACM) and OpenShift Cluster Manager (OCM).')}</Content>
        </ModalHeader>
        <ModalBody>

          <Stack hasGutter>
            <StackItem>
              <FormGroup
                label={t('Service account')}
                isRequired
                fieldId="service-account-select"
                labelHelp={
                  <Popover
                    bodyContent={t('The service account credential used to connect Advanced Cluster Manager (ACM) to OpenShift Cluster Manager (OCM).')}
                  >
                    <Button
                      variant="plain"
                      aria-label={t('More info')}
                      icon={<HelpIcon />}
                      className="pf-v6-c-form__group-label-help"
                    />
                  </Popover>
                }
              >
                <AcmSelectBase
                  id="service-account-select"
                  placeholder={t('Select service account')}
                  selections={selectedSecret?.[0]?.metadata?.name}
                  onSelect={(value: any) => {
                    const filtered = credentialsSecrets.filter((secret) => secret.metadata.name === value)
                    setSelectedSecret(filtered)
                  }}
                  onClear={() => setSelectedSecret(undefined)}
                  width="100%"
                  menuAppendTo={() => document.body}
                  footer={
                    credentialsSecrets.length === 0 ? (
                      <Flex justifyContent={{ default: "justifyContentCenter" }}>
                        <FlexItem>
                          <Button
                            variant="plain"
                            isInline
                            onClick={() => navigate(getTypedCreateCredentialsPath(Provider.redhatcloud))}
                          >
                            {t('Add service account')}
                          </Button>
                        </FlexItem>
                      </Flex>

                    ) : <div style={{ boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.1)' }} >
                      <Button
                        variant="link"
                        isInline
                        icon={<PlusCircleIcon />}
                        style={{ textDecoration: 'none', marginTop: '3%' }}
                        onClick={() => navigate(getTypedCreateCredentialsPath(Provider.redhatcloud))}
                      >
                        {t('Add service account')}
                      </Button>
                    </div>
                  }
                >
                  {credentialsSecrets.length > 0 ? (
                    credentialsSecrets.map((secret) => (
                      <SelectOption key={secret.metadata.name} value={secret.metadata.name}>
                        {secret.metadata.name}
                      </SelectOption>
                    ))
                  ) : (
                    <EmptyState
                      titleText={t('No service accounts found')}
                      variant="xs"
                      icon={PlusCircleIcon}
                    >
                      <EmptyStateBody>
                        {t('To continue, add a service account for OpenShift Cluster Manager.')}
                      </EmptyStateBody>
                    </EmptyState>
                  )}
                </AcmSelectBase>

                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      {t('Missing a service account?')}{' '}
                      <Button
                        variant="link"
                        isInline
                        onClick={() => navigate(getTypedCreateCredentialsPath(Provider.redhatcloud))}
                      >
                        {t('Add one')}
                      </Button>
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            </StackItem>
          </Stack>

        </ModalBody>
        <ModalFooter>
          <Button onClick={handleNext} isDisabled={!selectedSecret}>Continue to ROSA cluster creation</Button>
          <Button variant='secondary' onClick={close}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </AcmPage>
  )
}
