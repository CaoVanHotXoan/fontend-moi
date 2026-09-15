import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BACKEND_URL } from '@/services/api';
import styles from './chiTietXe.module.css';
import Head from "next/head";

type ApiVehicle = {
  MaXe: number;
  MaHang?: number | null;
  MaLoai?: number | null;
  TenXe?: string | null;
  Gia?: number | string | null;
  NamSanXuat?: number | string | null;
  MauSac?: string | null;
  SoLuong?: number | string | null;
  MoTa?: string | null;
  LoaiNhienLieu?: string | null;
  NhienLieu?: string | null;
  Fuel?: string | null;
};
type ApiVehicleImage = { MaXe: number; DuongDanAnh?: string | null; LaAnhChinh?: boolean | number | null };
type ApiBrand = { MaHang: number; TenHang?: string | null };
type ApiType = { MaLoai: number; TenLoai?: string | null };
type VehicleDataResponse = { Xe?: ApiVehicle[]; HinhAnhXe?: ApiVehicleImage[]; HangXe?: ApiBrand[]; LoaiXe?: ApiType[] };
type DetailedVehicle = {
  id: number;
  title: string;
  price: number;
  priceLabel: string;
  image: string;
  images: string[];
  brand?: string;
  type?: string;
  fuel?: string;
  year?: string;
  color?: string;
  quantity?: string;
  description?: string;
};

function mapApiVehicles(data: VehicleDataResponse): DetailedVehicle[] {
  const brands = new Map((data.HangXe ?? []).map((brand) => [brand.MaHang, brand.TenHang?.trim()]));
  const types = new Map((data.LoaiXe ?? []).map((type) => [type.MaLoai, type.TenLoai?.trim()]));
  const images = new Map<number, string[]>();

  (data.HinhAnhXe ?? []).forEach((image) => {
    const path = image.DuongDanAnh?.trim();
    if (!path) return;
    images.set(image.MaXe, [...(images.get(image.MaXe) ?? []), path]);
  });

  return (data.Xe ?? []).flatMap((vehicle) => {
    const title = vehicle.TenXe?.trim();
    const price = Number(vehicle.Gia);
    if (!title || !Number.isFinite(price) || price <= 0) return [];
    const vehicleImages = images.get(vehicle.MaXe) ?? [];
    const fuel = vehicle.LoaiNhienLieu ?? vehicle.NhienLieu ?? vehicle.Fuel;
    return [{
      id: vehicle.MaXe,
      title,
      price,
      priceLabel: `${price.toLocaleString('vi-VN')} VNĐ`,
      image: vehicleImages[0] ?? '',
      images: vehicleImages,
      brand: vehicle.MaHang == null ? undefined : brands.get(vehicle.MaHang) || undefined,
      type: vehicle.MaLoai == null ? undefined : types.get(vehicle.MaLoai) || undefined,
      fuel: fuel?.trim() || undefined,
      year: vehicle.NamSanXuat == null ? undefined : String(vehicle.NamSanXuat),
      color: vehicle.MauSac?.trim() || undefined,
      quantity: vehicle.SoLuong == null ? undefined : String(vehicle.SoLuong),
      description: vehicle.MoTa?.trim() || undefined,
    }];
  });
}

