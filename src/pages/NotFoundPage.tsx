import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Accessible 404 fallback route. */
export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The page you are looking for doesn’t exist or has moved."
      action={
        <Link to="/discover" className={buttonClasses('primary')}>
          Discover scholarships
        </Link>
      }
    />
  );
}

