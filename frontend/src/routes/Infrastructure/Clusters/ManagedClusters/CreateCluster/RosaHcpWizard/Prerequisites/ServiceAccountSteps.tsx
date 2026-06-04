import { Card, CardBody, CardTitle, List, ListComponent, ListItem, OrderType, SelectOption, Stack, StackItem, Title } from "@patternfly/react-core"
import { Link } from "react-router-dom-v5-compat";
import { useTranslation } from "../../../../../../../lib/acm-i18next";
import { DOC_LINKS } from "../../../../../../../lib/doc-util";
import { getTypedCreateCredentialsPath } from "../../../../../../Credentials/CreateCredentialsCatalog";
import { Provider } from "../../../../../../../ui-components";
import { useRhocmSecrets } from "../../../../../../../hooks/useServiceAccount";
import { Dispatch, SetStateAction } from "react";
import { AcmSelectBase, SelectVariant } from "../../../../../../../components/AcmSelectBase";

type ServiceAccountStepProps = {
    selectedSecretName: string | undefined
    onSecretChange: Dispatch<SetStateAction<string | undefined>>
}

export const ServiceAccountSteps = (props: ServiceAccountStepProps) => {
    const [t] = useTranslation();
    const ocmSecret = useRhocmSecrets();

    return (
        <Card>
            <CardTitle>
                <Title headingLevel="h2">{t('RedHat service account prerequisites')}</Title>
            </CardTitle>
            <CardBody>
                <Stack hasGutter>
                    <StackItem>
                        <List component={ListComponent.ol} type={OrderType.number}>
                            <ListItem className="pf-v6-u-mb-lg">
                                {t('To create a ROSA HCP cluster, Red Hat service account is required. Please ')}<a target="_blank"
                                    rel="noreferrer" href={DOC_LINKS.ROSA_SERVICE_ACCOUNT}>{t('create a service account')}</a>
                            </ListItem>
                            <ListItem className="pf-v6-u-mb-lg">
                                {t('After creating a service account please add it to your Advanced Cluser Manager credentials. ')}
                                <Link to={(getTypedCreateCredentialsPath(Provider.redhatcloud))}>{t('Add credentials')}</Link>
                            </ListItem>
                        </List>
                    </StackItem>

                    <StackItem>
                        <Title headingLevel="h6">{t('Please select a service account')}</Title>
                        <AcmSelectBase
                            id="service-account-select"
                            placeholder={t('Select service account')}
                            variant={SelectVariant.typeahead}
                            selections={props.selectedSecretName}
                            onSelect={(value) => props.onSecretChange(value as string)}
                            onClear={() => props.onSecretChange(undefined)}
                            width="40%"
                            style={{ marginTop: '20px' }}
                        >
                            {ocmSecret.map((secret) => (
                                <SelectOption key={secret.metadata.name} value={secret.metadata.name}>
                                    {secret.metadata.name}
                                </SelectOption>
                            ))}
                        </AcmSelectBase>
                    </StackItem>
                </Stack>
            </CardBody>
        </Card>
    )
}