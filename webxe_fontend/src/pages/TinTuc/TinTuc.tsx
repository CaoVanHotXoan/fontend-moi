import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { NewsItem } from '@/TS/newsData';
import { BACKEND_URL } from '@/services/api';
import styles from './tinTuc.module.css';
import Head from 'next/head';


const INITIAL_COUNT = 6;
const LOAD_STEP = 3;
type ApiNews = { MaTinTuc: number; MaDanhMuc: number; TieuDe?: string | null; TomTat?: string | null; HinhAnh?: string | null };
type ApiCategory = { MaDanhMuc: number; TenDanhMuc?: string | null };
type NewsResponse = { TinTuc?: ApiNews[]; DanhMucTinTuc?: ApiCategory[] };
type ApiVehicle = { MaXe: number; TenXe?: string | null; Gia?: number | string | null };
type ApiImage = { MaXe: number; DuongDanAnh?: string | null; LaAnhChinh?: boolean | number | null };

function mapNews(data: NewsResponse): NewsItem[] {
  const categories = new Map((data.DanhMucTinTuc ?? []).map((item) => [item.MaDanhMuc, item.TenDanhMuc?.trim() || 'Tin tức']));
  return (data.TinTuc ?? []).flatMap((item) => {
    if (!item.TieuDe?.trim()) return [];
    return [{
      id: item.MaTinTuc,
      category: categories.get(item.MaDanhMuc) || 'Tin tức',
      title: item.TieuDe.trim(),
      description: item.TomTat?.trim() || 'Cập nhật thông tin mới nhất từ WebXe.',
      image: item.HinhAnh?.trim() || '',
    }];
  });
}

export default function TinTucPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: number; title: string; priceLabel: string; image: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const newsCategories = [...new Set(newsItems.map((item) => item.category))];
  const [category, setCategory] = useState('');
  const [count, setCount] = useState(INITIAL_COUNT);
  const articles = useMemo(() => newsItems.filter((item) => item.category === category), [category]);
  const visibleArticles = articles.slice(0, count);

  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND_URL}/data/news`),
      fetch(`${BACKEND_URL}/data/json`),
    ]).then(async ([newsResponse, vehicleResponse]) => {
      if (!newsResponse.ok || !vehicleResponse.ok) throw new Error('Không thể tải dữ liệu từ máy chủ.');
      const newsData = await newsResponse.json() as NewsResponse;
      const vehicleData = await vehicleResponse.json() as { Xe?: ApiVehicle[]; HinhAnhXe?: ApiImage[] };
      const mappedNews = mapNews(newsData);
      const images = new Map<number, string[]>();
      (vehicleData.HinhAnhXe ?? []).forEach((image) => {
        if (image.DuongDanAnh) images.set(image.MaXe, [...(images.get(image.MaXe) ?? []), image.DuongDanAnh]);
      });
      setNewsItems(mappedNews);
      setCategory(mappedNews[0]?.category || '');
      setVehicles((vehicleData.Xe ?? []).flatMap((vehicle) => {
        const price = Number(vehicle.Gia);
        if (!vehicle.TenXe || !Number.isFinite(price)) return [];
        return [{ id: vehicle.MaXe, title: vehicle.TenXe, priceLabel: `${price.toLocaleString('vi-VN')} VNĐ`, image: images.get(vehicle.MaXe)?.[0] || '' }];
      }));
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Không thể tải dữ liệu.'))
      .finally(() => setLoading(false));
  }, []);

  const selectCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    setCount(INITIAL_COUNT);
  };

  return (
    <div className={`${styles.page} min-h-screen bg-black text-white`}>
       <Head>
                    <title>Tin tức | WebXe</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                  </Head>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>TEAM BẤT ỔN / NEWSROOM</p>
          <h1 className={styles.title}>Tin tức xe</h1>
          <p className={styles.subtitle}>Cập nhật nhanh những câu chuyện mới nhất trong thế giới ô tô và xe máy.</p>
        </section>

        {loading && <p>Đang tải tin tức từ máy chủ...</p>}
        {error && <p>{error}</p>}
        <nav className={styles.categories} aria-label="Phân loại tin tức">
          {newsCategories.map((item) => (
            <button
              type="button"
              key={item}
              className={`${styles.categoryButton} ${category === item ? styles.activeCategory : ''}`}
              onClick={() => selectCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className={styles.layout}>
          <section aria-label={`Danh sách ${category}`}>
            <div className={styles.heading}>
              <div>
                <p className={styles.kicker}>MỚI NHẤT</p>
                <h2>{category}</h2>
              </div>
              <span>{articles.length} bài viết</span>
            </div>
            <div className={styles.articleList}>
              {visibleArticles.map((article) => <ArticleCard article={article} key={article.id} />)}
            </div>
            {count < articles.length && (
              <button type="button" className={styles.loadMore} onClick={() => setCount((value) => Math.min(value + LOAD_STEP, articles.length))}>
                Xem thêm
              </button>
            )}
          </section>

          <aside className={styles.sidebar}>
            <section className={styles.panel}>
              <div className={styles.heading}><h2>Top 10 xe bán chạy</h2><span>01—10</span></div>
              <div className={styles.popularList}>
                {vehicles.slice(0, 10).map((vehicle, index) => (
                  <Link href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`} className={styles.popularItem} key={vehicle.id}>
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <img src={vehicle.image} alt={vehicle.title} />
                    <span>{vehicle.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ArticleCard({ article }: { article: NewsItem }) {
  return (
    <article className={styles.article}>
      <img src={article.image} alt="" />
      <div>
        <p className={styles.kicker}>{article.category}</p>
        <h3><Link href={`/TinTuc/ChiTietTin?id=${article.id}`}>{article.title}</Link></h3>
        <p className={styles.description}>{article.description}</p>
        <Link href={`/TinTuc/ChiTietTin?id=${article.id}`} className={styles.readMore}>Đọc bài <span>→</span></Link>
      </div>
    </article>
  );
}
