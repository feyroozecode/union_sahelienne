'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchApi, getErrorMessage } from '@/lib/api';
import { formatDate, formatUserLabel } from '@/lib/format';
import type { AdminMatch } from '@/lib/types';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ResponsiveTable, type ResponsiveTableColumn } from '@/components/ResponsiveTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Eye, Clock, User, Heart, MessageSquare } from 'lucide-react';
import styles from './page.module.css';

export default function MatchesPage() {
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<AdminMatch | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchApi<AdminMatch[]>('/admin/matches');
      setMatches(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load matches.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleViewDetails = (match: AdminMatch) => {
    setSelectedMatch(match);
    setIsDrawerOpen(true);
  };

  const columns: ResponsiveTableColumn<AdminMatch>[] = [
    { key: 'id', label: 'ID', render: (val) => `#${val}` },
    { 
      key: 'requester', 
      label: 'Requester', 
      render: (_, match) => (
        <div className={styles.memberCell}>
          <div className={styles.memberName}>{formatUserLabel(match.requester, `User #${match.requesterId}`)}</div>
          <div className={styles.memberMeta}>ID: #{match.requesterId}</div>
        </div>
      )
    },
    { 
      key: 'target', 
      label: 'Target', 
      render: (_, match) => (
        <div className={styles.memberCell}>
          <div className={styles.memberName}>{formatUserLabel(match.target, `User #${match.targetId}`)}</div>
          <div className={styles.memberMeta}>ID: #{match.targetId}</div>
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => (
        <Badge 
          variant={
            val === 'accepted' ? 'success' : 
            val === 'pending' ? 'warning' : 
            val === 'rejected' ? 'error' : 'neutral'
          }
        >
          {val}
        </Badge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Created', 
      render: (val) => formatDate(val),
      desktopOnly: true
    },
  ];

  const renderActions = (match: AdminMatch) => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'center' }}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleViewDetails(match)} 
        title="View Full Details"
      >
        <Eye size={18} />
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <header className={styles.header}>
        <div>
          <h1>Match Pipeline</h1>
          <p>Monitor connecting user relationships and match lifecycle</p>
        </div>
      </header>

      <ResponsiveTable
        title="All Connections"
        columns={columns}
        data={matches}
        loading={loading}
        error={error}
        isMobile={isMobile}
        renderRowActions={renderActions}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Match #${selectedMatch?.id} Details`}
        size="md"
      >
        {selectedMatch && (
          <div className={styles.drawerContent}>
            <div className={styles.drawerSection}>
              <div className={styles.sectionTitle}>
                <Clock size={16} />
                Match Timeline
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelinePoint} />
                <div>
                  <div className={styles.timelineLabel}>Initiated</div>
                  <div className={styles.timelineValue}>{formatDate(selectedMatch.createdAt)}</div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={`${styles.timelinePoint} ${selectedMatch.status !== 'pending' ? styles.pointSuccess : ''}`} />
                <div>
                  <div className={styles.timelineLabel}>Current Status</div>
                  <div className={styles.timelineValue}>
                    <Badge 
                      variant={
                        selectedMatch.status === 'accepted' ? 'success' : 
                        selectedMatch.status === 'pending' ? 'warning' : 
                        selectedMatch.status === 'rejected' ? 'error' : 'neutral'
                      }
                    >
                      {selectedMatch.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.drawerSection}>
              <div className={styles.sectionTitle}>
                <User size={16} />
                Participants
              </div>
              <div className={styles.participantGrid}>
                <div className={styles.participantCard}>
                  <div className={styles.participantLabel}>Requester</div>
                  <div className={styles.participantName}>
                    {formatUserLabel(selectedMatch.requester, `User #${selectedMatch.requesterId}`)}
                  </div>
                  <div className={styles.participantId}>ID: #{selectedMatch.requesterId}</div>
                  <Button variant="outline" size="sm" fullWidth className={styles.viewProfileBtn}>
                    View Profile
                  </Button>
                </div>
                <div className={styles.participantCard}>
                  <div className={styles.participantLabel}>Target</div>
                  <div className={styles.participantName}>
                    {formatUserLabel(selectedMatch.target, `User #${selectedMatch.targetId}`)}
                  </div>
                  <div className={styles.participantId}>ID: #{selectedMatch.targetId}</div>
                  <Button variant="outline" size="sm" fullWidth className={styles.viewProfileBtn}>
                    View Profile
                  </Button>
                </div>
              </div>
            </div>

            <div className={styles.drawerSection}>
              <div className={styles.sectionTitle}>
                <Heart size={16} />
                Match Statistics
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Response Time</div>
                  <div className={styles.statValue}>2.4 Hours</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statLabel}>Credit Cost</div>
                  <div className={styles.statValue}>1 Credit</div>
                </div>
              </div>
            </div>

            {selectedMatch.status === 'accepted' && (
              <div className={styles.drawerSection}>
                <div className={styles.sectionTitle}>
                  <MessageSquare size={16} />
                  Communication
                </div>
                <div className={styles.infoBox}>
                  Chat is active for this match. 28 days remaining.
                </div>
                <Button variant="secondary" fullWidth style={{ marginTop: '12px' }}>
                  Inspect Conversation
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
