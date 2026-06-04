

import { useMemo, useState } from 'react';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

import { AcmPage, AcmPageHeader } from '../../../../../../../ui-components';
import { useTranslation } from '../../../../../../../lib/acm-i18next';
import { NavigationPath } from '../../../../../../../NavigationPath';
import { DOC_LINKS } from '../../../../../../../lib/doc-util';
import Instructions from './Instructions';
import Instruction from './Instruction';
import StepDownloadROSACli from './StepsToDownloadROSACli';
import { ServiceAccountSteps } from './ServiceAccountSteps';
import { StepCreateAWSAccountRoles } from './StepCreateAWSAccountRoles';
import { StepCreateNetwork } from './StepCreateNetwork';
import { WithCLICard } from './WithCLICard';
import { WithWizardCard } from './WithWizardCard';
import { WithTerraFormCard } from './WithTerraformCard';
import './Prerequisites.css';

export const productName = 'Red Hat OpenShift Service on AWS';

export const PrerequisitesPage = () => {
  const [t] = useTranslation();
  const breadcrumbs = useMemo(() => {
    const newBreadcrumbs = [
      { text: t('Clusters'), to: NavigationPath.clusters },
      { text: t('Infrastructure'), to: NavigationPath.createCluster },
      { text: t('Control plane type - {{hcType}}', { hcType: 'AWS' }), to: NavigationPath.createAWSControlPlane },
      { text: t('Prerequisites') },
    ]
    return newBreadcrumbs
  }, [t])

  const [selectedSecretName, setSelectedSecretName] = useState<string | undefined>()


  return (
    <AcmPage
      header={
        <AcmPageHeader
          title={t('Red Hat OpenShift Service on AWS', { hcType: 'AWS' })}
          description={
            <Stack>
              <StackItem>
                {t("Deploy fully operational and managed Red Hat OpenShift clusters while leveraging the full breadth and depth of AWS using ROSA.")}
              </StackItem>
              <StackItem>
                <Flex>
                  <FlexItem>
                    <a
                      href={DOC_LINKS.WHAT_IS_ROSA}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'block', marginTop: '4px' }}
                    >
                      {t('Learn more about ROSA')}
                    </a> 
                  </FlexItem>
                  <FlexItem>or</FlexItem>
                  <FlexItem>
                    <a
                      href={DOC_LINKS.ROSA_COMMUNITY_SLACK}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'block', marginTop: '4px' }}
                    >
                      {t('Slack us')}
                    </a>
                  </FlexItem>

                </Flex>
              </StackItem>
            </Stack>

          }
          breadcrumb={breadcrumbs}
        />
      }
    >
       <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>

        {/* ************* Start of RHOCM prerequisites section ************* */}
        <StackItem>
          <ServiceAccountSteps 
              selectedSecretName={selectedSecretName}
              onSecretChange={setSelectedSecretName}
          />
        </StackItem>


        {/* ************ Start of AWS prerequisites section ***************** */}

        <StackItem>
          <Card>
            <CardTitle>
              <Title headingLevel="h2">{t('Complete AWS prerequisites')}</Title>
            </CardTitle>
            <CardBody>
              <Title headingLevel="h3">{t('Have you prepared your AWS account?')}</Title>
              <Content component={ContentVariants.p}>
                {t(`Make sure your AWS account is set up for ROSA deployment. If you've already set it up, you can continue to the ROSA prerequisites.`)}
              </Content>

              <Grid hasGutter span={10}>
                <GridItem span={4}>
                  <Content component="ul">
                    <Content component="li">{t('Enable AWS')}</Content>
                    <Content component="li">{t('Configure Elastic Load Balancer (ELB)')}</Content>
                  </Content>
                </GridItem>

                <GridItem span={6}>
                  <Content component="ul">
                    <Content component="li">
                      {t(`Set up a VPC for ROSA hosted control plane architecture (HCP) clusters
                      (optional for ROSA classic architecture clusters)`)}
                    </Content>
                    <Content component="li">{t('Verify your quotas on AWS console')}</Content>
                  </Content>
                </GridItem>
              </Grid>
              
              <Button component="a"
                href={DOC_LINKS.AWS_CONSOLE_ROSA_HOME_GET_STARTED}
                target="_blank"
                rel="noreferrer"
                
              >
                {t('Open AWS Console')}
              </Button>
              
            </CardBody>
          </Card>
        </StackItem>

          {/* ************ Start of ROSA prerequisites section ***************** */}

                <StackItem>
          <Card>
            <CardBody>
              <Split className="pf-v6-u-mb-lg">
                <SplitItem isFilled>
                  <Title headingLevel="h2">{t('Complete ROSA prerequisites')}</Title>
                </SplitItem>
                <SplitItem>
                  <a
                href={DOC_LINKS.AWS_ROSA_GET_STARTED}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'block', marginTop: '4px' }}
              >
                {t(' More information on ROSA setup')}
              </a>
                </SplitItem>
              </Split>

              <Instructions wide>
                <Instruction simple>
                  <StepDownloadROSACli />
                </Instruction>

                <Instruction simple>
                  <StepCreateAWSAccountRoles />
                </Instruction>

                <Instruction simple>
                  <StepCreateNetwork />
                </Instruction>
              </Instructions>
            </CardBody>
          </Card>
        </StackItem>

        <StackItem>
          <Card>
            <CardHeader>
              <CardTitle>
                <Title headingLevel="h2" size="xl">
                  {t('Deploy the cluster and set up access')}
                </Title>
                <Content component={ContentVariants.p} className="pf-v6-u-font-weight-normal">
                  {t('Select a deployment method')}
                </Content>
              </CardTitle>
            </CardHeader>

            <CardBody>
              <Grid hasGutter>
                <GridItem span={4}>
                  <WithCLICard />
                </GridItem>
                <GridItem span={4}>
                  <WithWizardCard selectedSecretName={selectedSecretName}/>
                </GridItem>
                <GridItem span={4}>
                  <WithTerraFormCard />
                </GridItem>
              </Grid>
            </CardBody>
          </Card>
        </StackItem>

      </Stack>
      </PageSection>
    </AcmPage>
  )
};