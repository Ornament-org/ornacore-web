'use client';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { User, Mail, Lock, Phone } from 'lucide-react';
import styles from './RegisterPage.module.scss';

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span style={{ color: '#b8860b', fontSize: '1.75rem' }}>✦</span>
          <div>
            <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 700, letterSpacing: '0.15em', lineHeight: 1 }}>ORNACORE</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.65rem', color: '#b8860b', fontStyle: 'italic', letterSpacing: '0.1em' }}>Timeless Elegance</p>
          </div>
        </div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join OrnaCo for an exclusive jewellery experience</p>

        <form className={styles.form}>
          <Input label="Full Name" type="text" placeholder="Your name" icon={<User size={16} />} />
          <Input label="Email Address" type="email" placeholder="you@example.com" icon={<Mail size={16} />} />
          <Input label="Mobile Number" type="tel" placeholder="+91 98765 43210" icon={<Phone size={16} />} />
          <Input label="Password" type="password" placeholder="Create a strong password" icon={<Lock size={16} />} />
          <Button type="submit" fullWidth size="lg">Create Account</Button>
        </form>

        <p className={styles.switchPrompt}>
          Already have an account? <Link href={ROUTES.LOGIN} style={{ color: '#b8860b', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
