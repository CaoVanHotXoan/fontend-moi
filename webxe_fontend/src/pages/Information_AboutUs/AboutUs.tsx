import { useState } from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { teamMembers, TeamMember } from '@/TS/aboutUsData';
import styles from './aboutUs.module.css';

const fallbackMemberImage = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85';

const getMemberImage = (image: string) => image.includes('fbcdn.net') ? fallbackMemberImage : image;

export default function AboutUs() {
  // Lưu thành viên đang được mở; null nghĩa là đang ở danh sách tổng quan.
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Đóng layout chi tiết và đưa người dùng về danh sách thành viên.
  const closeDetail = () => setSelectedMember(null);

  return (
    <>
      <Head>
        <title>About Us | Team Bất Ổn</title>
        <meta name="description" content="Tìm hiểu đội ngũ đứng sau Team Bất Ổn." />
      </Head>

      <div className={`${styles.page} min-h-screen bg-black text-white`}>
        <Header />

        <main className={styles.main}>
          {/* Phần giới thiệu thương hiệu của đội ngũ. */}
          <section className={styles.hero}>
            <p className={styles.eyebrow}>TEAM BẤT ỔN / ABOUT US</p>
            <h1 className={styles.title}>Những người<br />sau tay lái.</h1>
            <p className={styles.subtitle}>
              Chúng tôi kết hợp công nghệ, thiết kế và tình yêu xe để tạo nên một nơi mua bán đáng tin cậy cho mọi hành trình.
            </p>
          </section>

          {selectedMember ? (
            /* Layout bên trong: ảnh ở góc trái, tên và mô tả ở bên phải. */
            <section className={styles.detail} aria-label={`Thông tin về ${selectedMember.name}`}>
              <button type="button" className={styles.backButton} onClick={closeDetail}>
                <span aria-hidden="true">←</span> Quay lại đội ngũ
              </button>
              <img className={styles.detailAvatar} src={getMemberImage(selectedMember.image)} alt={selectedMember.name} />
              <div className={styles.detailContent}>
                <div className={styles.detailText}>
                  <h2 className={styles.detailName}>{selectedMember.name}</h2>
                  <p className={styles.detailRole}>{selectedMember.role}</p>
                  <p className={styles.detailDescription}>{selectedMember.description}</p>
                </div>
              </div>
            </section>
          ) : (
            /* Layout bên ngoài: các thẻ có thể chọn để mở phần chi tiết. */
            <section className={styles.teamGrid} aria-label="Danh sách thành viên">
              {teamMembers.slice(0, 2).map((member) => (
                <button
                  type="button"
                  key={member.id}
                  className={styles.memberCard}
                  onClick={() => setSelectedMember(member)}
                  aria-label={`Xem thông tin ${member.name}`}
                >
                  <img className={styles.memberImage} src={getMemberImage(member.image)} alt={member.name} />
                  <span className={styles.memberSummary}>{member.name}</span>
                </button>
              ))}
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}