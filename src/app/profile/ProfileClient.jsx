'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  Coins,
  FileText,
  Gem,
  Home,
  IndianRupee,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  MapPinned,
  PackageSearch,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  UserRound,
  XCircle,
} from 'lucide-react';
import AccountHeader from '@/features/account/components/AccountHeader/AccountHeader';
import { ProfileSkeleton } from '@/components/skeleton/AppSkeletons';
import { shopkeeperApi } from '@/services/shopkeeperApi';
import { ROUTES } from '@/constants/routes';
import { ORDER_STATUS_META } from '@/constants/orderStatus';
import styles from './profile.module.scss';

const STATUS_LABELS = {
  APPROVED: 'Verified',
  PENDING_REVIEW: 'Pending Review',
  DRAFT: 'Draft',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
  BLOCKED: 'Blocked',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
};

const formatWeight = (grams) => `${Number(grams ?? 0).toFixed(3).replace(/\.?0+$/, '')} g`;
const formatDueWeight = (grams) => `${Number(grams ?? 0).toFixed(3).replace(/\.?0+$/, '')} gm`;

const orderWeightByMetal = (order) => {
  const groups = new Map();
  orderDisplayItems(order).forEach((item) => {
    const metalName = item.metalName ?? item.product?.metal?.name ?? 'Other';
    const weight = item.fulfillmentItem
      ? Number(item.fineWeight ?? 0)
      : Number(item.variant?.weightGrams ?? 0) * Number(item.quantity ?? 0);
    groups.set(metalName, (groups.get(metalName) ?? 0) + weight);
  });
  return Array.from(groups.entries());
};

const orderDisplayItems = (order) => {
  const fulfillmentItems = order.fulfillmentOrder?.items ?? [];
  if (fulfillmentItems.length) {
    const metalName = order.fulfillmentOrder?.metal?.name ?? 'Metal';
    return fulfillmentItems.map((item) => ({
      id: `fulfillment-${item.id}`,
      fulfillmentItem: true,
      metalName,
      fineWeight: item.fineWeight,
    }));
  }
  return order.items ?? [];
};

const formatCreditLimits = (limits = []) => {
  const active = limits.filter((limit) => Number(limit.creditLimitGrams) > 0);
  if (!active.length) return 'Not set';
  return active
    .map((limit) => `${limit.metal?.name ?? 'Metal'}: ${Number(limit.creditLimitGrams).toFixed(3)}g`)
    .join(', ');
};

const getPrimaryAddress = (profile) =>
  profile?.addresses?.find((address) => address.isPrimary) || profile?.addresses?.[0] || null;

const mapProfileToValues = (profile) => ({
  shopName: profile.shopName || '',
  ownerName: profile.ownerName || '',
  businessType: profile.businessType || '',
  verificationStatus: STATUS_LABELS[profile.status] || profile.status || '—',
  mobileNumber: profile.user?.mobile || 'Not added',
  emailAddress: profile.user?.email || 'Not added',
  addressLine1: getPrimaryAddress(profile)?.addressLine1 || profile.addressLine1 || '',
  addressLine2: getPrimaryAddress(profile)?.addressLine2 || profile.addressLine2 || '',
  city: getPrimaryAddress(profile)?.city || profile.city || '',
  state: getPrimaryAddress(profile)?.state || profile.state || '',
  pincode: getPrimaryAddress(profile)?.pincode || profile.pincode || '',
  gstNumber: profile.gstNumber || '',
  creditLimit: formatCreditLimits(profile.metalCreditLimits),
  orderAllowed: profile.isOrderAllowed ? 'Yes, you can place orders' : 'Not yet enabled',
  memberSince: formatDate(profile.user?.createdAt || profile.createdAt),
});

const extractMessage = (err) =>
  err?.error?.message || err?.response?.data?.error?.message || err?.message || 'Something went wrong';

// Only these three sections are actually patchable via PATCH /shopkeeper/profile
// (shopkeeperUpdateBody in shopkeeper.validation.js) — Contact Details (email/
// mobile live on the User record, no self-service endpoint) and Account &
// Credit (admin-controlled/computed) are display-only.
const SECTION_PAYLOAD_BUILDERS = {
  identity: (values) => ({
    shopName: values.shopName.trim(),
    ownerName: values.ownerName.trim(),
    businessType: values.businessType,
  }),
  address: (values) => ({
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2?.trim() || null,
    city: values.city.trim(),
    state: values.state,
    pincode: values.pincode.trim(),
  }),
  tax: (values) => ({
    gstNumber: values.gstNumber?.trim() || null,
  }),
};

