import { FormEvent, useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { recruitmentPositions } from '@/TS/contactData';
import styles from './lienHe.module.css';

type ContactMode = 'recruitment' | 'support';

type FormValues = {
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  position: string;
  message: string;
  file: File | null;
};

const initialValues: FormValues = {
  name: '',
  birthDate: '',
  email: '',
  phone: '',
  position: recruitmentPositions[0],
  message: '',
  file: null,
};

export default function LienHePage() {
  // Lưu menu đang chọn và dữ liệu chung cho hai biểu mẫu liên hệ.
  const [mode, setMode] = useState<ContactMode>('recruitment');
  const [values, setValues] = useState<FormValues>(initialValues);
  const [successMessage, setSuccessMessage] = useState('');

  // Cập nhật từng trường input mà không làm mất dữ liệu các trường còn lại.
  const updateValue = (field: keyof FormValues, value: string | File | null) => {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccessMessage('');
  };

  // Chuyển form và xóa thông báo cũ để trải nghiệm chuyển tab rõ ràng.
  const switchMode = (nextMode: ContactMode) => {
    setMode(nextMode);
    setSuccessMessage('');
  };

  // Kiểm tra dữ liệu bắt buộc rồi hiển thị xác nhận gửi thành công.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(
      mode === 'recruitment'
        ? 'Hồ sơ đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm.'
        : 'Yêu cầu hỗ trợ đã được gửi. Bộ phận CSKH sẽ phản hồi sớm nhất.',
    );
    setValues(initialValues);
  };

  return (
    <>
      <Head>
        <title>Liên Hệ | Team Bất Ổn</title>
        <meta name="description" content="Liên hệ với Team Bất Ổn để ứng tuyển hoặc nhận hỗ trợ." />
      </Head>
      <div className={`${styles.page} min-h-screen bg-black text-white`}>
        <Header />
        <main className={styles.main}>
          {/* Phần giới thiệu ngắn trước khu vực biểu mẫu. */}
          <section className={styles.hero}>
            <p className={styles.eyebrow}>TEAM BẤT ỔN / CONTACT</p>
            <h1 className={styles.title}>Kết nối<br />cùng chúng tôi.</h1>
            <p className={styles.subtitle}>Bạn muốn gia nhập đội ngũ hay cần hỗ trợ? Hãy để lại thông tin, chúng tôi luôn sẵn sàng lắng nghe.</p>
          </section>

          {/* Menu chuyển đổi giữa biểu mẫu ứng tuyển và chăm sóc khách hàng. */}
          <nav className={styles.tabs} aria-label="Loại liên hệ">
            <button type="button" className={`${styles.tab} ${mode === 'recruitment' ? styles.activeTab : ''}`} onClick={() => switchMode('recruitment')} aria-pressed={mode === 'recruitment'}>
              Ứng tuyển
            </button>
            <button type="button" className={`${styles.tab} ${mode === 'support' ? styles.activeTab : ''}`} onClick={() => switchMode('support')} aria-pressed={mode === 'support'}>
              CSKH
            </button>
          </nav>

          {successMessage && <p className={styles.message} role="status">{successMessage}</p>}

          {mode === 'recruitment' ? (
            <div className={styles.layout}>
              {/* Biểu mẫu ứng tuyển với ngày sinh, vị trí và file CV. */}
              <section className={styles.panel}>
                <h2 className={styles.panelTitle}>Gia nhập đội ngũ</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <label className={styles.field}>Họ và tên
                    <input className={styles.input} required value={values.name} onChange={(event) => updateValue('name', event.target.value)} placeholder="Nhập họ và tên..." />
                  </label>
                  <label className={styles.field}>Ngày tháng năm sinh
                    <input className={styles.input} required type="date" value={values.birthDate} onChange={(event) => updateValue('birthDate', event.target.value)} />
                  </label>
                  <label className={styles.field}>Địa chỉ email
                    <input className={styles.input} required type="email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} placeholder="email@example.com" />
                  </label>
                  <label className={styles.field}>Vị trí ứng tuyển
                    <select className={styles.select} value={values.position} onChange={(event) => updateValue('position', event.target.value)}>
                      {recruitmentPositions.map((position) => <option key={position} value={position}>{position}</option>)}
                    </select>
                  </label>
                  <label className={styles.field}>CV / Hồ sơ
                    <input className={styles.fileInput} type="file" accept=".pdf,.doc,.docx" onChange={(event) => updateValue('file', event.target.files?.[0] || null)} />
                  </label>
                  <button className={styles.submitButton} type="submit">GỬI HỒ SƠ</button>
                </form>
              </section>

              {/* Bản đồ Google Maps hiển thị địa điểm ứng tuyển. */}
              <section className={`${styles.panel} ${styles.mapPanel}`}>
                <iframe
                  className={styles.map}
                  title="Bản đồ địa điểm ứng tuyển"
                  src="https://www.google.com/maps?q=Đại%20học%20Lạc%20Hồng%20Cơ%20sở%201%2C%2010%20Huỳnh%20Văn%20Nghệ%2C%20Biên%20Hòa%2C%20Đồng%20Nai&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p className={styles.mapCaption}>Địa chỉ ứng tuyển: 123 Đường Bất Ổn, Quận 1, TP.HCM</p>
              </section>
            </div>
          ) : (
            /* Biểu mẫu CSKH chỉ giữ lại các trường cần thiết để gửi yêu cầu. */
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Bạn cần hỗ trợ?</h2>
              <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.field}>Họ và tên
                  <input className={styles.input} required value={values.name} onChange={(event) => updateValue('name', event.target.value)} placeholder="Nhập họ và tên..." />
                </label>
                <label className={styles.field}>Địa chỉ email
                  <input className={styles.input} required type="email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} placeholder="email@example.com" />
                </label>
                <label className={styles.field}>Số điện thoại
                  <input className={styles.input} required type="tel" value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} placeholder="Số điện thoại..." />
                </label>
                <label className={styles.field}>Nội dung cần hỗ trợ
                  <textarea className={styles.textarea} required value={values.message} onChange={(event) => updateValue('message', event.target.value)} placeholder="Hãy mô tả vấn đề của bạn..." />
                </label>
                <button className={styles.submitButton} type="submit">GỬI YÊU CẦU</button>
              </form>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}