'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Map,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Store,
  UsersRound,
  UserRound,
} from 'lucide-react';
import { registerB2B } from '@/redux/actions/authActions';
import { ROUTES } from '@/constants/routes';
import { fetchCurrentAddress, LocationPermissionDeniedError } from '@/services/locationService';
import styles from './BusinessRegisterPage.module.scss';

const INITIAL_FORM = {
  ownerName: '',
  shopName: '',
  email: '',
  mobile: '',
  password: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
  // Captured silently from "Use current location" — sent to the backend but
  // never rendered as a field. Dropped the moment the address is hand-edited
  // afterward, since it may no longer match the typed text.
  latitude: null,
  longitude: null,
};

const FEATURES = [
  {
    title: 'Trusted & Secure',
    description: 'Your data is protected with bank-level security.',
    icon: ShieldCheck,
  },
  {
    title: 'Built for Jewellers',
    description: 'Powerful tools designed for your business.',
    icon: UsersRound,
  },
  {
    title: 'Grow Your Business',
    description: 'Manage orders, customers and finances in one place.',
    icon: BarChart3,
  },
];

function Field({ number, label, required, icon: Icon, children, hint }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {number}. {label} {required ? <em>*</em> : null}
      </span>
      <span className={styles.inputShell}>
        <Icon size={18} />
        {children}
      </span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}

