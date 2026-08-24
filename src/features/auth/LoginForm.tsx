import { isAxiosError } from 'axios';
import { motion, useReducedMotion } from 'framer-motion';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/authStore';

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.25,
      ease: 'easeOut' as const,
    },
  }),
};

export function LoginForm(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const triggerShake = (): void => {
    if (prefersReducedMotion) return;
    setShakeForm(true);
    window.setTimeout(() => setShakeForm(false), 500);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) nextErrors.username = 'Username is required';
    if (!password.trim()) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      navigate(from ?? '/dashboard', { replace: true });
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ??
          'Invalid username or password.'
        : 'Unable to sign in. Please try again.';
      toast({ title: 'Login failed', description: message, variant: 'error' });
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10 md:px-12 lg:px-16 xl:px-20">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm"
      >
        <h1 className="font-display text-3xl font-semibold tracking-display text-foreground">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your DummyJSON credentials (e.g. emilys / emilyspass).
        </p>

        <motion.form
          className="mt-8 space-y-4"
          onSubmit={handleSubmit}
          noValidate
          animate={
            shakeForm && !prefersReducedMotion
              ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.45 }}
        >
          <motion.div
            custom={0}
            variants={prefersReducedMotion ? undefined : fieldVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            <Input
              label="Username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              error={errors.username}
              disabled={isSubmitting}
            />
          </motion.div>

          <motion.div
            custom={1}
            variants={prefersReducedMotion ? undefined : fieldVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
              disabled={isSubmitting}
            />
          </motion.div>

          <motion.div
            custom={2}
            variants={prefersReducedMotion ? undefined : fieldVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? undefined : 'visible'}
          >
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
}