export default function ChiTietXePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<DetailedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showZaloQr, setShowZaloQr] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const vehicleId = Number(router.query.id);
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  const vehicleImages = vehicle?.images ?? [];
  const currentImageIndex = Math.min(imageIndex, Math.max(vehicleImages.length - 1, 0));
  const summary = vehicle ? [
    ['Hãng xe', vehicle.brand],
    ['Loại xe', vehicle.type],
    ['Nhiên liệu', vehicle.fuel],
    ['Năm sản xuất', vehicle.year],
    ['Màu sắc', vehicle.color],
    ['Số lượng', vehicle.quantity],
  ].filter((item): item is [string, string] => Boolean(item[1])) : [];

  useEffect(() => {
    if (!router.isReady) return;
    let active = true;

    fetch(`${BACKEND_URL}/data/json`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Không thể tải dữ liệu xe');
        const data = await response.json() as VehicleDataResponse;
        if (!Array.isArray(data.Xe)) throw new Error('API không trả về danh sách xe');
        return data;
      })
      .then((data) => {
        if (active) setVehicles(mapApiVehicles(data));
      })
      .catch(() => {
        if (active) setError('Không thể tải chi tiết xe. Hãy kiểm tra backend đang chạy ở cổng 3002.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router.isReady]);
        // Code chuyển ảnh
  useEffect(() => {
    setImageIndex(0);
    if (vehicleImages.length < 2) return;

    const imageRotation = window.setInterval(() => {
      setImageIndex((index) => (index + 1) % vehicleImages.length);
    }, 6000);

    return () => window.clearInterval(imageRotation);
  }, [vehicle?.id, vehicleImages.length]);

  if (!router.isReady || loading) return <div className={`${styles.page} font-sans`}><Header /><main className={styles.main}><p>Đang tải thông tin xe...</p></main><Footer /></div>;
  if (error || !vehicle) return <div className={`${styles.page} font-sans`}><Header /><main className={styles.main}><p>{error || 'Không tìm thấy xe.'}</p></main><Footer /></div>;

  return (
    <div className={`${styles.page} font-sans`}>
      <Head>
        <title>Chi tiết xe | WebXe</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
       <Header />
      <main className={styles.main}>
        <p className={styles.breadcrumb}><Link href="/MuaBanXe/MuaBanXe" className={styles.backLink}>Mua bán xe</Link> / Chi tiết xe</p>
        <section className={styles.hero}>
          {vehicleImages.length > 0 && <div className={styles.imagePanel}>
            <div className={styles.gallery}>
              <img className={styles.mainImage} src={vehicleImages[currentImageIndex]} alt={`${vehicle.title} - ảnh ${currentImageIndex + 1}`} />
              <button type="button" className={`${styles.galleryArrow} ${styles.galleryLeft}`} onClick={() => setImageIndex((index) => (index > 0 ? index - 1 : vehicleImages.length - 1))} aria-label="Ảnh trước">‹</button>
              <button type="button" className={`${styles.galleryArrow} ${styles.galleryRight}`} onClick={() => setImageIndex((index) => (index < vehicleImages.length - 1 ? index + 1 : 0))} aria-label="Ảnh tiếp theo">›</button>
              <div className={styles.imageCounter}>{currentImageIndex + 1} / {vehicleImages.length}</div>
            </div>
            <div className={styles.thumbnailCarousel}>
              <button
                type="button"
                className={styles.thumbnailArrow}
                onClick={() => thumbnailsRef.current?.scrollBy({ left: -260, behavior: 'smooth' })}
                aria-label="Cuộn thumbnail sang trái"
              >
                ‹
              </button>
              <div className={styles.thumbnails} ref={thumbnailsRef} aria-label="Chọn ảnh xe">
                {vehicleImages.map((image, index) => (
                  <button
                    type="button"
                    className={`${styles.thumbnail} ${index === currentImageIndex ? styles.thumbnailActive : ''}`}
                    onClick={() => {
                      setImageIndex(index);
                      thumbnailsRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }}
                    key={image}
                    aria-label={`Xem ảnh ${index + 1}`}
                    aria-current={index === currentImageIndex ? 'true' : undefined}
                  >
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.thumbnailArrow}
                onClick={() => thumbnailsRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
                aria-label="Cuộn thumbnail sang phải"
              >
                ›
              </button>
            </div>
          </div>}
          <div className={styles.detailsPanel}>
            <p className={styles.eyebrow}>THÔNG TIN XE</p><h1 className={styles.title}>{vehicle.title}</h1><p className={styles.price}>{vehicle.priceLabel}</p>
            {summary.length > 0 && <div className={styles.summary}>{summary.map(([label, value]) => <div className={styles.summaryRow} key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>}
            <div className={styles.actions}>
              {showPhone ? <a className={styles.actionPrimary} href="tel:0816344504">0816 344 504</a> : <button type="button" className={styles.actionPrimary} onClick={() => setShowPhone(true)}>Gọi cửa hàng</button>}
              <button type="button" className={styles.actionSecondary} onClick={() => setShowZaloQr(true)}>Nhắn cửa hàng</button>
            </div>
          </div>
        </section>
        {vehicle.description && <section className={styles.description}><h2 className={styles.sectionTitle}>Mô tả xe</h2><p>{vehicle.description}</p></section>}
      </main>
      {showZaloQr && (
        <div className={styles.qrBackdrop} role="dialog" aria-modal="true" aria-labelledby="zalo-qr-title" onClick={() => setShowZaloQr(false)}>
          <div className={styles.qrModal} onClick={(event) => event.stopPropagation()}>
            <button type="button" className={styles.qrClose} onClick={() => setShowZaloQr(false)} aria-label="Đóng mã QR">×</button>
            <h2 id="zalo-qr-title">Quét mã Zalo cửa hàng</h2>
            <p>Mở ứng dụng Zalo và quét mã để nhắn tin cho cửa hàng.</p>
            <img className={styles.qrImage} src="https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=https%3A%2F%2Fzalo.me%2F0816344504" alt="Mã QR Zalo cửa hàng" />
            <strong>0816 344 504</strong>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}