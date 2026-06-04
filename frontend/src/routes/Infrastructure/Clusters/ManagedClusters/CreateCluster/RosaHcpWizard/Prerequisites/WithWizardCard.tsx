import { Alert, Card, CardBody, CardFooter, CardTitle, Content, ContentVariants, Stack, StackItem, Title } from "@patternfly/react-core";
import { DesktopIcon } from "@patternfly/react-icons";
import { useCallback } from "react"
import { Link } from "react-router-dom-v5-compat"
import { useTranslation } from "../../../../../../../lib/acm-i18next";

type WithWizardCardProps = {
    selectedSecretName: string | undefined
}

export const WithWizardCard = (props: WithWizardCardProps) => {
    const [t] = useTranslation();
    const {selectedSecretName} = props;

    const WizardNavLink = useCallback(
        (props: any) => <Link {...props} to='/multicloud/infrastructure/clusters/create/aws/hcp' state={{ selectedSecretName }}>{t('Create with web interface')}</Link>,
        [selectedSecretName]
    );

    return (
        <Card isFullHeight>
            <CardTitle>
                <Title headingLevel="h3" size="lg">
                    <Stack>
                        <StackItem>
                            <DesktopIcon className="ocm-c-wizard-get-started--card-icon"/>
                        </StackItem>
                        <StackItem>
                            {t('Deploy with web interface')}
                        </StackItem>
                    </Stack>


                </Title>
            </CardTitle>

            <CardBody>
                <Content component={ContentVariants.p} className="pf-v6-u-mb-sm">
                    {t('You can deploy your cluster with the web interface.')}
                </Content>
                <Alert variant="info"
                    isInline isPlain title={t('Your AWS account will need to be associated with your Red Hat account.')} />
            </CardBody>

            <CardFooter>
                <WizardNavLink />
            </CardFooter>
        </Card>
    )
}