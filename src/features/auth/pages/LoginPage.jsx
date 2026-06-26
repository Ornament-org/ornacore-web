'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { loginB2C } from '@/redux/actions/authActions';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import { ROUTES } from '@/constants/routes';
import styles from './LoginPage.module.scss';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginB2C(form));
    if (loginB2C.fulfilled.match(result)) router.push(ROUTES.HOME);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <div>
            <p className={styles.logoMain}>ORNACORE</p>
            <p className={styles.logoSub}>Timeless Elegance</p>
          </div>
        </div>

        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={16} />}
            value={form.email}
            onChange={set('email')}
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

          <div className={styles.forgotRow}>
            <Link href="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>

        <p className={styles.switchPrompt}>
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.REGISTER} className={styles.switchLink}>Register Now</Link>
        </p>

        <div className={styles.divider}><span>or</span></div>

        <Link href={ROUTES.BUSINESS.LOGIN} className={styles.b2bLink}>
          <span>Business Partner Login</span>
        </Link>
      </div>
    </div>
  );
}
