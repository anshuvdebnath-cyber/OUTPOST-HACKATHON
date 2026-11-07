import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Compass, KanbanSquare } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';
import { KanbanBoard } from '@/features/applications/KanbanBoard';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useApplicationStore } from '@/store/useApplicationStore';

/** Application tracker — every saved scholarship on a status board. */
export default function TrackerPage() {
  useDocumentTitle('Application tracker');
  const applicationsMap = useApplicationStore((s) => s.applications);
  const applications = useMemo(() => Object.values(applicationsMap), [applicationsMap]);

  return (
    <>
      <PageHeader
        title="Application tracker"
        description="Move each scholarship application from saved to awarded. Drag cards between columns, or use the status menu on any card."
        actions={
          <Link to="/discover" className={buttonClasses('secondary')}>
            <Compass aria-hidden="true" className="h-4 w-4" /> Find more
          </Link>
        }
      />
      {applications.length === 0 ? (
        <EmptyState
          icon={KanbanSquare}
          title="No applications yet"
          description="Save scholarships from Discover and they will appear here so you can track every step until you are awarded."
          action={
            <Link to="/discover" className={buttonClasses('primary')}>
              Discover scholarships
            </Link>
          }
        />
      ) : (
        <KanbanBoard applications={applications} />
      )}
    </>
  );
}

