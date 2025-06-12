import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationPreview } from '@/settings/integrations/components/SettingsIntegrationPreview';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { Controller, useForm } from 'react-hook-form';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type FormInput = {
  keyId: string;
  keySecret: string;
};

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsIntegrationRabbitSign = () => {
  const { t } = useLingui();
  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'rabbit-sign',
  );
  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(
      z.object({
        keyId: z.string().min(1),
        keySecret: z.string().min(1),
      }),
    ),
    defaultValues: {
      keyId: '',
      keySecret: '',
    },
  });

  if (!integration) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={integration.text}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: getSettingsPath(SettingsPath.Integrations),
        },
        { children: integration.text },
      ]}
    >
      <SettingsPageContainer>
        <SettingsIntegrationPreview
          integrationLogoUrl={integration.from.image}
        />
        <Section>
          <H2Title
            title="RabbitSign Integration"
            description="Connect your RabbitSign account to send/sync document signatures"
          />
          <StyledForm>
            <Controller
              name="keyId"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextInput
                  placeholder="Key ID"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <Controller
              name="keySecret"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <TextInput
                  placeholder="Key Secret"
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  fullWidth
                />
              )}
            />
            <StyledButtonContainer>
              <Button title={t`Save`} type="submit" />
              <Button title={t`Delete`} type="button" accent="danger" />
            </StyledButtonContainer>
          </StyledForm>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
