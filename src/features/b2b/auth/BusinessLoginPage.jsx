'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Briefcase, Check } from 'lucide-react';
import { loginB2B } from '@/redux/actions/authActions';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import { ROUTES } from '@/constants/routes';
import styles from './BusinessLoginPage.module.scss';

const BENEFITS = [
  'Exclusive B2B Pricing',
  'Credit Facility & Khatabook',
  'Dedicated Account Manager',
  'Bulk Order Support',
];

export default function BusinessLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '' });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginB2B(form));
    if (loginB2B.fulfilled.match(result)) router.push(ROUTES.BUSINESS.DASHBOARD);
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        {/* Left: Benefits panel */}
        <div className={styles.left}>
          <div className={styles.leftContent}>
            <span className={styles.logoIcon}>✦</span>
            <h2 className={styles.leftTitle}>OrnaCo Business Platform</h2>
            <p className={styles.leftSub}>
              Grow your jewellery business with exclusive B2B tools, credit facility, and dedicated support.
            </p>
            <ul className={styles.benefits}>
              {BENEFITS.map((b) => (
                <li key={b} className={styles.benefit}>
                  <Check size={16} className={styles.checkIcon} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Login form */}
        <div className={styles.right}>
          <div className={styles.card}>
            <Briefcase size={32} className={styles.briefcaseIcon} />
            <h1 className={styles.title}>Business Login</h1>
            <p className={styles.subtitle}>Access your business dashboard</p>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Email or Mobile Number"
                type="text"
                placeholder="email@example.com or +91 98765 43210"
                icon={<Mail size={16} />}
                value={form.identifier}
                onChange={set('identifier')}
                required
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={<Lock size={16} />}
                iconRight={
                  <button type="button" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                value={form.password}
                onChange={set('password')}
                required
              />

              <Button type="submit" fullWidth loading={loading} size="lg">
                Login to Dashboard
              </Button>
            </form>

            <p className={styles.registerPrompt}>
              New Business Partner?{' '}
              <Link href={ROUTES.BUSINESS.REGISTER} className={styles.registerLink}>Register Now</Link>
            </p>

            <div className={styles.divider}><span>or</span></div>

            <Link href={ROUTES.LOGIN} className={styles.customerLink}>
              Customer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
