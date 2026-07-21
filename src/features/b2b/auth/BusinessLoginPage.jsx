'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Store,
  Tag,
  Truck,
  UserRound,
} from 'lucide-react';
import { loginB2B } from '@/redux/actions/authActions';
import { ROUTES } from '@/constants/routes';
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

export default function BusinessLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '' });

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginB2B(form));
    if (!loginB2B.fulfilled.match(result)) return;

    const isApproved = result.payload.user?.shopkeeper?.status === 'APPROVED';
    router.push(isApproved ? ROUTES.HOME : ROUTES.BUSINESS.APPROVAL);
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <Link href={ROUTES.HOME} className={styles.brand}>
          <span className={styles.brandMark}>
            <ShieldCheck size={36} />
          </span>
          <span>
            <strong>Akash Jewellers</strong>
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
            Join thousands of jewellery businesses across India who trust Akash Jewellers for
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
          <p className={styles.subtitle}>Access your business dashboard</p>

          {error ? <div className={styles.errorAlert}>{error}</div> : null}

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Email or Mobile Number</span>
              <span className={styles.inputShell}>
                <UserRound size={22} />
                <input
                  type="text"
                  value={form.identifier}
                  onChange={set('identifier')}
                  placeholder="email@example.com or +91 98765 43210"
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

            <Link href="/forgot-password" className={styles.forgotLink}>
              Forgot Password?
            </Link>

            <button className={styles.submitButton} type="submit" disabled={loading}>
              <Lock size={22} />
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>

          <p className={styles.registerPrompt}>
            New Business Partner?{' '}
            <Link href={ROUTES.BUSINESS.REGISTER}>Register Now</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
