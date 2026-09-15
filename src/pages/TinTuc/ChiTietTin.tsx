import Link from 'next/link';
import { useRouter } from 'next/router';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { NewsItem } from '@/TS/newsData';
import { BACKEND_URL } from '@/services/api';
import styles from './chiTietTin.module.css';
import Head from 'next/head';


type ApiNews = { MaTinTuc: number; MaDanhMuc: number; TieuDe?: string | null; TomTat?: string | null; NoiDung?: string | null; HinhAnh?: string | null };
type ApiCategory = { MaDanhMuc: number; TenDanhMuc?: string | null };
type NewsResponse = { TinTuc?: ApiNews[]; DanhMucTinTuc?: ApiCategory[] };
type ApiVehicle = { MaXe: number; TenXe?: string | null; Gia?: number | string | null };
type ApiImage = { MaXe: number; DuongDanAnh?: string | null };

function mapNews(data: NewsResponse): NewsItem[] {
  const categories = new Map((data.DanhMucTinTuc ?? []).map((item) => [item.MaDanhMuc, item.TenDanhMuc?.trim() || 'Tin tức']));
  return (data.TinTuc ?? []).flatMap((item) => item.TieuDe?.trim() ? [{
    id: item.MaTinTuc,
    category: categories.get(item.MaDanhMuc) || 'Tin tức',
    title: item.TieuDe.trim(),
    description: item.TomTat?.trim() || '',
    image: item.HinhAnh?.trim() || '',
    content: item.NoiDung?.trim() || '',
  } as NewsItem & { content: string }] : []);
}

// Trang chi tiết đọc id bài viết từ query string của router.
export default function ChiTietTinPage() {
  const router = useRouter();
  const articleId = Number(router.query.id);
  const [newsItems, setNewsItems] = useState<Array<NewsItem & { content?: string }>>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: number; title: string; priceLabel: string; image: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const article = newsItems.find((item) => item.id === articleId) ?? newsItems[0];
  const relatedNews = newsItems.filter((item) => item.id !== article?.id).slice(0, 6);

  useEffect(() => {
    if (!router.isReady) return;
    Promise.all([fetch(`${BACKEND_URL}/data/news`), fetch(`${BACKEND_URL}/data/json`)]).then(async ([newsResponse, vehicleResponse]) => {
      if (!newsResponse.ok || !vehicleResponse.ok) throw new Error('Không thể tải dữ liệu từ máy chủ.');
      const newsData = await newsResponse.json() as NewsResponse;
      const vehicleData = await vehicleResponse.json() as { Xe?: ApiVehicle[]; HinhAnhXe?: ApiImage[] };
      const images = new Map<number, string[]>();
      (vehicleData.HinhAnhXe ?? []).forEach((image) => {
        if (image.DuongDanAnh) images.set(image.MaXe, [...(images.get(image.MaXe) ?? []), image.DuongDanAnh]);
      });
      setNewsItems(mapNews(newsData));
      setVehicles((vehicleData.Xe ?? []).flatMap((vehicle) => {
        const price = Number(vehicle.Gia);
        if (!vehicle.TenXe || !Number.isFinite(price)) return [];
        return [{ id: vehicle.MaXe, title: vehicle.TenXe, priceLabel: `${price.toLocaleString('vi-VN')} VNĐ`, image: images.get(vehicle.MaXe)?.[0] || '' }];
      }));
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Không thể tải dữ liệu.'))
      .finally(() => setLoading(false));
  }, [router.isReady]);

  if (!router.isReady || loading) return <div className={`${styles.page} min-h-screen bg-black text-white`}><Header /><main className={styles.main}><p>Đang tải bài viết từ máy chủ...</p></main><Footer /></div>;
  if (error || !article) return <div className={`${styles.page} min-h-screen bg-black text-white`}><Header /><main className={styles.main}><p>{error || 'Không tìm thấy bài viết.'}</p></main><Footer /></div>;

  return (
    <div className={`${styles.page} min-h-screen bg-black text-white`}>
      <Head>
                          <title>Chi Tiết Tin | WebXe</title>
                          <meta name="viewport" content="width=device-width, initial-scale=1" />
                        </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.layout}>
          <article className={styles.article}>
            <p className={styles.kicker}>{article.category}</p>
            <h1>{article.title}</h1>
            <p className={styles.lead}>{article.description}</p>
            <img src={article.image} alt={article.title} className={styles.cover} />

            {/* Nội dung mô phỏng đầy đủ cho bài viết mẫu hiện có trong dữ liệu. */}
            <div className={styles.content}>{article.content?.split('\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            <Link href="/TinTuc/TinTuc" className={styles.backButton}>← Trở về</Link>
          </article>

          <aside className={styles.sidebar}>
            <InfoPanel title="THÔNG TIN NỔI BẬT">
              <div className={styles.featuredList}>
                {newsItems.slice(0, 10).map((item) => <FeaturedItem item={item} key={item.id} />)}
              </div>
            </InfoPanel>

            <InfoPanel title="TIN BÁN XE">
              <div className={styles.vehicleList}>
                {vehicles.slice(0, 10).map((vehicle) => (
                  <Link href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`} className={styles.vehicleItem} key={vehicle.id}>
                    <img src={vehicle.image} alt={vehicle.title} />
                    <span>{vehicle.title}<small>{vehicle.priceLabel}</small></span>
                  </Link>
                ))}
              </div>
            </InfoPanel>
          </aside>
        </div>

        {/* Sáu bài liên quan được dàn thành hai hàng, mỗi hàng ba card. */}
        <section className={styles.related}>
          <div className={styles.sectionHeading}>
            <p className={styles.kicker}>GỢI Ý ĐỌC THÊM</p>
            <h2>CÓ THỂ BẠN SẼ QUAN TÂM</h2>
          </div>
          <div className={styles.relatedGrid}>
            {relatedNews.map((item) => (
              <Link href={`/TinTuc/ChiTietTin?id=${item.id}`} className={styles.relatedCard} key={item.id}>
                <img src={item.image} alt="" />
                <span>{item.category}</span>
                <h3>{item.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className={styles.panel}><h2>{title}</h2>{children}</section>;
}

function FeaturedItem({ item }: { item: NewsItem }) {
  return (
    <Link href={`/TinTuc/ChiTietTin?id=${item.id}`} className={styles.featuredItem}>
      <img src={item.image} alt="" />
      <span>{item.title}</span>
    </Link>
  );
}
