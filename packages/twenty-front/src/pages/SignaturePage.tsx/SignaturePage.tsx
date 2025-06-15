import { useParams } from 'react-router-dom';

export const SignaturePage = () => {
  const { signatureId } = useParams();
  return <div>SignaturePage {signatureId}</div>;
};
