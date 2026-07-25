'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  CircleHelp,
  ClipboardList,
  Clock3,
  FileText,
  Hourglass,
  Lock,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { fetchCurrentUser, logoutUser } from '@/redux/actions/authActions';
import styles from './BusinessApprovalPage.module.scss';

const NEXT_STEPS = [
  'Documents Verification',
  'Business Validation',
  'Final Approval',
  'Account Activation',
];

const BASE_ACTIONS = [
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

const STATUS_VIEW = {
  DRAFT: {
    tone: 'warning',
    title: 'Application Draft',
    headline: 'Application Draft',
    description: 'Your shop registration is not ready for approval yet. Please complete the required details and submit it for review.',
    badge: 'Submit your profile to continue',
    badgeIcon: Clock3,
    icon: ClipboardList,
    nextTitle: 'What happens next?',
    nextCopy: ['Complete your shop profile.', 'Submit it for admin review when ready.'],
    nextSteps: ['Complete Details', 'Submit for Review', 'Admin Verification', 'Account Activation'],
    noticeTitle: 'Your shop application is still in draft.',
    noticeDescription: 'Dashboard access stays disabled until your shop is submitted and approved.',
    bottomNotice: 'Dashboard access is disabled until your shop is approved.',
    actions: BASE_ACTIONS,
    timeline: [
      { title: 'Started', meta: 'In Progress', icon: ClipboardList, state: 'active' },
      { title: 'Submitted', meta: 'Pending', icon: Hourglass, state: 'pending' },
      { title: 'Verification', meta: 'Pending', icon: ShieldCheck, state: 'pending' },
      { title: 'Approved', meta: 'Pending', icon: Check, state: 'pending' },
    ],
  },
  PENDING_REVIEW: {
    tone: 'warning',
    title: 'Under Review',
    headline: 'Under Review',
    description: 'We are reviewing your shop details and documents. Your account will become active once approved by our admin team.',
    badge: 'Usually takes 1-2 business days',
    badgeIcon: Clock3,
    icon: ClipboardList,
    nextTitle: 'What happens next?',
    nextCopy: ['Our team is carefully verifying your information.', 'You will be notified once there is an update.'],
    nextSteps: NEXT_STEPS,
    noticeTitle: 'Your shop has not been activated yet.',
    noticeDescription: 'Until approval is complete you cannot browse products, place orders or access the B2B dashboard.',
    bottomNotice: 'Dashboard access is disabled until your shop is approved.',
    actions: BASE_ACTIONS,
    timeline: [
      { title: 'Submitted', meta: 'Completed', icon: ClipboardList, state: 'done' },
      { title: 'Under Review', meta: 'In Progress', icon: Hourglass, state: 'active' },
      { title: 'Verification', meta: 'Pending', icon: ShieldCheck, state: 'pending' },
      { title: 'Approved', meta: 'Pending', icon: Check, state: 'pending' },
    ],
  },
  REJECTED: {
    tone: 'danger',
    title: 'Rejected',
    headline: 'Registration Rejected',
    description: 'Your shop registration was rejected by the admin team. Review the reason and contact support before requesting another review.',
    badge: 'Action required',
    badgeIcon: AlertTriangle,
    icon: XCircle,
    nextTitle: 'What can you do next?',
    nextCopy: ['Check the rejection reason and submitted details.', 'Contact support if you need help reopening the review.'],
    nextSteps: ['Review Reason', 'Contact Support', 'Update Details', 'Request Review'],
    noticeTitle: 'Your shop registration was rejected.',
    noticeDescription: 'You cannot browse products, place orders or access the B2B dashboard until your shop is approved.',
    bottomNotice: 'Dashboard access is disabled because your shop was rejected.',
    actions: [
      {
        id: 'progress',
        title: 'Review Required',
        description: 'Check the current decision and contact support for the next step.',
        icon: ShieldAlert,
      },
      ...BASE_ACTIONS.slice(1),
    ],
    timeline: [
      { title: 'Submitted', meta: 'Completed', icon: ClipboardList, state: 'done' },
      { title: 'Under Review', meta: 'Completed', icon: Hourglass, state: 'done' },
      { title: 'Rejected', meta: 'Action Required', icon: XCircle, state: 'active' },
      { title: 'Approved', meta: 'Pending', icon: Check, state: 'pending' },
    ],
  },
  SUSPENDED: {
    tone: 'danger',
    title: 'Suspended',
    headline: 'Account Suspended',
    description: 'Your shop account has been suspended by the admin team. Please contact support to understand the reason and restore access.',
    badge: 'Contact support to restore access',
    badgeIcon: Lock,
    icon: CircleOff,
    nextTitle: 'What can you do next?',
    nextCopy: ['Your dashboard and ordering access are paused.', 'Contact support for account review and reinstatement.'],
    nextSteps: ['Access Paused', 'Contact Support', 'Admin Review', 'Account Reinstatement'],
    noticeTitle: 'Your shop account is suspended.',
    noticeDescription: 'You cannot browse products, place orders or access the B2B dashboard until suspension is removed.',
    bottomNotice: 'Dashboard access is disabled because your shop is suspended.',
    actions: [
      {
        id: 'progress',
        title: 'Access Paused',
        description: 'Your shop access is paused until an admin reinstates the account.',
        icon: CircleOff,
      },
      ...BASE_ACTIONS.slice(1),
    ],
    timeline: [
      { title: 'Submitted', meta: 'Completed', icon: ClipboardList, state: 'done' },
      { title: 'Approved', meta: 'Completed', icon: Check, state: 'done' },
      { title: 'Suspended', meta: 'Access Paused', icon: CircleOff, state: 'active' },
      { title: 'Reinstated', meta: 'Pending', icon: ShieldCheck, state: 'pending' },
    ],
  },
  BLOCKED: {
    tone: 'danger',
    title: 'Blocked',
    headline: 'Account Blocked',
    description: 'Your shop account is blocked. Please contact support for help with your account access.',
    badge: 'Support required',
    badgeIcon: Lock,
    icon: ShieldAlert,
    nextTitle: 'What can you do next?',
    nextCopy: ['Your access is currently blocked.', 'Contact support for account assistance.'],
    nextSteps: ['Access Blocked', 'Contact Support', 'Admin Review', 'Resolution'],
    noticeTitle: 'Your shop account is blocked.',
    noticeDescription: 'You cannot use the B2B dashboard until your account access is restored.',
    bottomNotice: 'Dashboard access is disabled because your shop is blocked.',
    actions: BASE_ACTIONS,
    timeline: [
      { title: 'Submitted', meta: 'Completed', icon: ClipboardList, state: 'done' },
      { title: 'Reviewed', meta: 'Completed', icon: Hourglass, state: 'done' },
      { title: 'Blocked', meta: 'Support Required', icon: ShieldAlert, state: 'active' },
      { title: 'Resolved', meta: 'Pending', icon: Check, state: 'pending' },
    ],
  },
};

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

const getStatusView = (status) => STATUS_VIEW[status] || STATUS_VIEW.PENDING_REVIEW;

const buildDetails = (shopkeeper, submittedDate) => {
  const address = shopkeeper?.addresses?.find((item) => item.isPrimary) || shopkeeper?.addresses?.[0] || {};
  const rows = [
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
  if (shopkeeper.rejectionReason) rows.push(['Admin Note', shopkeeper.rejectionReason]);
  return rows;
};

function ApprovalHero({ view, reason }) {
  const Icon = view.icon;
  const BadgeIcon = view.badgeIcon;
  return (
    <section className={styles.heroCard}>
      <div className={styles.heroMain}>
        <div className={styles.heroHalo}>
          <div className={styles.heroIcon}>
            <Icon size={58} />
            <span>
              <BadgeIcon size={20} />
            </span>
          </div>
        </div>

        <div className={styles.heroCopy}>
          <h2>{view.headline}</h2>
          <p>{view.description}</p>
          {reason ? (
            <div className={styles.reasonBox}>
              <strong>Admin note</strong>
              <span>{reason}</span>
            </div>
          ) : null}
          <div className={styles.etaBadge}>
            <BadgeIcon size={16} />
            {view.badge}
          </div>
        </div>
      </div>

      <aside className={styles.nextPanel}>
        <h3>{view.nextTitle}</h3>
        {view.nextCopy.map((copy) => (
          <p key={copy}>{copy}</p>
        ))}
        <div className={styles.nextList}>
          {view.nextSteps.map((step) => (
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

function ApprovalTimeline({ submittedDate, steps }) {
  return (
    <section className={styles.timelineCard}>
      <div className={styles.timelineTrack} />
      <div className={styles.timelineGrid}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompletedConnector = index > 0 && ['done', 'active'].includes(step.state);
          return (
            <article
              key={step.title}
              className={[styles.timelineStep, step.state === 'active' && styles.timelineStepActive].filter(Boolean).join(' ')}
            >
              {index > 0 ? <span className={[styles.connector, isCompletedConnector && styles.connectorDone].filter(Boolean).join(' ')} /> : null}
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
  const view = getStatusView(shopkeeper.status);
  const submittedDate = formatDate(shopkeeper.createdAt || user?.createdAt);
  const details = useMemo(() => buildDetails(shopkeeper, submittedDate), [shopkeeper, submittedDate]);
  const reason = ['REJECTED', 'SUSPENDED', 'BLOCKED'].includes(shopkeeper.status) ? shopkeeper.rejectionReason : '';

  useEffect(() => {
    void dispatch(fetchCurrentUser());
  }, [dispatch]);

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
    <main className={[styles.page, styles[`page--${view.tone}`]].join(' ')}>
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
        {/* <button type="button" className={styles.backButton} onClick={() => window.history.back()} aria-label="Go back">
          ←
        </button> */}
        <div className={styles.brandBlock}>
          <strong>{shopkeeper.shopName || 'Akash Jewellers'}</strong>
          <span>B2B Jewellery Platform</span>
        </div>
        <h1>{view.title}</h1>
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
        <ApprovalTimeline submittedDate={submittedDate} steps={view.timeline} />
        <ApprovalHero view={view} reason={reason} />

        <section className={styles.notice}>
          <AlertTriangle size={31} />
          <div>
            <h2>{view.noticeTitle}</h2>
            <p>{view.noticeDescription}</p>
          </div>
        </section>

        <section className={styles.actionsCard}>
          {view.actions.map((item) => (
            <ActionRow key={item.id} item={item} onPress={() => handleAction(item.id)} />
          ))}
        </section>

        <SecureCard />

        <section className={styles.bottomNotice}>
          <div>
            <Lock size={22} />
            <span>{view.bottomNotice}</span>
          </div>
          <button type="button" className={styles.refreshButton} onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={18} className={loading ? styles.spin : undefined} />
            Refresh Approval Status
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
