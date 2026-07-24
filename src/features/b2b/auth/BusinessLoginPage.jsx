'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  Tag,
  Truck,
  UserRound,
} from 'lucide-react';
import { loginB2B, loginB2BWithGoogle, loginB2BWithOtp } from '@/redux/actions/authActions';
import { ROUTES } from '@/constants/routes';
import { authApi } from '@/services/authApi';
import { fetchBranding } from '@/redux/slices/brandingSlice';
import styles from './BusinessLoginPage.module.scss';

const TRUST_ITEMS = [
  {
    title: 'Secure & Reliable',
    description: 'Bank-level security for your business data',
    icon: ShieldCheck,
  },
  {
    title: 'Best Wholesale Prices',
    description: 'Competitive pricing on gold, silver & diamonds',
    icon: Tag,
  },
  {
    title: 'Pan India Delivery',
    description: 'Fast and secure delivery across the country',
    icon: Truck,
  },
];

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const isPhoneInput = (value) => {
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.includes('@') && /^[+\d\s()-]+$/.test(trimmed);
};

const normalizeIdentifier = (value) => {
  if (!isPhoneInput(value)) return value.trim().toLowerCase();
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;
  return `+91${local.slice(0, 10)}`;
};

const formatIdentifierInput = (value) => {
  if (!isPhoneInput(value)) return value;
  const digits = value.replace(/\D/g, '');
  if (!digits) return value;
  const local = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;
  return local.slice(0, 10);
};

const nextRouteFor = (user) =>
  user?.shopkeeper?.status === 'APPROVED' ? ROUTES.HOME : ROUTES.BUSINESS.APPROVAL;

const subtitleForMode = (mode) => {
  if (mode === 'loginOtp') return 'Login with your one time password';
  if (mode === 'login') return 'Access your business dashboard';
  return 'Reset access to your business dashboard';
};

