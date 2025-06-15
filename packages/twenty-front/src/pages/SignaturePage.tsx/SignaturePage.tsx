import { useParams } from 'react-router-dom';

import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';

export const SignaturePage = () => {
  const { signatureId } = useParams();

  return (
    <PageContainer>
      <PageTitle title="Create Signature" />
      <PageHeader title="Create Signature">
        <PageHeaderToggleCommandMenuButton />
      </PageHeader>
      <PageBody>
        {/* Add your main content here */}
        <div style={{ padding: 20 }}>Signature ID: {signatureId}</div>
      </PageBody>
    </PageContainer>
  );
};