const MENU_ITEMS = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'View and manage your shop profile',
    icon: UserRound,
  },
  {
    id: 'transactions',
    title: 'Transactions',
    description: 'View ledger, payments and account activity',
    icon: IndianRupee,
  },
  {
    id: 'orders',
    title: 'My Orders',
    description: 'Track your orders and order history',
    icon: ShoppingBag,
  },
  {
    id: 'addresses',
    title: 'Addresses',
    description: 'Manage your shop addresses',
    icon: MapPinned,
  },
];

const ACCOUNT_HOME = {
  id: 'account',
  title: 'Profile',
  description: 'View and manage your shop profile',
};

const FORM_SECTIONS = [
  {
    id: 'identity',
    number: '1.',
    title: 'Shop Identity',
    description: 'Basic information about your shop',
    icon: Store,
    fields: [
      { key: 'shopName', label: 'Shop Name', icon: Store, type: 'text' },
      { key: 'ownerName', label: 'Owner Name', icon: UserRound, type: 'text' },
      {
        key: 'businessType',
        label: 'Business Type',
        icon: ShoppingBag,
        type: 'select',
        options: ['B2B Jewellery Retailer', 'Wholesaler', 'Manufacturer'],
      },
      { key: 'verificationStatus', label: 'Verification Status', icon: ShieldCheck, type: 'badge' },
    ],
  },
  {
    id: 'contact',
    number: '2.',
    title: 'Contact Details',
    description: 'Your registered contact information',
    icon: Phone,
    // Email/mobile live on the User record — no self-service update endpoint
    // exists for a shopkeeper to change these themselves.
    editable: false,
    fields: [
      { key: 'mobileNumber', label: 'Mobile Number', icon: Phone, type: 'tel' },
      { key: 'emailAddress', label: 'Email Address', icon: Mail, type: 'email' },
    ],
  },
  {
    id: 'address',
    number: '3.',
    title: 'Shop Address',
    description: 'Your primary business address',
    icon: MapPin,
    withAddressCard: true,
    fields: [
      { key: 'addressLine1', label: 'Address Line 1', icon: Home, type: 'text', span: 'wide' },
      { key: 'addressLine2', label: 'Address Line 2', icon: Home, type: 'text', span: 'wide' },
      { key: 'city', label: 'City', icon: Store, type: 'text' },
      {
        key: 'state',
        label: 'State',
        icon: MapPin,
        type: 'text',
      },
      { key: 'pincode', label: 'Pincode', icon: FileText, type: 'text' },
    ],
  },
  {
    id: 'tax',
    number: '4.',
    title: 'Business & Tax Info',
    description: 'Business registration details',
    icon: FileText,
    notice: 'PAN Number, Bank Details and UPI ID are not available in the backend currently. Please contact administrator to update these details.',
    fields: [
      { key: 'gstNumber', label: 'GST Number', icon: FileText, type: 'text', span: 'wide' },
    ],
  },
  {
    id: 'credit',
    number: '5.',
    title: 'Account & Credit',
    description: 'Your account and credit information',
    icon: ShieldCheck,
    // Admin-controlled / computed fields — not shopkeeper-editable.
    editable: false,
    fields: [
      { key: 'creditLimit', label: 'Credit Limit', icon: Coins, type: 'text' },
      { key: 'orderAllowed', label: 'Order Allowed', icon: ShoppingCart, type: 'badge' },
      { key: 'memberSince', label: 'Member Since', icon: CalendarDays, type: 'text' },
    ],
  },
];

function FieldCard({ field, value, editing, onChange }) {
  const Icon = field.icon;
  const isSelect = field.type === 'select';
  const isBadge = field.type === 'badge';

  return (
    <label className={[styles.fieldCard, field.span === 'wide' && styles.fieldWide].filter(Boolean).join(' ')}>
      <Icon size={24} />
      <span className={styles.fieldBody}>
        <span className={styles.fieldLabel}>{field.label}</span>
        {editing && !isBadge ? (
          <span className={styles.controlWrap}>
            {isSelect ? (
              <>
                <select value={value} onChange={(event) => onChange(field.key, event.target.value)}>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} />
              </>
            ) : (
              <input
                type={field.type}
                value={value}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )}
          </span>
        ) : (
          <span className={isBadge ? styles.greenBadge : styles.fieldValue}>
            {isBadge && <ShieldCheck size={16} />}
            {value}
          </span>
        )}
      </span>
      {!editing && isSelect ? <ChevronDown className={styles.selectCue} size={18} /> : null}
    </label>
  );
}