export default function BusinessRegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [locating, setLocating] = useState(false);

  const set = (key) => (event) => {
    setValidationError('');
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [key]: value,
      // A manual edit to the address text means it may no longer match the
      // coordinates captured via "Use current location" — drop them rather
      // than send stale coordinates alongside a hand-typed address.
      ...(key === 'addressLine1' ? { latitude: null, longitude: null } : null),
    }));
  };

  const useCurrentLocation = async () => {
    if (locating) return;
    setValidationError('');
    setLocating(true);
    try {
      const address = await fetchCurrentAddress();
      setForm((current) => ({
        ...current,
        addressLine1: address.addressLine || current.addressLine1,
        city: address.city || current.city,
        state: address.state || current.state,
        pincode: address.pincode || current.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
      }));
    } catch (locationError) {
      setValidationError(
        locationError instanceof LocationPermissionDeniedError
          ? 'Location permission denied — allow access or enter your address manually.'
          : locationError.message || 'Could not fetch your location. Please enter your address manually.',
      );
    } finally {
      setLocating(false);
    }
  };

  const validate = () => {
    if (!form.ownerName.trim()) return 'Owner name is required';
    if (!form.shopName.trim()) return 'Shop name is required';
    if (!form.mobile.trim()) return 'Mobile number is required';
    if (!form.email.trim()) return 'Email address is required';
    if (!form.password) return 'Password is required';
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      return 'Password must include uppercase, lowercase and a number';
    }
    if (!form.addressLine1.trim()) return 'Shop address is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.state.trim()) return 'State is required';
    if (!/^\d{4,6}$/.test(form.pincode.trim())) return 'Pincode must be 4 to 6 digits';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = validate();
    if (message) {
      setValidationError(message);
      return;
    }

    const result = await dispatch(registerB2B({
      ownerName: form.ownerName.trim(),
      shopName: form.shopName.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      password: form.password,
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      businessType: 'B2B Jewellery Retailer',
      ...(form.latitude != null ? { latitude: form.latitude } : null),
      ...(form.longitude != null ? { longitude: form.longitude } : null),
    }));

    // The backend authenticates the shop immediately on registration (it's
    // just not APPROVED yet), so there's no separate login step — go
    // straight to the approval screen, same as the mobile app does.
    if (registerB2B.fulfilled.match(result)) router.push(ROUTES.BUSINESS.APPROVAL);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href={ROUTES.HOME} className={styles.brand}>
          <span className={styles.brandMark}>
            <ShieldCheck size={28} />
          </span>
          <span>
            <strong>Akash Jewellers</strong>
            <small>B2B Jewellery Platform</small>
          </span>
        </Link>
        <div className={styles.loginPrompt}>
          <span>Already have an account?</span>
          <Link href={ROUTES.BUSINESS.LOGIN}>Login</Link>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidePanel}>
          <div className={styles.sideCopy}>
            <h1>
              Join <span>Akash Jewellers</span>
            </h1>
            <p>B2B Jewellery Platform</p>
            <i />
          </div>

          <p className={styles.sideIntro}>
            Create your shop account and connect with trusted jewellery businesses across India.
          </p>

          <div className={styles.featureList}>
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className={styles.featureItem}>
                  <span>
                    <Icon size={23} />
                  </span>
                  <div>
                    <strong>{feature.title}</strong>
                    <p>{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={styles.jewelleryStage} aria-hidden="true">
            <div className={styles.necklaceBust} />
            <div className={styles.earringStand} />
            <div className={styles.bangles} />
            <div className={styles.ringGem} />
          </div>
        </aside>

        <section className={styles.formCard}>
          <div className={styles.formHeading}>
            <span className={styles.headingIcon}>
              <Store size={30} />
            </span>
            <div>
              <h2>Register Your Shop</h2>
              <p>Fill in the details below to create your shop account</p>
            </div>
          </div>

          <button
            className={styles.locationBanner}
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
          >
            <MapPin size={24} />
            <strong>{locating ? 'Fetching your location…' : 'Use current location'}</strong>
            <span>Auto-fill address, city, state and pincode</span>
          </button>

          {(validationError || error) ? (
            <div className={styles.errorAlert}>{validationError || error}</div>
          ) : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.twoCol}>
              <Field number="1" label="Owner Name" required icon={UserRound}>
                <input value={form.ownerName} onChange={set('ownerName')} placeholder="Enter owner name" />
              </Field>

              <Field number="2" label="Shop Name" required icon={Store}>
                <input value={form.shopName} onChange={set('shopName')} placeholder="Enter shop name" />
              </Field>

              <Field number="3" label="Mobile Number" required icon={Phone}>
                <span className={styles.phonePrefix}>+91</span>
                <input value={form.mobile} onChange={set('mobile')} inputMode="tel" placeholder="Enter mobile number" />
              </Field>

              <Field number="4" label="Email Address" required icon={Mail}>
                <input value={form.email} onChange={set('email')} type="email" placeholder="Enter email address" />
              </Field>
            </div>

            <Field
              number="5"
              label="Password"
              required
              icon={Lock}
              hint="Minimum 8 characters with uppercase, lowercase and a number"
            >
              <input
                value={form.password}
                onChange={set('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
              />
              <button className={styles.peekButton} type="button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            <label className={[styles.field, styles.addressField].join(' ')}>
              <span className={styles.label}>6. Shop Address <em>*</em></span>
              <span className={styles.textareaShell}>
                <MapPin size={18} />
                <textarea
                  value={form.addressLine1}
                  onChange={set('addressLine1')}
                  rows={3}
                  placeholder="Enter shop address"
                />
                <button type="button" onClick={useCurrentLocation} disabled={locating}>
                  <Navigation size={16} />
                  {locating ? 'Locating…' : 'Use current location'}
                </button>
              </span>
              <span className={styles.mutedHint}>Max 3 lines</span>
            </label>

            <div className={styles.threeCol}>
              <Field number="7" label="City" required icon={Building2}>
                <input value={form.city} onChange={set('city')} placeholder="Enter city" />
              </Field>

              <Field number="8" label="State" required icon={Map}>
                <input value={form.state} onChange={set('state')} placeholder="Enter state" />
              </Field>

              <Field
                number="9"
                label="Pincode"
                required
                icon={BriefcaseBusiness}
                hint="Minimum 4 digits, Maximum 6 digits"
              >
                <input
                  value={form.pincode}
                  onChange={set('pincode')}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter pincode"
                />
                <span className={styles.counter}>{form.pincode.length} / 6</span>
              </Field>
            </div>

            <section className={styles.securityCard}>
              <span className={styles.lockShield}>
                <Lock size={30} />
              </span>
              <div>
                <h3>Your Information is Secure</h3>
                <p>We use advanced encryption and security measures to protect your data and keep your business safe.</p>
              </div>
              <div className={styles.safeBox} aria-hidden="true">
                <ShieldCheck size={34} />
                <span />
              </div>
            </section>

            <button className={styles.submitButton} type="submit" disabled={loading}>
              <Store size={21} />
              {loading ? 'Registering...' : 'Register Shop'}
            </button>
          </form>

          <p className={styles.terms}>
            By registering, you agree to our <Link href={ROUTES.HOME}>Terms & Conditions</Link> and{' '}
            <Link href={ROUTES.HOME}>Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
