export type VehicleType = 'Ô tô' | 'Xe máy' | 'Xe moto';
export type FuelType = 'Xăng' | 'Dầu diesel' | 'Điện' | 'Hybrid';

export type Vehicle = {
  id: number;
  title: string;
  price: number;
  priceLabel: string;
  image: string;
  type?: VehicleType;
  fuel?: FuelType;
  brand?: string;
  year?: string;
  color?: string;
};

// Dữ liệu bán xe dùng chung cho trang chủ và trang mua bán.
export const vehicles: Vehicle[] = [
  { id: 1, title: 'Ford Mustang GT 2024', price: 2500000000, priceLabel: '2.500.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=700&q=80', type: 'Ô tô', fuel: 'Xăng', brand: 'Ford' },
  { id: 2, title: 'Honda CBR1000RR-R Fireblade', price: 1050000000, priceLabel: '1.050.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1568987445772-a1b7eeb78c8e?auto=format&fit=crop&w=700&q=80', type: 'Xe moto', fuel: 'Xăng', brand: 'Honda' },
  { id: 3, title: 'Porsche 911 Carrera S', price: 7800000000, priceLabel: '7.800.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1503376712344-652d0f440f5a?auto=format&fit=crop&w=700&q=80', type: 'Ô tô', fuel: 'Xăng', brand: 'Porsche' },
  { id: 4, title: 'Yamaha YZF-R1', price: 730000000, priceLabel: '730.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=700&q=80', type: 'Xe moto', fuel: 'Xăng', brand: 'Yamaha' },
  { id: 5, title: 'VinFast VF9 Plus', price: 1600000000, priceLabel: '1.600.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1629897047783-64906f2c2560?auto=format&fit=crop&w=700&q=80', type: 'Ô tô', fuel: 'Điện', brand: 'VinFast' },
  { id: 6, title: 'Toyota Camry Hybrid 2025', price: 1450000000, priceLabel: '1.450.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=700&q=80', type: 'Ô tô', fuel: 'Hybrid', brand: 'Toyota' },
  { id: 7, title: 'Honda SH 160i Premium', price: 105000000, priceLabel: '105.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1558980664-10ea3b3f5f2e?auto=format&fit=crop&w=700&q=80', type: 'Xe máy', fuel: 'Xăng', brand: 'Honda' },
  { id: 8, title: 'Suzuki GSX-R150', price: 82000000, priceLabel: '82.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1558980394-0c5f2f4d5a6a?auto=format&fit=crop&w=700&q=80', type: 'Xe moto', fuel: 'Xăng', brand: 'Suzuki' },
  { id: 9, title: 'Tesla Model 3 Long Range', price: 1250000000, priceLabel: '1.250.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80', type: 'Ô tô', fuel: 'Điện', brand: 'Tesla' },
  { id: 10, title: 'Kawasaki Ninja 650', price: 210000000, priceLabel: '210.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=700&q=80', type: 'Xe moto', fuel: 'Xăng', brand: 'Kawasaki' },
  { id: 11, title: 'Rivian R1T Adventure', price: 3200000000, priceLabel: '3.200.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=700&q=80', type: 'Ô tô', fuel: 'Điện', brand: 'Rivian' },
  { id: 12, title: 'Yamaha Grande Blue Core', price: 52000000, priceLabel: '52.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=700&q=80', type: 'Xe máy', fuel: 'Xăng', brand: 'Yamaha' },
  { id: 13, title: 'Toyota Fortuner Diesel', price: 1180000000, priceLabel: '1.180.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80', type: 'Ô tô', fuel: 'Dầu diesel', brand: 'Toyota' },
  { id: 14, title: 'VinFast Klara S', price: 48000000, priceLabel: '48.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=700&q=80', type: 'Xe máy', fuel: 'Điện', brand: 'VinFast' },
  { id: 15, title: 'Honda Gold Wing Tour', price: 1250000000, priceLabel: '1.250.000.000 VNĐ', image: 'https://images.unsplash.com/photo-1558980664-10ea3b3f5f2e?auto=format&fit=crop&w=700&q=80', type: 'Xe moto', fuel: 'Xăng', brand: 'Honda' },
];

