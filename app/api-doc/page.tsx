import { getApiDocs } from '@/lib/swagger';
import ReactSwagger from './react-swagger';

export const metadata = {
  title: 'API Documentation | NextPick',
  description: 'Swagger API Documentation',
};

export default async function IndexPage() {
  const spec = await getApiDocs();
  
  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
      <ReactSwagger spec={spec} />
    </div>
  );
}