'use client';

import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  Hourglass,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { fetchCurrentUser, logoutUser } from '@/redux/actions/authActions';
import styles from './BusinessApprovalPage.module.scss';

const NEXT_STEPS = [
  'Documents Verification',
  'Business Validation',
  'Final Approval',
  'Account Activation',
];

const ACTIONS = [
  {
    id: 'progress',
    title: 'Verification in Progress',
    description: 'We are verifying your documents and shop details.',
    icon: ShieldCheck,
  },
  {
    id: 'updates',
    title: 'Stay Updated',
    description: "We'll notify you about any updates or actions required.",
    icon: Bell,
  },
  {
    id: 'details',
    title: 'View Submitted Details',
    description: 'View the details you have submitted for registration.',
    icon: FileText,
  },
  {
    id: 'logout',
    title: 'Logout',
    description: 'Sign out from your account.',
    icon: LogOut,
  },
];

const TIMELINE = [
  { title: 'Submitted', meta: 'Completed', icon: ClipboardList, state: 'done' },
  { title: 'Under Review', meta: 'In Progress', icon: Hourglass, state: 'active' },
  { title: 'Verification', meta: 'Pending', icon: ShieldCheck, state: 'pending' },
  { title: 'Approved', meta: 'Pending', icon: Check, state: 'pending' },
];

const formatDate = (date) => {
  if (!date) return '18 May 2025';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return '18 May 2025';
  }
};

const statusLabel = (status) =>
  String(status || 'PENDING_REVIEW').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

const getShopkeeper = (user) => user?.shopkeeper || user?.shopkeeperProfile || {};

const buildDetails = (shopkeeper, submittedDate) => {
  const address = shopkeeper?.addresses?.find((item) => item.isPrimary) || shopkeeper?.addresses?.[0] || {};
  return [
    ['Owner Name', shopkeeper.ownerName || shopkeeper.owner?.name || 'Akash Gupta'],
    ['Shop Name', shopkeeper.shopName || 'Akash Jewellers'],
    ['Mobile', shopkeeper.mobile || '+91 98765 43210'],
    ['Email', shopkeeper.email || 'akashjewellers@gmail.com'],
    ['Address', address.addressLine1 || shopkeeper.addressLine1 || '123, Railway Road'],
    ['City', shopkeeper.city || address.city || 'Darbhanga'],
    ['State', shopkeeper.state || address.state || 'Bihar'],
    ['Pincode', shopkeeper.pincode || address.pincode || '846004'],
    ['Submission Date', submittedDate],
    ['Current Status', statusLabel(shopkeeper.status)],
  ];
};

function ApprovalHero() {
  return (
    <section className={styles.heroCard}>
      <div className={styles.heroMain}>
        <div className={styles.heroHalo}>
          <div className={styles.heroIcon}>
            <ClipboardList size={58} />
            <span>
              <Clock3 size={20} />
            </span>
          </div>
        </div>

        <div className={styles.heroCopy}>
          <h2>Under Review</h2>
          <p>
            We are reviewing your shop details and documents. Your account will become active once
            approved by our admin team.
          </p>
          <div className={styles.etaBadge}>
            <Clock3 size={16} />
            Usually takes 1-2 business days
          </div>
        </div>
      </div>

      <aside className={styles.nextPanel}>
        <h3>What happens next?</h3>
        <p>Our team is carefully verifying your information.</p>
        <p>You will be notified once there is an update.</p>
        <div className={styles.nextList}>
          {NEXT_STEPS.map((step) => (
            <span key={step}>
              <CheckCircle2 size={16} />
              {step}
            </span>
          ))}
        </div>
      </aside>
    </section>
  );
}

