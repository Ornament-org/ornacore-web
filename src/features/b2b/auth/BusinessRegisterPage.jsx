'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Store, Mail, Phone, Lock, MapPin, FileText, Briefcase } from 'lucide-react';
import { registerB2B } from '@/redux/actions/authActions';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import { ROUTES } from '@/constants/routes';
import styles from './BusinessRegisterPage.module.scss';

const STEPS = ['Account', 'Shop Details', 'Address'];

const INITIAL_FORM = {
  ownerName: '',
  shopName: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
  gstNumber: '',
  businessType: '',
};

export default function BusinessRegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((s) => s.auth);

  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [validationError, setValidationError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => {
    setValidationError('');
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.ownerName.trim()) return 'Owner name is required';
      if (!form.email.trim() && !form.mobile.trim()) return 'Email or mobile number is required';
      if (!form.password) return 'Password is required';
      if (form.password.length < 8) return 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword) return 'Passwords do not match';
    }
    if (step === 1) {
      if (!form.shopName.trim()) return 'Shop name is required';
    }
    if (step === 2) {
      if (!form.addressLine1.trim()) return 'Address is required';
      if (!form.city.trim()) return 'City is required';
      if (!form.state.trim()) return 'State is required';
      if (!form.pincode.trim()) return 'Pincode is required';
    }
    return '';
  };

  const handleNext = (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setValidationError(err); return; }
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) { setValidationError(err); return; }

    // Build payload — only send fields the backend expects
    const payload = {
      ownerName: form.ownerName.trim(),
      shopName: form.shopName.trim(),
      password: form.password,
      addressLine1: form.addressLine1.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      ...(form.email.trim() && { email: form.email.trim() }),
      ...(form.mobile.trim() && { mobile: form.mobile.trim() }),
      ...(form.gstNumber.trim() && { gstNumber: form.gstNumber.trim() }),
      ...(form.businessType.trim() && { businessType: form.businessType.trim() }),
    };

    const result = await dispatch(registerB2B(payload));
    if (registerB2B.fulfilled.match(result)) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.title}>Registration Submitted!</h2>
          <p className={styles.subtitle}>
            Your business registration is under review. Our team will verify your details and approve your account within 1–2 business days.
          </p>
          <Link href={ROUTES.BUSINESS.LOGIN} className={styles.loginLink}>
            Back to Business Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Left panel */}
        <div className={styles.left}>
          <div className={styles.leftContent}>
            <span className={styles.logoIcon}>✦</span>
            <h2 className={styles.leftTitle}>Become an OrnaCo Partner</h2>
            <p className={styles.leftSub}>
              Join 1,000+ jewellery businesses growing with OrnaCo&apos;s B2B platform.
            </p>
            <div className={styles.stepList}>
              {STEPS.map((label, i) => (
                <div key={label} className={[styles.stepItem, i <= step && styles['stepItem--done']].filter(Boolean).join(' ')}>
                  <span className={styles.stepDot}>{i < step ? '✓' : i + 1}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className={styles.right}>
          <div className={styles.card}>
            <Briefcase size={28} className={styles.briefcaseIcon} />
            <h1 className={styles.title}>Business Registration</h1>
            <p className={styles.subtitle}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

            {/* Progress bar */}
            <div className={styles.progress}>
              <div className={styles.progressBar} style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>

            {(error || validationError) && (
              <div className={styles.errorAlert}>{validationError || error}</div>
            )}

            <form onSubmit={step < STEPS.length - 1 ? handleNext : handleSubmit} className={styles.form}>

              {/* Step 0: Account */}
              {step === 0 && (
                <>
                  <Input
                    label="Owner / Proprietor Name *"
                    placeholder="Full name"
                    icon={<User size={16} />}
                    value={form.ownerName}
                    onChange={set('ownerName')}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="business@example.com"
                    icon={<Mail size={16} />}
                    value={form.email}
                    onChange={set('email')}
                    hint="Email or mobile is required"
                  />
                  <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="+91 98765 43210"
                    icon={<Phone size={16} />}
                    value={form.mobile}
                    onChange={set('mobile')}
                  />
                  <Input
                    label="Password *"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    icon={<Lock size={16} />}
                    iconRight={
                      <button type="button" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                    value={form.password}
                    onChange={set('password')}
                  />
                  <Input
                    label="Confirm Password *"
                    type="password"
                    placeholder="Re-enter password"
                    icon={<Lock size={16} />}
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                  />
                </>
              )}

              {/* Step 1: Shop Details */}
              {step === 1 && (
                <>
                  <Input
                    label="Shop / Business Name *"
                    placeholder="e.g. Rajesh Jewellers"
                    icon={<Store size={16} />}
                    value={form.shopName}
                    onChange={set('shopName')}
                  />
                  <Input
                    label="GST Number"
                    placeholder="22AAAAA0000A1Z5"
                    icon={<FileText size={16} />}
                    value={form.gstNumber}
                    onChange={set('gstNumber')}
                    hint="Optional but recommended"
                  />
                  <div className={styles.field}>
                    <label className={styles.label}>Business Type</label>
                    <select
                      className={styles.select}
                      value={form.businessType}
                      onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
                    >
                      <option value="">Select type (optional)</option>
                      <option value="retailer">Retailer</option>
                      <option value="wholesaler">Wholesaler</option>
                      <option value="manufacturer">Manufacturer</option>
                      <option value="distributor">Distributor</option>
                    </select>
                  </div>
                </>
              )}

              {/* Step 2: Address */}
              {step === 2 && (
                <>
                  <Input
                    label="Shop Address *"
                    placeholder="House/Shop no., Street, Area"
                    icon={<MapPin size={16} />}
                    value={form.addressLine1}
                    onChange={set('addressLine1')}
                  />
                  <div className={styles.row}>
                    <Input
                      label="City *"
                      placeholder="Mumbai"
                      value={form.city}
                      onChange={set('city')}
                    />
                    <Input
                      label="Pincode *"
                      placeholder="400001"
                      value={form.pincode}
                      onChange={set('pincode')}
                    />
                  </div>
                  <Input
                    label="State *"
                    placeholder="Maharashtra"
                    value={form.state}
                    onChange={set('state')}
                  />
                </>
              )}

              <div className={styles.navRow}>
                {step > 0 && (
                  <button type="button" className={styles.backBtn} onClick={handleBack}>
                    ← Back
                  </button>
                )}
                <Button
                  type="submit"
                  fullWidth={step === 0}
                  loading={loading}
                  size="lg"
                  className={step > 0 ? styles.nextBtnRight : ''}
                >
                  {step < STEPS.length - 1 ? 'Next →' : 'Submit Registration'}
                </Button>
              </div>
            </form>

            <p className={styles.loginPrompt}>
              Already registered?{' '}
              <Link href={ROUTES.BUSINESS.LOGIN} className={styles.loginLink}>Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