export default function BusinessLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);
  const { displayName, logo, status: brandingStatus } = useSelector((state) => state.branding);
  const googleButtonRef = useRef(null);
  const otpInputRefs = useRef([]);
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [otpLoginForm, setOtpLoginForm] = useState({
    identifier: '',
    code: ['', '', '', ''],
  });
  const [resetForm, setResetForm] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [otpLoginError, setOtpLoginError] = useState('');
  const [otpLoginMessage, setOtpLoginMessage] = useState('');
  const [otpLoginLoading, setOtpLoginLoading] = useState(false);
  const phoneMode = isPhoneInput(form.identifier);
  const resetPhoneMode = isPhoneInput(resetForm.identifier);
  const otpLoginCode = otpLoginForm.code.join('');
  const brandName = displayName?.trim() || 'OrnaCore';

  useEffect(() => {
    if (brandingStatus === 'idle') dispatch(fetchBranding());
  }, [brandingStatus, dispatch]);

  const set = (key) => (event) => {
    const value = key === 'identifier' ? formatIdentifierInput(event.target.value) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setReset = (key) => (event) => {
    let value = event.target.value;
    if (key === 'otp') value = value.replace(/\D/g, '').slice(0, 6);
    if (key === 'identifier') value = formatIdentifierInput(value);
    setResetForm((current) => ({ ...current, [key]: value }));
    setResetError('');
  };

  useEffect(() => {
    if (mode !== 'login') return;
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.__ornaGoogleLoginCallback = async (credentialResponse) => {
        if (!credentialResponse?.credential) return;
        const result = await dispatch(loginB2BWithGoogle({ idToken: credentialResponse.credential }));
        if (!loginB2BWithGoogle.fulfilled.match(result)) return;
        router.push(nextRouteFor(result.payload.user));
      };
      if (window.__ornaGoogleClientId !== GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (credentialResponse) => window.__ornaGoogleLoginCallback?.(credentialResponse),
        });
        window.__ornaGoogleClientId = GOOGLE_CLIENT_ID;
      }
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: Math.min(360, googleButtonRef.current.offsetWidth || 320),
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', initializeGoogle, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
  }, [dispatch, mode, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginB2B({
      ...form,
      identifier: normalizeIdentifier(form.identifier),
    }));
    if (!loginB2B.fulfilled.match(result)) return;

    router.push(nextRouteFor(result.payload.user));
  };

  const requestLoginOtp = async () => {
    const identifier = form.identifier.trim();
    if (!identifier) {
      setOtpLoginError('Enter email or mobile number first.');
      return;
    }

    setOtpLoginLoading(true);
    setOtpLoginError('');
    setOtpLoginMessage('');
    try {
      const response = await authApi.requestShopkeeperOtpLogin({
        identifier: normalizeIdentifier(identifier),
      });
      setOtpLoginForm({ identifier, code: ['', '', '', ''] });
      setOtpLoginMessage(`OTP sent to ${response.data?.destination || 'your registered email'}.`);
      setMode('loginOtp');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 60);
    } catch (requestError) {
      setOtpLoginError(requestError?.error?.message || requestError?.message || 'Unable to send OTP.');
    } finally {
      setOtpLoginLoading(false);
    }
  };

  const applyOtpDigits = (index, value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4 - index);
    if (!digits) {
      setOtpLoginForm((current) => {
        const code = [...current.code];
        code[index] = '';
        return { ...current, code };
      });
      return;
    }

    setOtpLoginForm((current) => {
      const code = [...current.code];
      digits.split('').forEach((digit, offset) => {
        code[index + offset] = digit;
      });
      return { ...current, code };
    });
    setOtpLoginError('');
    otpInputRefs.current[Math.min(index + digits.length, 3)]?.focus();
  };

  const setOtpDigit = (index) => (event) => {
    applyOtpDigits(index, event.target.value);
  };

  const pasteOtpDigits = (index) => (event) => {
    event.preventDefault();
    applyOtpDigits(index, event.clipboardData.getData('text'));
  };

  const handleOtpKeyDown = (index) => (event) => {
    if (event.key !== 'Backspace' || otpLoginForm.code[index]) return;
    otpInputRefs.current[Math.max(index - 1, 0)]?.focus();
  };

  const verifyLoginOtp = async (event) => {
    event.preventDefault();
    if (otpLoginCode.length !== 4) {
      setOtpLoginError('Enter the 4 digit OTP.');
      return;
    }

    setOtpLoginError('');
    const result = await dispatch(loginB2BWithOtp({
      identifier: normalizeIdentifier(otpLoginForm.identifier),
      otp: otpLoginCode,
    }));
    if (!loginB2BWithOtp.fulfilled.match(result)) return;

    router.push(nextRouteFor(result.payload.user));
  };

  const requestOtp = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');
    try {
      const response = await authApi.requestShopkeeperPasswordReset({
        identifier: normalizeIdentifier(resetForm.identifier),
      });
      setResetMessage(`OTP sent to ${response.data?.destination || 'your registered email'}.`);
      setMode('otp');
    } catch (requestError) {
      setResetError(requestError?.error?.message || requestError?.message || 'Unable to send OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError('');
    try {
      await authApi.verifyShopkeeperPasswordReset({
        identifier: normalizeIdentifier(resetForm.identifier),
        otp: resetForm.otp,
      });
      setResetMessage('OTP verified. Set your new password.');
      setMode('reset');
    } catch (requestError) {
      setResetError(requestError?.error?.message || requestError?.message || 'Invalid OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  const confirmReset = async (event) => {
    event.preventDefault();
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    try {
      await authApi.confirmShopkeeperPasswordReset({
        identifier: normalizeIdentifier(resetForm.identifier),
        otp: resetForm.otp,
        newPassword: resetForm.newPassword,
      });
      setForm((current) => ({
        ...current,
        identifier: resetForm.identifier,
        password: '',
      }));
      setResetMessage('Password changed. Login with your new password.');
      setMode('login');
    } catch (requestError) {
      setResetError(requestError?.error?.message || requestError?.message || 'Unable to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const backToLogin = () => {
    setMode('login');
    setResetError('');
    setResetMessage('');
    setOtpLoginError('');
    setOtpLoginMessage('');
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link href={ROUTES.HOME} className={styles.brand}>
          <span className={styles.brandMark}>
            {logo ? (
              <span
                className={styles.brandLogo}
                style={{ backgroundImage: `url(${logo})` }}
                aria-hidden="true"
              />
            ) : (
              <ShieldCheck size={36} />
            )}
          </span>
          <span>
            <strong>{brandName}</strong>
            <small>B2B Jewellery Platform</small>
          </span>
        </Link>

        <div className={styles.heroCopy}>
          <h1>
            Trusted by Jewellers.
            <span>Built for Business.</span>
          </h1>
          <i />
          <p>
            Join thousands of jewellery businesses across India who trust {brandName} for
            quality, pricing and reliability.
          </p>
        </div>

        <div className={styles.trustList}>
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={styles.trustItem}>
                <span>
                  <Icon size={24} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.jewelleryScene} aria-hidden="true">
          <div className={styles.bust} />
          <div className={styles.bangles} />
          <div className={styles.ring} />
        </div>
      </section>

      <section className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>
            <Store size={44} />
          </div>
          <h2>Business Login</h2>
          <p className={styles.subtitle}>{subtitleForMode(mode)}</p>

          {['login', 'loginOtp'].includes(mode) && error ? <div className={styles.errorAlert}>{error}</div> : null}
          {resetError ? <div className={styles.errorAlert}>{resetError}</div> : null}
          {resetMessage ? <div className={styles.successAlert}>{resetMessage}</div> : null}
          {otpLoginError ? <div className={styles.errorAlert}>{otpLoginError}</div> : null}
          {otpLoginMessage ? <div className={styles.successAlert}>{otpLoginMessage}</div> : null}

          {mode === 'login' && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Email or Mobile Number</span>
              <span className={styles.inputShell}>
                <UserRound size={22} />
                {phoneMode ? <b className={styles.countryCode}>+91</b> : null}
                <input
                  type="text"
                  value={form.identifier}
                  onChange={set('identifier')}
                  placeholder={phoneMode ? '98765 43210' : 'email@example.com or mobile number'}
                  autoComplete="username"
                  required
                />
              </span>
            </label>

            <label className={styles.field}>
              <span>Password</span>
              <span className={styles.inputShell}>
                <Lock size={22} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  className={styles.eyeButton}
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>

            <div className={styles.loginLinks}>
              <button type="button" onClick={requestLoginOtp} disabled={otpLoginLoading}>
                {otpLoginLoading ? 'Sending...' : 'Send OTP'}
              </button>
              <button type="button" onClick={() => {
                setResetForm((current) => ({ ...current, identifier: form.identifier }));
                setMode('forgot');
              }}>
                Forgot Password?
              </button>
            </div>

            <button className={styles.submitButton} type="submit" disabled={loading}>
              <Lock size={22} />
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>

            <div className={styles.divider}><span>or</span></div>

            {GOOGLE_CLIENT_ID ? (
              <div className={styles.googleButton} ref={googleButtonRef} />
            ) : (
              <button className={styles.googleFallback} type="button" disabled>
                <span>G</span>
                Google login not configured
              </button>
            )}
          </form>
          )}

          {mode === 'loginOtp' && (
            <form className={styles.form} onSubmit={verifyLoginOtp}>
              <button type="button" className={styles.backInline} onClick={backToLogin}>
                <ArrowLeft size={16} /> Back to login
              </button>
              <div className={styles.otpBlock}>
                <span>Enter OTP</span>
                <div className={styles.otpBoxes}>
                  {otpLoginForm.code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpInputRefs.current[index] = element;
                      }}
                      className={styles.otpBox}
                      type="text"
                      value={digit}
                      onChange={setOtpDigit(index)}
                      onPaste={pasteOtpDigits(index)}
                      onKeyDown={handleOtpKeyDown(index)}
                      inputMode="numeric"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      aria-label={`OTP digit ${index + 1}`}
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>
              <button className={styles.submitButton} type="submit" disabled={loading}>
                <CheckCircle2 size={22} />
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button className={styles.resendButton} type="button" onClick={requestLoginOtp} disabled={otpLoginLoading}>
                {otpLoginLoading ? 'Sending OTP...' : 'Send OTP again'}
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form className={styles.form} onSubmit={requestOtp}>
              <button type="button" className={styles.backInline} onClick={backToLogin}>
                <ArrowLeft size={16} /> Back to login
              </button>
              <label className={styles.field}>
                <span>Email or Mobile Number</span>
                <span className={styles.inputShell}>
                  <Mail size={22} />
                  {resetPhoneMode ? <b className={styles.countryCode}>+91</b> : null}
                  <input
                    type="text"
                    value={resetForm.identifier}
                    onChange={setReset('identifier')}
                    placeholder={resetPhoneMode ? '98765 43210' : 'registered email or mobile'}
                    autoComplete="username"
                    required
                  />
                </span>
              </label>
              <button className={styles.submitButton} type="submit" disabled={resetLoading}>
                {resetLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {mode === 'otp' && (
            <form className={styles.form} onSubmit={verifyOtp}>
              <button type="button" className={styles.backInline} onClick={backToLogin}>
                <ArrowLeft size={16} /> Back to login
              </button>
              <label className={styles.field}>
                <span>Enter OTP</span>
                <span className={styles.inputShell}>
                  <CheckCircle2 size={22} />
                  <input
                    type="text"
                    value={resetForm.otp}
                    onChange={setReset('otp')}
                    placeholder="6 digit OTP"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </span>
              </label>
              <button className={styles.submitButton} type="submit" disabled={resetLoading}>
                {resetLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form className={styles.form} onSubmit={confirmReset}>
              <button type="button" className={styles.backInline} onClick={backToLogin}>
                <ArrowLeft size={16} /> Back to login
              </button>
              <label className={styles.field}>
                <span>New Password</span>
                <span className={styles.inputShell}>
                  <Lock size={22} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={resetForm.newPassword}
                    onChange={setReset('newPassword')}
                    placeholder="Create new password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    className={styles.eyeButton}
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </span>
              </label>
              <label className={styles.field}>
                <span>Confirm Password</span>
                <span className={styles.inputShell}>
                  <Lock size={22} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={resetForm.confirmPassword}
                    onChange={setReset('confirmPassword')}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                  />
                </span>
              </label>
              <button className={styles.submitButton} type="submit" disabled={resetLoading}>
                {resetLoading ? 'Saving...' : 'Save New Password'}
              </button>
            </form>
          )}

          {mode === 'login' ? <p className={styles.registerPrompt}>
            New Business Partner?{' '}
            <Link href={ROUTES.BUSINESS.REGISTER}>Register Now</Link>
          </p> : null}
        </div>
      </section>
    </main>
  );
}
