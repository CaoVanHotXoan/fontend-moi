import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { BACKEND_URL } from '@/services/api';
import styles from './login.module.css';
import Head from "next/head";

type FormMode = 'login' | 'register' | 'forgot_password';
type FormStep = 'form' | 'otp';
type ResponseData = { message?: string; token?: string; user?: UserProfile };

const API_BASE = `${BACKEND_URL}/auth`;

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useAuth();
  const { addToast } = useToast();
  const [mode, setMode] = useState<FormMode>('login');
  const [step, setStep] = useState<FormStep>('form');
  const [account, setAccount] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode: FormMode) => {
    setMode(newMode);
    setStep('form');
    setAccount('');
    setUsername('');
    setFullName('');
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
  };

  const request = async (endpoint: string, body: Record<string, string>, onSuccess: (data: ResponseData) => void | Promise<void>) => {
    setLoading(true);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
        signal: controller.signal
      });
      
      const responseText = await response.text();
      let data: ResponseData = {};
      try {
        data = responseText ? JSON.parse(responseText) as ResponseData : {};
      } catch {
        throw new Error(response.ok ? 'Máy chủ trả về dữ liệu không hợp lệ.' : `Máy chủ trả lỗi HTTP ${response.status}. Hãy kiểm tra backend đang chạy.`);
      }
      if (!response.ok) throw new Error(data.message || 'Có lỗi xảy ra.');
      await onSuccess(data);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') {
        setError('Máy chủ phản hồi quá lâu. Vui lòng thử lại sau ít giây.');
        addToast('Máy chủ phản hồi quá lâu. Vui lòng thử lại.', 'warning');
      } else {
        const msg = requestError instanceof Error ? requestError.message : 'Không thể kết nối máy chủ.';
        setError(msg);
        addToast(msg, 'error');
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');
    const email = account.trim().toLowerCase();

    if (mode === 'login') {
      if (!account.trim() || !password) {
        setError('Vui lòng nhập tài khoản và mật khẩu.');
        return;
      }
      await request('/login', { tenDangNhap: account.trim(), password }, async (data) => {
        if (!data.token || !data.user) {
          throw new Error('Máy chủ chưa trả về phiên đăng nhập hợp lệ.');
        }
        loginUser(data.token, data.user);
        const returnUrl = typeof router.query.returnUrl === 'string' && router.query.returnUrl.startsWith('/')
          ? router.query.returnUrl
          : null;
        const destination = returnUrl || (data.user.role?.toLowerCase() === 'admin' || data.user.roleId === 1
          ? '/DatabaseDashboard/DatabaseDashboard'
          : '/');
        await router.replace(destination);
      });
      return;
    }

    if (step === 'form') {
      if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
        setError('Vui lòng nhập địa chỉ Gmail hợp lệ.');
        return;
      }
      if (mode === 'register' && (!username.trim() || !fullName.trim() || password.length < 6 || password !== confirmPassword)) {
        setError(password !== confirmPassword ? 'Mật khẩu xác nhận không khớp.' : 'Vui lòng nhập đủ thông tin, mật khẩu tối thiểu 6 ký tự.');
        return;
      }
      if (mode === 'forgot_password' && password.length < 6) {
        setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      const endpoint = mode === 'register' ? '/register/request-otp' : '/password/forgot/request-otp';
      const requestBody: Record<string, string> = mode === 'register'
        ? { email, username: username.trim(), fullName: fullName.trim() }
        : { email };
      await request(endpoint, requestBody, (data) => {
        setStep('otp');
        setSuccessMsg(data.message || 'Mã xác nhận đã được gửi.');
      });
      return;
    }

    const endpoint = mode === 'register' ? '/register/verify' : '/password/forgot/reset';
    const body: Record<string, string> = mode === 'register'
      ? { email, otp, username: username.trim(), fullName: fullName.trim(), password }
      : { email, otp, newPassword: password };
    await request(endpoint, body, () => {
      setSuccessMsg(mode === 'register' ? 'Đăng ký thành công. Bạn có thể đăng nhập.' : 'Đổi mật khẩu thành công.');
      setTimeout(() => switchMode('login'), 1200);
    });
  };

  return (
    <div className={styles['login-container']}>
      <Head>
        <title>Đăng nhập | WebXe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <button 
        className={styles['back-btn']} 
        onClick={() => router.back()}
        type="button"
        title="Quay lại trang trước"
      >
        <span className={styles['back-icon']}>&larr;</span> Quay lại
      </button>
      {/* Khung chung mô phỏng bố cục ảnh mẫu */}
      <div className={styles['login-layout']}>
        {/* Minh họa ô tô */}
        <div className={styles['car-illustration']} aria-hidden="true">
          <img className={styles['login-car-image']} src="/images/login-car.png" alt="" />
          <span className={styles['logo-cover']} />
          <p className={styles['car-caption']}>DRIVE YOUR DREAM</p>
        </div>

        <div className={styles['form-side']}>
          <div className={styles['glass-panel']}>
            <h2 className={styles.title}>{mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Khôi phục mật khẩu'}</h2>
            {successMsg && <div className={styles['success-message']}>{successMsg}</div>}
            <form onSubmit={submit}>
              {mode === 'register' && step === 'form' && <>
                <div className={styles['input-group']}><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Họ và tên" className={styles['input-field']} /></div>
                <div className={styles['input-group']}><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Tên đăng nhập" className={styles['input-field']} /></div>
              </>}
              <div className={styles['input-group']}><input value={account} onChange={(event) => setAccount(event.target.value)} placeholder={mode === 'login' ? 'Email hoặc tên đăng nhập' : 'Gmail'} className={styles['input-field']} disabled={step === 'otp'} /></div>
              {step === 'otp' && <div className={styles['input-group']}><input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Mã xác nhận 6 chữ số" className={styles['input-field']} inputMode="numeric" maxLength={6} /></div>}
              {(mode === 'login' || step === 'form') && <div className={styles['input-group']}><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={mode === 'forgot_password' ? 'Mật khẩu mới' : 'Mật khẩu'} className={styles['input-field']} /></div>}
              {mode === 'register' && step === 'form' && <div className={styles['input-group']}><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Xác nhận mật khẩu" className={styles['input-field']} /></div>}
              {error && <div className={styles['error-text']}>{error}</div>}
              {mode === 'login' && <div style={{ textAlign: 'right', marginTop: '0.5rem', marginBottom: '1rem' }}><button type="button" onClick={() => switchMode('forgot_password')} className={styles['forgot-password-link']}>Quên mật khẩu?</button></div>}
              <button type="submit" className={styles['action-btn']} disabled={loading}>{loading ? 'Đang xử lý...' : step === 'otp' ? 'Xác nhận mã' : mode === 'login' ? 'Đăng nhập' : 'Gửi mã xác nhận'}</button>
            </form>
            <div className={styles['switch-mode-text']}>
              {mode === 'login' ? <>Chưa có tài khoản? <button type="button" onClick={() => switchMode('register')} className={styles['switch-mode-btn']}>Đăng ký</button></> : <button type="button" onClick={() => switchMode('login')} className={styles['switch-mode-btn']}>Quay lại đăng nhập</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
