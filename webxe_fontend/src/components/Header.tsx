import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BACKEND_URL } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import LoadingSpinner from '@/components/LoadingSpinner';

type SearchVehicle = {
  id: number;
  title: string;
  price: number;
  priceLabel: string;
  image: string;
  brand?: string;
  type?: string;
};
type AlertVehicle = { MaXe: number; TenXe: string; Gia: number; SoLuong: number };
type AlertResponse = { alerts?: Array<{ TenXeTimKiem: string }>; vehicles?: AlertVehicle[]; hasAvailable?: boolean };

type CatalogResponse = {
  Xe?: Array<{ MaXe: number; MaHang?: number; MaLoai?: number; TenXe?: string; Gia?: number | string }>;
  HinhAnhXe?: Array<{ MaXe: number; DuongDanAnh?: string; LaAnhChinh?: boolean }>;
  HangXe?: Array<{ MaHang: number; TenHang?: string }>;
  LoaiXe?: Array<{ MaLoai: number; TenLoai?: string }>;
};

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, token } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertNames, setAlertNames] = useState<string[]>([]);
  const [editingAlertIndex, setEditingAlertIndex] = useState<number | null>(null);
  const [editingAlertValue, setEditingAlertValue] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertSending, setIsAlertSending] = useState(false);
  const [alertVehicles, setAlertVehicles] = useState<AlertVehicle[]>([]);
  const [hasAvailableAlert, setHasAvailableAlert] = useState(false);
  const alertDraftDirtyRef = useRef(false);
  const [searchVehicles, setSearchVehicles] = useState<SearchVehicle[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const isCustomer = isAuthenticated && !isAdmin && Boolean(user);

  useEffect(() => {
    if (!isCustomer || !token) return;
    let active = true;
    const refreshAlerts = () => fetch(`${BACKEND_URL}/user/vehicle-availability-alert`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Không thể tải danh sách thông báo có xe.');
        return response.json() as Promise<AlertResponse>;
      })
      .then((data) => {
        if (!active) return;
        if (!alertDraftDirtyRef.current && !isAlertOpen) {
          const names = (data.alerts ?? []).map((alert) => alert.TenXeTimKiem).slice(0, 3);
          setAlertNames(names);
        }
        setAlertVehicles(data.vehicles ?? []);
        setHasAvailableAlert(Boolean(data.hasAvailable));
      })
      .catch(() => {
        if (active) setHasAvailableAlert(false);
      });
    void refreshAlerts();
    const intervalId = window.setInterval(refreshAlerts, 10000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [isCustomer, token]);

  const addAlertName = () => {
    if (alertNames.length >= 3) {
      setAlertMessage('Bạn chỉ có thể theo dõi tối đa 3 tên xe.');
      return;
    }
    setEditingAlertIndex(alertNames.length);
    setEditingAlertValue('');
    setAlertMessage('');
  };

  const editAlertName = (index: number) => {
    setEditingAlertIndex(index);
    setEditingAlertValue(alertNames[index]);
    setAlertMessage('');
  };

  const cancelAlertEdit = () => {
    setEditingAlertIndex(null);
    setEditingAlertValue('');
    setAlertMessage('');
  };

  const deleteAlertName = async (index: number) => {
    const nextNames = alertNames.filter((_, itemIndex) => itemIndex !== index);
    setAlertNames(nextNames);
    alertDraftDirtyRef.current = true;
    await persistAlertNames(nextNames);
  };

  const persistAlertNames = async (names: string[]) => {
    setIsAlertSending(true);
    setAlertMessage('');
    try {
      const response = await fetch(`${BACKEND_URL}/user/vehicle-availability-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
        body: JSON.stringify({ vehicleNames: names.filter((name) => name.trim()), notify: false }),
      });
      const data = await response.json() as { message?: string; vehicles?: AlertVehicle[] };
      if (!response.ok) throw new Error(data.message || 'Không thể cập nhật danh sách xe.');
      setAlertNames(names.filter((name) => name.trim()));
      setAlertVehicles(data.vehicles ?? []);
      setHasAvailableAlert((data.vehicles ?? []).length > 0);
      alertDraftDirtyRef.current = false;
      setEditingAlertIndex(null);
      setEditingAlertValue('');
      setAlertMessage(data.message || 'Đã cập nhật danh sách xe.');
    } catch (error) {
      setAlertMessage(error instanceof Error ? error.message : 'Không thể cập nhật danh sách xe.');
    } finally {
      setIsAlertSending(false);
    }
  };

  const submitAlertEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = editingAlertValue.trim();
    if (!value) {
      setAlertMessage('Vui lòng nhập tên xe.');
      return;
    }
    const nextNames = [...alertNames];
    if (editingAlertIndex === alertNames.length) nextNames.push(value);
    else if (editingAlertIndex !== null) nextNames[editingAlertIndex] = value;
    await persistAlertNames(nextNames);
  };

  useEffect(() => {
    if (!isCustomer || !token) return;
    const handlePageExit = () => {
      void fetch(`${BACKEND_URL}/user/vehicle-availability-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({ vehicleNames: [], notify: true }),
      });
    };
    window.addEventListener('pagehide', handlePageExit);
    return () => {
      window.removeEventListener('pagehide', handlePageExit);
      void fetch(`${BACKEND_URL}/user/vehicle-availability-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({ vehicleNames: [], notify: true }),
      });
    };
  }, [isCustomer, token]);

  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/data/json`);
        if (!response.ok) throw new Error('Không tải được catalog');
        const data = await response.json() as CatalogResponse;
        if (!active) return;
        const brands = new Map((data.HangXe ?? []).map((brand) => [brand.MaHang, brand.TenHang]));
        const types = new Map((data.LoaiXe ?? []).map((type) => [type.MaLoai, type.TenLoai]));
        const imageMap = new Map<number, string>();
        (data.HinhAnhXe ?? []).forEach((image) => {
          if (image.DuongDanAnh && (!imageMap.has(image.MaXe) || image.LaAnhChinh)) {
            imageMap.set(image.MaXe, image.DuongDanAnh);
          }
        });
        setSearchVehicles((data.Xe ?? []).filter((vehicle) => vehicle.TenXe).map((vehicle) => ({
          id: vehicle.MaXe,
          title: vehicle.TenXe as string,
          price: Number(vehicle.Gia) || 0,
          priceLabel: `${(Number(vehicle.Gia) || 0).toLocaleString('vi-VN')} VNĐ`,
          image: imageMap.get(vehicle.MaXe) || '',
          brand: vehicle.MaHang ? brands.get(vehicle.MaHang) : undefined,
          type: vehicle.MaLoai ? types.get(vehicle.MaLoai) : undefined,
        })));
      } catch {
        if (active) setSearchVehicles([]);
      } finally {
        if (active) setIsCatalogLoading(false);
      }
    };
    void loadCatalog();
    return () => { active = false; };
  }, []);

  const suggestions = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return [];
    return searchVehicles.filter((vehicle) => vehicle.title.toLowerCase().includes(normalizedTerm)).slice(0, 6);
  }, [searchTerm, searchVehicles]);

  return (
    <>
      <LoadingSpinner isLoading={isCatalogLoading} label="Đang tải dữ liệu xe" />
      <header className="header-container">
      {/* Header Top: Logo, Search, Icons, Profile */}
      <div className="header-top">
        {/* Nút hamburger chỉ hiển thị trên mobile để mở menu dọc. */}
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMenuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Logo */}
        <Link href="/" className="logo-text" style={{ textDecoration: 'none' }}>
          TEAM BẤT ỔN
        </Link>

        {/* Khung giữa: Thanh tìm kiếm & Icons xe */}
        <div className="header-middle">
          {/* Ô tìm kiếm dạng thu gọn (hiện ra khi di chuột) */}
          <div className="search-container">
            <input
              type="search"
              className="search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Tìm kiếm xe"
              aria-controls="vehicle-search-suggestions"
            />
            <button className="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
            {searchTerm.trim() && (
              <div className="search-suggestions" id="vehicle-search-suggestions">
                {suggestions.length ? suggestions.map((vehicle) => (
                  <Link
                    href={`/ChiTietXe/ChiTietXe?id=${vehicle.id}`}
                    className="search-suggestion"
                    key={vehicle.id}
                    onClick={() => setSearchTerm('')}
                  >
                    <span className="search-suggestion-info">
                      <span className="search-suggestion-name">{vehicle.title}</span>
                      <span className="search-suggestion-price">{vehicle.priceLabel}</span>
                    </span>
                    {vehicle.image ? <img src={vehicle.image} alt="" className="search-suggestion-image" /> : <span className="search-suggestion-image search-suggestion-placeholder" aria-hidden="true">Xe</span>}
                  </Link>
                )) : <p className="search-empty">Không tìm thấy xe phù hợp.</p>}
              </div>
            )}
          </div>

          {/* Các Icon phương tiện */}
          <div className="vehicle-icons">
            {/* Mỗi icon truyền loại xe sang trang mua bán để lọc sẵn danh sách. */}
            <Link href="/MuaBanXe/MuaBanXe?type=%C3%94%20t%C3%B4" className="vehicle-item" aria-label="Xem xe ô tô">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-3.6a2.8 2.8 0 0 1 2.2-2.7l7.1-1.6 5.4-6.1A4.2 4.2 0 0 1 22 5.6h18.2a5.2 5.2 0 0 1 3.8 1.6l5.4 5.9 7 1.6a2.8 2.8 0 0 1 2.2 2.7V21H4Z"/><path d="m16 12.8 4.6-4.5a3 3 0 0 1 2-.8h16.2a3.7 3.7 0 0 1 2.7 1.1l4.4 4.2H16Z"/><path d="M31.8 7.5v5.3M11 16.2h5m32 0h5M21 17h22"/><path d="M6 20h7m38 0h7"/><circle cx="16" cy="21" r="4.5" fill="currentColor"/><circle cx="48" cy="21" r="4.5" fill="currentColor"/><circle cx="16" cy="21" r="1.7" fill="white" stroke="none"/><circle cx="48" cy="21" r="1.7" fill="white" stroke="none"/><path d="M8 16.5h3M53 16.5h3"/></svg>
              <span className="vehicle-name">Ô tô</span>
            </Link>
            <Link href="/MuaBanXe/MuaBanXe?type=Xe%20m%C3%A1y" className="vehicle-item" aria-label="Xem xe máy">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="22" r="5"/><circle cx="54" cy="22" r="5"/><circle cx="10" cy="22" r="1.5"/><circle cx="54" cy="22" r="1.5"/><path d="M10 22h12l7.2-11h10l14.8 11M22 22 15.5 11h10.2l7.5 11"/><path d="M29.2 11h-7.5l-3.2-4h10.4l4.2 4"/><path d="m39.2 11 3.2-5.5h5.2M42.4 5.5l3 3M31 11l-2.5 8h10.2l3.4-8"/><path d="M31.4 14.2h7.8M38.7 19H47l4.5 3M18 22h-5M55 22h5"/></svg>
              <span className="vehicle-name">Xe máy</span>
            </Link>
            <Link href="/MuaBanXe/MuaBanXe?type=Xe%20moto" className="vehicle-item" aria-label="Xem xe mô tô">
              <svg className="vehicle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="22" r="5"/><circle cx="55" cy="22" r="5"/><circle cx="9" cy="22" r="1.5"/><circle cx="55" cy="22" r="1.5"/><path d="M9 22h13l6.5-12h10l16.5 12M22 22l5-11h12l8 11"/><path d="M27 11h-8l-4 5.5M34.5 10l4.5-5h7l2.5 3.5M39 5l3 3"/><path d="m27 11 6.2-3 9.5 2.2-3.2 7.3H27"/><path d="M30 13.2h9M39.5 17.5l5 4.5M14 22h-7M58 22h4"/><path d="M48 18h7l4 2.2"/></svg>
              <span className="vehicle-name">Mô tô</span>
            </Link>
          </div>
        </div>

        {/* Icon Tài khoản & Giỏ hàng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {cartCount > 0 && (
            <span style={{ background: '#e53e3e', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {cartCount}
            </span>
          )}
          <button className="profile-icon" onClick={() => {
            if (isAuthenticated) {
              sessionStorage.setItem('profileReturnPath', router.asPath);
              router.push('/ThongTinCaNhan/Profile');
            } else {
              router.push('/Login/Login');
            }
          }} aria-label="profile">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          {isAdmin && (
            <Link href="/DatabaseDashboard/DatabaseDashboard" className="admin-dashboard-link" aria-label="Mở trang quản trị dữ liệu">
              ⚙
            </Link>
          )}
          {isCustomer && (
            <span className="vehicle-alert-button-wrap">
              <button type="button" className="vehicle-alert-button" onClick={() => { setAlertMessage(''); setIsAlertOpen(true); }}>
                Thông báo có xe
              </button>
              {hasAvailableAlert && <span className="vehicle-alert-dot" aria-label="Có xe phù hợp đang có hàng" />}
            </span>
          )}
        </div>
      </div>

      {/* Thanh Menu dưới */}
      <nav className={`header-nav ${isMenuOpen ? 'header-nav-open' : ''}`}>
        <div className="nav-item">
          <Link href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Trang Chủ</Link>
        </div>
        <div className="nav-item">
          <Link href="/MuaBanXe/MuaBanXe" className="nav-link" onClick={() => setIsMenuOpen(false)}>CỬA HÀNG</Link>
        </div>
        <div className="nav-item">
          <Link href="/TinTuc/TinTuc" className="nav-link" onClick={() => setIsMenuOpen(false)}>Tin tức</Link>
        </div>
        <div className="nav-item">
          <Link href="/Information_AboutUs/AboutUs" className="nav-link" onClick={() => setIsMenuOpen(false)}>Information</Link>
          <div className="dropdown-menu">
            <Link href="/Information_AboutUs/AboutUs" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>About Us</Link>
          </div>
        </div>
        <div className="nav-item">
          <Link href="/LienHe/LienHe" className="nav-link" onClick={() => setIsMenuOpen(false)}>Liên Hệ</Link>
        </div>
      </nav>
      {isAlertOpen && isCustomer && (
        <div className="vehicle-alert-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAlertOpen(false); }}>
          <form className="vehicle-alert-modal" onSubmit={submitAlertEdit}>
            <div className="vehicle-alert-heading"><div><p>KHÁCH HÀNG</p><h2>Thông báo có xe</h2></div><button type="button" onClick={() => setIsAlertOpen(false)} aria-label="Đóng">×</button></div>
            <p className="vehicle-alert-description">Nhập tối đa 3 tên xe. WebXe sẽ kiểm tra tồn kho và gửi email khi xe đang có hàng.</p>
            {alertNames.map((name, index) => {
              const normalizedName = name.trim().toLowerCase();
              const availableVehicles = normalizedName ? alertVehicles.filter((vehicle) => vehicle.TenXe.toLowerCase().includes(normalizedName)) : [];
              if (editingAlertIndex === index) {
                return <label key={index}>Tên xe {index + 1}<div className="vehicle-alert-input-row"><input autoFocus value={editingAlertValue} onChange={(event) => setEditingAlertValue(event.target.value)} placeholder="Ví dụ: Toyota Vios" />{availableVehicles.length > 0 && <span className="vehicle-alert-available" title="Xe đang có hàng">✓ Có hàng</span>}</div><div className="vehicle-alert-edit-actions"><button type="submit" className="vehicle-alert-submit" disabled={isAlertSending}>{isAlertSending ? 'Đang lưu...' : 'Cập nhật'}</button><button type="button" className="vehicle-alert-cancel" onClick={cancelAlertEdit}>Hủy</button></div></label>;
              }
              return <div className="vehicle-alert-item" key={index}><div className="vehicle-alert-item-main"><strong>{name}</strong>{availableVehicles.length > 0 && <span className="vehicle-alert-available" title="Xe đang có hàng">✓ Có hàng</span>}</div>{availableVehicles.map((vehicle) => <Link className="vehicle-alert-view" href={`/ChiTietXe/ChiTietXe?id=${vehicle.MaXe}`} key={vehicle.MaXe}>Xem {vehicle.TenXe} →</Link>)}<div className="vehicle-alert-item-actions"><button type="button" onClick={() => editAlertName(index)}>Sửa</button><button type="button" onClick={() => void deleteAlertName(index)} disabled={isAlertSending}>Xóa</button></div></div>;
            })}
            {editingAlertIndex === alertNames.length && <label>Tên xe {alertNames.length + 1}<div className="vehicle-alert-input-row"><input autoFocus value={editingAlertValue} onChange={(event) => setEditingAlertValue(event.target.value)} placeholder="Ví dụ: Toyota Vios" /></div><div className="vehicle-alert-edit-actions"><button type="submit" className="vehicle-alert-submit" disabled={isAlertSending}>{isAlertSending ? 'Đang lưu...' : 'Lưu'}</button><button type="button" className="vehicle-alert-cancel" onClick={cancelAlertEdit}>Hủy</button></div></label>}
            {alertMessage && <p className="vehicle-alert-message" role="status">{alertMessage}</p>}
            {editingAlertIndex === null && alertNames.length < 3 && <button type="button" className="vehicle-alert-add" onClick={addAlertName}>+ Thêm</button>}
          </form>
        </div>
      )}
      </header>
    </>
  );
}