function ApprovalTimeline({ submittedDate }) {
  return (
    <section className={styles.timelineCard}>
      <div className={styles.timelineTrack} />
      <div className={styles.timelineGrid}>
        {TIMELINE.map((step, index) => {
          const Icon = step.icon;
          return (
            <article key={step.title} className={styles.timelineStep}>
              {index > 0 ? <span className={[styles.connector, index === 1 && styles.connectorDone].filter(Boolean).join(' ')} /> : null}
              <span className={[styles.timelineIcon, styles[`timelineIcon--${step.state}`]].join(' ')}>
                <Icon size={27} />
              </span>
              <h3>{index + 1}. {step.title}</h3>
              <p>{index === 0 ? submittedDate : step.meta}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ActionRow({ item, onPress }) {
  const Icon = item.icon;
  return (
    <button className={styles.actionRow} type="button" onClick={onPress}>
      <span className={styles.actionIcon}>
        <Icon size={30} />
      </span>
      <span className={styles.actionCopy}>
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </span>
      <ChevronRight size={27} />
    </button>
  );
}

function DetailsModal({ details, onClose }) {
  return (
    <div className={styles.modalBackdrop} role="presentation" onClick={onClose}>
      <section className={styles.modalCard} role="dialog" aria-modal="true" aria-label="Submitted details" onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHead}>
          <h2>Submitted Details</h2>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        <div className={styles.modalRows}>
          {details.map(([label, value]) => (
            <div key={label} className={styles.modalRow}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SecureCard() {
  return (
    <section className={styles.secureCard}>
      <span className={styles.secureShield}>
        <ShieldCheck size={54} />
        <Lock size={24} />
      </span>
      <div>
        <h2>Your Information is Secure</h2>
        <p>
          All submitted documents are securely encrypted and reviewed only by authorized administrators.
        </p>
      </div>
      <div className={styles.safeArt} aria-hidden="true">
        <span />
        <ShieldCheck size={46} />
      </div>
    </section>
  );
}

export default function BusinessApprovalPage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [showDetails, setShowDetails] = useState(false);
  const shopkeeper = getShopkeeper(user);
  const submittedDate = formatDate(shopkeeper.createdAt || user?.createdAt);
  const details = useMemo(() => buildDetails(shopkeeper, submittedDate), [shopkeeper, submittedDate]);

  const handleRefresh = () => {
    void dispatch(fetchCurrentUser());
  };

  const handleLogout = () => {
    void dispatch(logoutUser());
  };

  const handleAction = (id) => {
    if (id === 'details') {
      setShowDetails(true);
      return;
    }
    if (id === 'logout') {
      handleLogout();
      return;
    }
    handleRefresh();
  };

  return (
    <main className={styles.page}>
      <div className={styles.dashboardPreview} aria-hidden="true">
        <div className={styles.previewHeader} />
        <div className={styles.previewGrid}>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={() => window.history.back()} aria-label="Go back">
          ←
        </button>
        <div className={styles.brandBlock}>
          <strong>{shopkeeper.shopName || 'Akash Jewellers'}</strong>
          <span>B2B Jewellery Platform</span>
        </div>
        <h1>Shop Approval Status</h1>
        <div className={styles.headerActions}>
          <button type="button" className={styles.supportButton}>
            <CircleHelp size={18} />
            Help & Support
          </button>
          <button type="button" className={styles.outlineLogout} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <ApprovalHero />
        <ApprovalTimeline submittedDate={submittedDate} />

        <section className={styles.notice}>
          <AlertTriangle size={31} />
          <div>
            <h2>Your shop has not been activated yet.</h2>
            <p>
              Until approval is complete you cannot browse products, place orders or access the B2B dashboard.
            </p>
          </div>
        </section>

        <section className={styles.actionsCard}>
          {ACTIONS.map((item) => (
            <ActionRow key={item.id} item={item} onPress={() => handleAction(item.id)} />
          ))}
        </section>

        <SecureCard />

        <section className={styles.bottomNotice}>
          <div>
            <Lock size={22} />
            <span>Dashboard access is disabled until your shop is approved.</span>
          </div>
          <button type="button" className={styles.refreshButton} onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={18} className={loading ? styles.spin : undefined} />
            {loading ? 'Refreshing...' : 'Refresh Approval Status'}
          </button>
          <button type="button" className={styles.secondaryButton} onClick={handleLogout}>
            Logout
          </button>
        </section>
      </div>

      {showDetails ? <DetailsModal details={details} onClose={() => setShowDetails(false)} /> : null}
    </main>
  );
}
