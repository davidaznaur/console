import { Alert, Content, List, ListComponent, ListItem, OrderType, Title } from "@patternfly/react-core"
import { useTranslation } from "../../../../../../../lib/acm-i18next"
import InstructionCommand from "./InstructionCommand";
import { DOC_LINKS } from "../../../../../../../lib/doc-util";


export const StepCreateAWSAccountRoles = () => {
    const [t] = useTranslation();


    return (
        <>
            <Title headingLevel="h3">
                {t('Log in to the ROSA CLI with your Red Hat account and create AWS account roles and policies.')}
            </Title>

            <List component={ListComponent.ol} type={OrderType.number}>
                <ListItem className="pf-v6-u-mb-lg">
                    {t('To authenticate, run this command and enter your Red Hat login credentials via SSO')}
                    <div className="pf-v6-u-mt-md">
                    <InstructionCommand className="pf-v6-u-mt-md">
                        rosa login --use-auth-code
                    </InstructionCommand>
                    </div>
                     <Content component="p">
              {t('Learn more about')}{' '}
              <a target="_blank"
                rel="noreferrer" href={DOC_LINKS.LEARN_MORE_SSO_ROSA}>
                {t('logging into OpenShift Cluster Manager ROSA CLI with Red Hat single sign-on')}{' '}
              </a>
            </Content>
                </ListItem>

                <ListItem>
                    {t(`To create the necessary account-wide roles and policies quickly, use the default automethod that's provided in the ROSA CLI:`)}
                             <InstructionCommand
            textAriaLabel="Copyable ROSA create account-roles command"
            className="pf-v6-u-mt-md"
          >
            rosa create account-roles --mode auto
          </InstructionCommand>
                    <Alert
            variant="info"
            isInline
            isPlain
            title={
              <>
                {t('If you would prefer to manually create the required roles and policies within your AWS account, follow')}{' '}
                <a target="_blank"
                rel="noreferrer" href={DOC_LINKS.AWS_CLI_GETTING_STARTED_MANUAL}>
                  {t('these instructions')}
                </a>
                .
              </>
            }
          />
                </ListItem>
            </List>
        </>
    )
}