function SectionCard({ section, values, editing, saving, errorMessage, onEditToggle, onChange, onManageAddresses }) {
  const Icon = section.icon;
  const editable = section.editable !== false;

  return (
    <section className={styles.formSection}>
      <div className={styles.formSectionHead}>
        <span className={styles.sectionIcon}>
          <Icon size={28} />
        </span>
        <div>
          <h3>
            <span>{section.number}</span>
            {section.title}
          </h3>
          <p>{section.description}</p>
        </div>
        {editable ? (
          <button
            className={styles.sectionEdit}
            type="button"
            onClick={() => onEditToggle(section.id)}
            disabled={saving}
          >
            <Pencil size={18} />
            {saving ? <span className={styles.buttonSpinner} aria-hidden="true" /> : null}
            {editing ? 'Save' : 'Edit'}
          </button>
        ) : null}
      </div>

      {errorMessage ? (
        <div className={styles.sectionErrorNotice}>
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className={[styles.fieldsGrid, section.withAddressCard && styles.addressGrid].filter(Boolean).join(' ')}>
        <div className={styles.fieldGroup}>
          {section.fields.map((field) => (
            <FieldCard
              key={field.key}
              field={field}
              value={values[field.key]}
              editing={editable && editing}
              onChange={onChange}
            />
          ))}
        </div>

        {section.withAddressCard ? (
          <aside className={styles.addressAside}>
            <MapPin size={42} />
            <strong>Primary Address</strong>
            <p>This is your primary business address</p>
            <button type="button" onClick={onManageAddresses}>
              Manage Addresses
              <ArrowRight size={17} />
            </button>
          </aside>
        ) : null}
      </div>

      {section.notice ? (
        <div className={styles.notice}>
          <Info size={20} />
          <span>{section.notice}</span>
        </div>
      ) : null}
    </section>
  );
}

function AddressManagerPanel({ profile, onSaved }) {
  const primaryAddress = getPrimaryAddress(profile);
  const [addressValues, setAddressValues] = useState(() => ({
    label: primaryAddress?.label || 'Primary',
    contactName: primaryAddress?.contactName || profile?.ownerName || '',
    contactMobile: primaryAddress?.contactMobile || profile?.user?.mobile || '',
    addressLine1: primaryAddress?.addressLine1 || profile?.addressLine1 || '',
    addressLine2: primaryAddress?.addressLine2 || profile?.addressLine2 || '',
    city: primaryAddress?.city || profile?.city || '',
    state: primaryAddress?.state || profile?.state || '',
    pincode: primaryAddress?.pincode || profile?.pincode || '',
    country: primaryAddress?.country || 'India',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const setAddressValue = (key) => (event) => {
    setError('');
    setMessage('');
    setAddressValues((current) => ({ ...current, [key]: event.target.value }));
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    if (!addressValues.addressLine1.trim()) {
      setError('Address line 1 is required');
      return;
    }
    if (!addressValues.city.trim()) {
      setError('City is required');
      return;
    }
    if (!addressValues.pincode.trim()) {
      setError('Pincode is required');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        label: addressValues.label.trim() || 'Primary',
        contactName: addressValues.contactName.trim() || null,
        contactMobile: addressValues.contactMobile.trim() || null,
        addressLine1: addressValues.addressLine1.trim(),
        addressLine2: addressValues.addressLine2.trim() || null,
        city: addressValues.city.trim(),
        state: addressValues.state.trim(),
        pincode: addressValues.pincode.trim(),
        country: addressValues.country.trim() || 'India',
        isPrimary: true,
      };
      const response = await shopkeeperApi.updateAddress(payload);
      onSaved(response.data);
      setMessage('Address saved successfully.');
    } catch (saveError) {
      setError(extractMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    ['label', 'Address Name', 'Primary'],
    ['contactName', 'Contact Name', 'Owner name'],
    ['contactMobile', 'Contact Mobile', 'Mobile number'],
    ['addressLine1', 'Address Line 1', 'Shop address'],
    ['addressLine2', 'Address Line 2', 'Area, landmark'],
    ['city', 'City', 'City'],
    ['state', 'State', 'Optional'],
    ['pincode', 'Pincode', 'Pincode'],
    ['country', 'Country', 'Country'],
  ];

  return (
    <section className={styles.formSection}>
      <div className={styles.formSectionHead}>
        <span className={styles.sectionIcon}>
          <MapPinned size={28} />
        </span>
        <div>
          <h3>Shop Addresses</h3>
          <p>Manage your primary shop address</p>
        </div>
        <span className={styles.addressCount}>1 address</span>
      </div>

      {error ? (
        <div className={styles.sectionErrorNotice}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      ) : null}
      {message ? <div className={styles.sectionSuccessNotice}>{message}</div> : null}

      <form className={styles.addressManager} onSubmit={saveAddress}>
        {fields.map(([key, label, placeholder]) => (
          <label key={key} className={key === 'addressLine1' || key === 'addressLine2' ? styles.addressManagerWide : undefined}>
            <span>{label}</span>
            <input
              value={addressValues[key]}
              onChange={setAddressValue(key)}
              placeholder={placeholder}
              inputMode={key === 'contactMobile' || key === 'pincode' ? 'numeric' : undefined}
            />
          </label>
        ))}

        <button type="submit" disabled={saving}>
          {saving ? <span className={styles.buttonSpinner} aria-hidden="true" /> : <ShieldCheck size={18} />}
          Save Address
        </button>
      </form>
    </section>
  );
}

function PanelRowsSkeleton({ rows = 4 }) {
  return (
    <section className={styles.formSection} aria-busy="true">
      <div className={styles.panelSkeletonHead}>
        <span />
        <div>
          <strong />
          <em />
        </div>
      </div>
      <div className={styles.panelSkeletonRows}>
        {Array.from({ length: rows }, (_, index) => <span key={index} />)}
      </div>
    </section>
  );
}

function OrdersPanel() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let alive = true;
    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await shopkeeperApi.getOrders({ page: 1, pageSize: 50 });
        if (!alive) return;
        setOrders(response.data ?? []);
      } catch {
        if (alive) setError('Could not load your orders. Refresh and try again.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    const timeout = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => {
      alive = false;
      window.clearTimeout(timeout);
    };
  }, []);

  const cancelOrder = async (event, order) => {
    event.preventDefault();
    event.stopPropagation();
    if (order.status !== 'REQUESTED' || cancellingId) return;
    if (!window.confirm(`Cancel ${order.orderNumber}?`)) return;

    setCancellingId(order.id);
    setError('');
    try {
      const response = await shopkeeperApi.cancelOrder(order.id);
      const cancelled = response.data;
      setOrders((current) =>
        (current ?? []).map((item) => (String(item.id) === String(order.id) ? cancelled : item)),
      );
    } catch {
      setError('Could not cancel this order. Refresh and try again.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <PanelRowsSkeleton rows={5} />;
  }

  if (error) {
    return (
      <section className={styles.formSection}>
        <div className={styles.ordersEmpty}>
          <PackageSearch size={34} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className={styles.formSection}>
        <div className={styles.ordersEmpty}>
          <PackageSearch size={34} />
          <h3>No orders found</h3>
          <p>Start shopping to see your orders here.</p>
          <Link href={ROUTES.PRODUCTS} className={styles.ordersBrowseLink}>Browse Products</Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.formSection}>
      <div className={styles.formSectionHead}>
        <span className={styles.sectionIcon}>
          <ShoppingBag size={28} />
        </span>
        <div>
          <h3>Order History</h3>
          <p>Track wholesale orders and repeat purchases</p>
        </div>
      </div>

      <div className={styles.ordersList}>
        {orders.map((order) => {
          const meta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.REQUESTED;
          const weights = orderWeightByMetal(order);
          const itemCount = orderDisplayItems(order).length;
          return (
            <article key={order.id} className={styles.orderRow}>
              <Link href={ROUTES.ORDER_DETAIL(order.id)} className={styles.orderRowLink}>
                <div className={styles.orderRowTop}>
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={[styles.orderStatusPill, styles[`orderStatusPill--${meta.tone}`]].join(' ')}>
                    {meta.label}
                  </span>
                </div>
                <div className={styles.orderRowBottom}>
                  <span>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                  {weights.map(([metalName, weight]) => (
                    <span key={metalName}>{metalName}: {formatWeight(weight)}</span>
                  ))}
                </div>
              </Link>
              {order.status === 'REQUESTED' ? (
                <button
                  type="button"
                  className={styles.orderCancelButton}
                  disabled={cancellingId === order.id}
                  onClick={(event) => cancelOrder(event, order)}
                >
                  <XCircle size={13} />
                  {cancellingId === order.id ? 'Cancelling' : 'Cancel'}
                </button>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

const formatMoneyINR = (value) =>
  `₹${Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const ledgerEntryMeta = (entry) => {
  if (entry.entryType === 'ADJUSTMENT') return { label: 'Due', tone: 'red' };
  if (entry.entryType === 'DELIVERY') return { label: 'Delivery', tone: 'red' };
  if (entry.collectionType === 'CASH') return { label: 'Cash', tone: 'amber' };
  if (entry.collectionType === 'METAL') return { label: 'Metal', tone: 'green' };
  return { label: entry.entryType?.replaceAll('_', ' ') ?? 'Entry', tone: 'neutral' };
};

// Delivery rows lead with the order number (that's what a shop looks for);
// collections get a plain heading and let the detail line carry the numbers.
const ledgerEntryTitle = (entry) => {
  if (entry.entryType === 'ADJUSTMENT') return 'Due added by admin';
  if (entry.entryType === 'DELIVERY') return entry.orderNumber || 'Delivery';
  if (entry.collectionType === 'CASH') return 'Cash collection';
  if (entry.collectionType === 'METAL') return 'Metal collection';
  return entry.description || 'Ledger entry';
};

const ledgerEntryDetail = (entry) => {
  const metal = entry.metal?.name ?? 'metal';
  if (entry.entryType === 'ADJUSTMENT') {
    const dueFine = Number(entry.debitFine ?? 0);
    const adminNote = entry.description ? ` · ${entry.description}` : '';
    return dueFine > 0.0005 ? `${formatWeight(dueFine)} fine ${metal} due added${adminNote}` : entry.description;
  }
  if (entry.entryType === 'DELIVERY') {
    return `${formatWeight(entry.debitFine)} fine ${metal} delivered`;
  }
  if (entry.collectionType === 'CASH') {
    return `${formatMoneyINR(entry.cashAmount)} received @ ${formatMoneyINR(entry.metalRate)}/10g → ${formatWeight(
      entry.fineCredit,
    )} fine ${metal}`;
  }
  if (entry.collectionType === 'METAL') {
    return `${formatWeight(entry.receivedQuantity)} ${metal} received`;
  }
  return null;
};

// A positive running balance means the shop still owes that much metal (Due);
// a negative one means they've deposited more than owed (Advance).
const ledgerBalance = (runningBalance) => {
  const value = Number(runningBalance ?? 0);
  if (value > 0.0005) return { label: 'Due', amount: formatWeight(value), tone: 'due' };
  if (value < -0.0005) return { label: 'Advance', amount: formatWeight(Math.abs(value)), tone: 'advance' };
  return { label: 'Cleared', amount: formatWeight(0), tone: 'cleared' };
};

const getAccountDueItems = (profile) => {
  const metalItems = (profile?.metalDues ?? [])
    .filter((metal) => Number(metal.dueGrams ?? 0) > 0.0005)
    .map((metal) => ({
      key: `metal-${metal.metalId ?? metal.code ?? metal.name}`,
      value: `${formatDueWeight(metal.dueGrams)} due`,
      label: metal.name || 'Metal',
      tone: String(metal.code || metal.name || 'metal').toLowerCase(),
      icon: Gem,
    }));

  const cashDue = Number(profile?.dueAmount ?? 0);
  const cashItems = cashDue > 0.005
    ? [{
      key: 'cash',
      value: `${formatMoneyINR(cashDue)} cash due`,
      label: 'Cash',
      tone: 'cash',
      icon: IndianRupee,
    }]
    : [];

  return [...metalItems, ...cashItems];
};

const getPrimaryLedgerSummary = (ledgerSummary = []) =>
  ledgerSummary.find((row) => row.code === 'GOLD') || ledgerSummary[0] || null;

function ShopIdentityCard({ values, profile, photoUrl, onPhotoClick, uploadingPhoto }) {
  return (
    <section className={styles.identityCard}>
      <div className={styles.shopPhotoWrap}>
        <div className={styles.shopPhoto} aria-hidden="true">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- shopkeeper profile photos can come from configured media storage
            <img src={photoUrl} alt="" />
          ) : (
            <>
              <div className={styles.shopCeiling} />
              <div className={styles.shopCounter} />
              <div className={styles.shopLights} />
            </>
          )}
        </div>
        <button
          className={styles.cameraButton}
          type="button"
          aria-label="Change shop photo"
          onClick={onPhotoClick}
          disabled={uploadingPhoto}
        >
          {uploadingPhoto ? <span className={styles.buttonSpinner} aria-hidden="true" /> : <Camera size={20} />}
        </button>
      </div>

      <div className={styles.identityCopy}>
        <h2>{values.shopName}</h2>
        <span
          className={[styles.verified, profile?.status !== 'APPROVED' && styles.verifiedPending]
            .filter(Boolean)
            .join(' ')}
        >
          {profile?.status === 'APPROVED' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
          {values.verificationStatus}
        </span>
        <p>
          <MapPin size={16} />
          {values.city && values.state ? `${values.city}, ${values.state}` : 'Location not added'}
        </p>
        <p>
          <CalendarDays size={16} />
          Member since {values.memberSince}
        </p>
      </div>
    </section>
  );
}

function AccountDueCards({ items, onClick }) {
  const Container = onClick ? 'button' : 'div';

  return (
    <Container type={onClick ? 'button' : undefined} className={styles.accountDueGrid} onClick={onClick}>
      {items.length ? items.map((item) => (
        <span
          key={item.key}
          className={[
            styles.accountDueMiniCard,
            styles[`accountDueMiniCard--${item.tone}`],
          ].filter(Boolean).join(' ')}
        >
          <span className={styles.accountDueIcon}>
            <item.icon size={16} />
          </span>
          <span className={styles.accountDueCopy}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </span>
        </span>
      )) : (
        <span className={[styles.accountDueMiniCard, styles.accountDueMiniCardEmpty].join(' ')}>
          <strong>No dues</strong>
          <span>(Account clear)</span>
        </span>
      )}
    </Container>
  );
}

function AccountHomePanel({
  values,
  profile,
  photoUrl,
  onPhotoClick,
  uploadingPhoto,
  dueItems,
  onNavigate,
}) {
  return (
    <section className={styles.accountHomePanel}>
      <ShopIdentityCard
        values={values}
        profile={profile}
        photoUrl={photoUrl}
        onPhotoClick={onPhotoClick}
        uploadingPhoto={uploadingPhoto}
      />

      <AccountDueCards items={dueItems} onClick={() => onNavigate('transactions')} />

      <nav className={styles.accountMenuPanel} aria-label="Account menu">
        {MENU_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={[styles.menuRow, index === 0 && styles.menuRowActive].filter(Boolean).join(' ')}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.menuIcon}>
                <Icon size={24} />
              </span>
              <span className={styles.menuCopy}>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <ChevronRight className={styles.chevron} size={21} />
            </button>
          );
        })}
      </nav>

      <section className={styles.securityPanel}>
        <LockKeyhole size={30} />
        <div>
          <h2>Your Information is Secure</h2>
          <p>Protected profile and transaction data.</p>
        </div>
      </section>
    </section>
  );
}

function TransactionsPanel({ dueItems = [] }) {
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metalFilter, setMetalFilter] = useState('all');

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await shopkeeperApi.getKhatabookLedger({ page: 1, pageSize: 50 });
        if (!alive) return;
        setEntries(response.data ?? []);
      } catch {
        if (alive) setError('Could not load your transactions. Refresh and try again.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const metals = useMemo(
    () => Array.from(new Map((entries ?? []).map((entry) => [entry.metal?.id, entry.metal])).values()).filter(Boolean),
    [entries],
  );
  const visibleEntries = useMemo(
    () => (metalFilter === 'all' ? entries ?? [] : (entries ?? []).filter((entry) => String(entry.metal?.id) === metalFilter)),
    [entries, metalFilter],
  );
  if (loading) {
    return <PanelRowsSkeleton rows={6} />;
  }

  if (error) {
    return (
      <section className={styles.formSection}>
        <div className={styles.ordersEmpty}>
          <IndianRupee size={34} />
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.formSection}>
      <div className={styles.formSectionHead}>
        <span className={styles.sectionIcon}>
          <IndianRupee size={28} />
        </span>
        <div>
          <h3>Transaction Ledger</h3>
          <p>Deliveries, collections and running balance on your account</p>
        </div>
        {metals.length > 1 ? (
          <select
            className={styles.ledgerMetalFilter}
            value={metalFilter}
            onChange={(event) => setMetalFilter(event.target.value)}
          >
            <option value="all">All Metals</option>
            {metals.map((metal) => (
              <option key={metal.id} value={String(metal.id)}>{metal.name}</option>
            ))}
          </select>
        ) : null}
      </div>

      <AccountDueCards items={dueItems} />

      {visibleEntries.length ? (
        <div className={styles.ordersList}>
          {visibleEntries.map((entry) => {
            const meta = ledgerEntryMeta(entry);
            const detail = ledgerEntryDetail(entry);
            const balance = ledgerBalance(entry.runningBalance);
            const isCredit = Number(entry.creditFine) > 0;
            const isDebit = Number(entry.debitFine) > 0;
            return (
              <div key={entry.id} className={styles.orderRow}>
                <div className={styles.orderRowTop}>
                  <div>
                    <strong>{ledgerEntryTitle(entry)}</strong>
                    <span>{formatDate(entry.entryDate)} · {entry.metal?.name ?? 'Metal'}</span>
                  </div>
                  <span className={[styles.orderStatusPill, styles[`orderStatusPill--${meta.tone}`]].join(' ')}>
                    {meta.label}
                  </span>
                </div>

                {detail ? <p className={styles.ledgerDetail}>{detail}</p> : null}

                <div className={styles.orderRowBottom}>
                  <span className={[styles.ledgerBalance, styles[`ledgerBalance--${balance.tone}`]].join(' ')}>
                    {balance.label === 'Cleared' ? 'Cleared' : `${balance.label}: ${balance.amount}`}
                  </span>
                  {isCredit ? (
                    <span className={styles.ledgerCredit}>+{formatWeight(entry.creditFine)}</span>
                  ) : isDebit ? (
                    <span className={styles.ledgerDebit}>-{formatWeight(entry.debitFine)}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.ordersEmpty}>
          <IndianRupee size={34} />
          <h3>No transactions yet</h3>
          <p>Deliveries and cash or metal collections against your account will show up here.</p>
        </div>
      )}
    </section>
  );
}

export default function ProfileClient({ initialTab = 'account' }) {
  const router = useRouter();
  const photoInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [editingSections, setEditingSections] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const [savingSection, setSavingSection] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ledgerSummary, setLedgerSummary] = useState([]);
  const [values, setValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');

  const activeMenu = useMemo(
    () => (activeTab === 'account' ? ACCOUNT_HOME : MENU_ITEMS.find((item) => item.id === activeTab) ?? ACCOUNT_HOME),
    [activeTab]
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      setLoadError('');

      const [profileResult, ledgerResult] = await Promise.allSettled([
        shopkeeperApi.getProfile(),
        shopkeeperApi.getLedgerSummary(),
      ]);

      if (!alive) return;

      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data;
        setProfile(data);
        setValues(mapProfileToValues(data));
      } else {
        setLoadError(extractMessage(profileResult.reason));
      }

      setLedgerSummary(ledgerResult.status === 'fulfilled' ? ledgerResult.value.data ?? [] : []);
      setLoading(false);
    };

    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => () => {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
  }, [photoPreviewUrl]);

  useEffect(() => {
    const resetToAccount = () => setActiveTab('account');
    window.addEventListener('ornacore:account-home', resetToAccount);
    return () => window.removeEventListener('ornacore:account-home', resetToAccount);
  }, []);

  const dueItems = useMemo(() => getAccountDueItems(profile), [profile]);
  const overview = useMemo(() => {
    const primary = getPrimaryLedgerSummary(ledgerSummary);
    if (!primary) return [];
    return [
      { label: `Current Due (${primary.name})`, value: `${primary.due} gm`, tone: 'warning' },
      { label: 'Delivered', value: `${primary.delivered} gm`, tone: 'success' },
      { label: 'Received', value: `${primary.received} gm`, tone: 'info' },
    ];
  }, [ledgerSummary]);
  const detailTab = activeTab === 'account' ? 'profile' : activeTab;

  const toggleEditing = async (sectionId) => {
    const isEditing = Boolean(editingSections[sectionId]);
    setSectionErrors((current) => ({ ...current, [sectionId]: '' }));

    if (!isEditing) {
      setEditingSections((current) => ({ ...current, [sectionId]: true }));
      return;
    }

    const buildPayload = SECTION_PAYLOAD_BUILDERS[sectionId];
    if (!buildPayload) {
      setEditingSections((current) => ({ ...current, [sectionId]: false }));
      return;
    }

    setSavingSection(sectionId);
    try {
      const response = await shopkeeperApi.updateProfile(buildPayload(values));
      // The PATCH response only carries the ShopkeeperProfile row itself —
      // not the nested user/addresses/metalCreditLimits includes getProfile()
      // returns — so merge onto what's already known rather than replacing
      // it outright, or saving one section would blank the others' display.
      const merged = { ...profile, ...response.data };
      setProfile(merged);
      setValues((current) => ({ ...current, ...mapProfileToValues(merged) }));
      setEditingSections((current) => ({ ...current, [sectionId]: false }));
    } catch (error) {
      setSectionErrors((current) => ({ ...current, [sectionId]: extractMessage(error) }));
    } finally {
      setSavingSection(null);
    }
  };

  const updateValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleAddressSaved = (address) => {
    const nextAddresses = [address];
    const merged = {
      ...profile,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addresses: nextAddresses,
    };
    setProfile(merged);
    setValues((current) => ({ ...current, ...mapProfileToValues(merged) }));
  };

  const openPhotoPicker = () => {
    if (photoUploading) return;
    photoInputRef.current?.click();
  };

  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || photoUploading) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return previewUrl;
    });
    setPhotoUploading(true);
    setPhotoError('');
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await shopkeeperApi.uploadProfilePhoto(formData);
      const updatedProfile = response.data;
      setProfile(updatedProfile);
      setValues((current) => ({ ...current, ...mapProfileToValues(updatedProfile) }));
      setPhotoPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return '';
      });
    } catch (error) {
      setPhotoPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return '';
      });
      setPhotoError(extractMessage(error));
    } finally {
      setPhotoUploading(false);
    }
  };

  // The account sub-views are in-page tabs, so back from one returns to the
  // Account overview. From the overview itself, back leaves Account for Home.
  const handleBack = () => {
    if (activeTab === 'account') {
      router.push(ROUTES.HOME);
    } else {
      setActiveTab('account');
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!values) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingState}>
          <AlertTriangle size={28} />
          <p>{loadError || 'Unable to load your shop profile.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <AccountHeader
        title={activeMenu.title}
        description={activeMenu.description}
        backLabel={activeMenu.title}
        onBack={handleBack}
        compactOnMobile
      />

      <input
        ref={photoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className={styles.photoInput}
        onChange={handleProfilePhotoChange}
      />

      {photoError ? (
        <div className={styles.photoError}>
          <AlertTriangle size={16} />
          <span>{photoError}</span>
        </div>
      ) : null}

      <div className={styles.mobileAccountShell}>
        {activeTab === 'account' ? (
          <AccountHomePanel
            values={values}
            profile={profile}
            photoUrl={photoPreviewUrl || profile?.profileImageUrl}
            onPhotoClick={openPhotoPicker}
            uploadingPhoto={photoUploading}
            dueItems={dueItems}
            onNavigate={setActiveTab}
          />
        ) : (
          <section className={[styles.detailPane, styles.detailPaneSingle].join(' ')}>
            {activeTab === 'profile' ? (
              FORM_SECTIONS.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  values={values}
                  editing={Boolean(editingSections[section.id])}
                  saving={savingSection === section.id}
                  errorMessage={sectionErrors[section.id]}
                  onEditToggle={toggleEditing}
                  onChange={updateValue}
                  onManageAddresses={() => setActiveTab('addresses')}
                />
              ))
            ) : activeTab === 'orders' ? (
              <OrdersPanel />
            ) : activeTab === 'transactions' ? (
              <TransactionsPanel dueItems={dueItems} />
            ) : (
              <AddressManagerPanel profile={profile} onSaved={handleAddressSaved} />
            )}
          </section>
        )}
      </div>

      <div className={[styles.workspace, styles.desktopAccountShell].join(' ')}>
        <aside className={styles.sidebar}>
          <ShopIdentityCard
            values={values}
            profile={profile}
            photoUrl={photoPreviewUrl || profile?.profileImageUrl}
            onPhotoClick={openPhotoPicker}
            uploadingPhoto={photoUploading}
          />

          {overview.length ? (
            <section className={styles.overviewStrip}>
              {overview.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong className={styles[item.tone]}>{item.value}</strong>
                </div>
              ))}
            </section>
          ) : null}

          <nav className={styles.menuPanel} aria-label="Profile menu">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = detailTab === item.id;
              const className = [styles.menuRow, isActive && styles.menuRowActive].filter(Boolean).join(' ');

              return (
                <button key={item.id} type="button" className={className} onClick={() => setActiveTab(item.id)}>
                  <span className={styles.menuIcon}>
                    <Icon size={24} />
                  </span>
                  <span className={styles.menuCopy}>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </span>
                  <ChevronRight className={styles.chevron} size={21} />
                </button>
              );
            })}
          </nav>

          <section className={styles.securityPanel}>
            <LockKeyhole size={30} />
            <div>
              <h2>Your Information is Secure</h2>
              <p>Protected profile and transaction data.</p>
            </div>
          </section>
        </aside>

        <section className={styles.detailPane}>
          {detailTab === 'profile' ? (
            FORM_SECTIONS.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                values={values}
                editing={Boolean(editingSections[section.id])}
                saving={savingSection === section.id}
                errorMessage={sectionErrors[section.id]}
                onEditToggle={toggleEditing}
                onChange={updateValue}
                onManageAddresses={() => setActiveTab('addresses')}
              />
            ))
          ) : detailTab === 'orders' ? (
            <OrdersPanel />
          ) : detailTab === 'transactions' ? (
            <TransactionsPanel dueItems={dueItems} />
          ) : (
            <AddressManagerPanel profile={profile} onSaved={handleAddressSaved} />
          )}
        </section>
      </div>
    </main>
  );
}
