# 🏠 Nội Thất E-Commerce — API Design Document

> **Base URL:** `http://localhost:{PORT}/api`  
> **Architecture:** Node.js BFF (Backend for Frontend) → Spring Boot Internal API  
> **Auth:** JWT Bearer Token (`Authorization: Bearer <token>`)  
> **Last Updated:** 2026-04-05

---

## 📋 Mục lục

- [1. Authentication & Authorization](#1-authentication--authorization)
- [2. Customer](#2-customer)
- [3. Staff](#3-staff)
- [4. Category](#4-category)
- [5. Color](#5-color)
- [6. Dimensions](#6-dimensions)
- [7. Product](#7-product)
- [8. Product Attribute](#8-product-attribute)
- [9. Product Image](#9-product-image)
- [10. Cart](#10-cart)
- [11. Promotion](#11-promotion)
- [12. Category Promotion](#12-category-promotion)
- [13. Order](#13-order)
- [14. Order Detail](#14-order-detail)
- [15. Payment](#15-payment)
- [16. Admin](#16-admin)

---

## Ký hiệu

| Icon | Ý nghĩa |
|------|----------|
| 🟢 | Public — Không cần token |
| 🔒 | Protected — Cần JWT token (Customer/Staff) |
| 🔴 | Admin — Cần JWT token + quyền Admin/Staff |
| ⚠️ | Chưa implement đầy đủ (TODO) |

---

## 1. Authentication & Authorization

### Cơ chế hoạt động

```
Client → Node.js BFF (JWT verify/create) → Spring Boot (Data layer)
```

- **JWT Token** được tạo và verify tại **Node.js BFF**
- **Data** Customer/Staff nằm ở **Spring Boot**
- Token hết hạn sau **24 giờ** (login), **15 phút** (reset password)
- Header format: `Authorization: Bearer <jwt_token>`

### Roles

| Role | Giá trị | Mô tả |
|------|---------|-------|
| Customer | `ROLE_CUSTOMER` | Khách hàng |
| Staff | `ROLE_STAFF` | Nhân viên |
| Admin | `ROLE_ADMIN` | Quản trị viên |

---

## 2. Customer

**Base path:** `/api/customers`

### 2.1 Đăng ký

| | |
|---|---|
| **Endpoint** | 🟢 `POST /api/customers/register` |
| **Mô tả** | Đăng ký tài khoản mới |

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "securePassword123",
  "hoTen": "Nguyễn Văn A",
  "soDienThoai": "0901234567",
  "diaChi": "123 Đường ABC, Quận 1, TP.HCM"
}
```

**Response:** `201 Created`
```json
{
  "status": 201,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.",
  "data": { ... }
}
```

---

### 2.2 Đăng nhập

| | |
|---|---|
| **Endpoint** | 🟢 `POST /api/customers/login` |
| **Mô tả** | Đăng nhập bằng email/password |

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "customer": {
      "id": 1,
      "email": "customer@example.com",
      "hoTen": "Nguyễn Văn A"
    }
  }
}
```

**Error:** `401 Unauthorized` — Email hoặc mật khẩu không đúng

---

### 2.3 Đăng nhập Google

| | |
|---|---|
| **Endpoint** | 🟢 `POST /api/customers/google` |
| **Mô tả** | Đăng nhập/đăng ký bằng Google OAuth |

**Request Body:**
```json
{
  "googleToken": "google_oauth_id_token"
}
```

**Response:** `200 OK` — Tương tự login response

---

### 2.4 Đăng xuất

| | |
|---|---|
| **Endpoint** | 🔒 `POST /api/customers/logout` |
| **Mô tả** | Đăng xuất (client-side xóa token) |

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Đăng xuất thành công",
  "data": null
}
```

---

### 2.5 Xác thực Email

| | |
|---|---|
| **Endpoint** | 🟢 `GET /api/customers/verify-email/:token` |
| **Mô tả** | Xác thực email qua link trong email |

**Params:** `token` — JWT token từ email

**Response:** `200 OK` — Xác thực email thành công  
**Error:** `400 Bad Request` — Token không hợp lệ hoặc hết hạn

---

### 2.6 Profile

| | |
|---|---|
| **Endpoint** | 🔒 `GET /api/customers/profile` |
| **Mô tả** | Lấy thông tin profile khách hàng |

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Lấy profile thành công",
  "data": {
    "id": 1,
    "email": "customer@example.com",
    "hoTen": "Nguyễn Văn A",
    "soDienThoai": "0901234567",
    "diaChi": "123 Đường ABC, Quận 1, TP.HCM"
  }
}
```

---

### 2.7 Cập nhật Profile

| | |
|---|---|
| **Endpoint** | 🔒 `PUT /api/customers/profile` |
| **Mô tả** | Cập nhật thông tin cá nhân |

**Request Body:**
```json
{
  "hoTen": "Nguyễn Văn B",
  "soDienThoai": "0907654321",
  "diaChi": "456 Đường XYZ, Quận 3, TP.HCM"
}
```

---

### 2.8 Đổi mật khẩu

| | |
|---|---|
| **Endpoint** | 🔒 `PUT /api/customers/change-password` |
| **Mô tả** | Đổi mật khẩu khi đã đăng nhập |

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

---

### 2.9 Quên mật khẩu ⚠️

| | |
|---|---|
| **Endpoint** | 🟢 `POST /api/customers/forgot-password` |
| **Mô tả** | Yêu cầu đặt lại mật khẩu qua email |
| **Trạng thái** | ⚠️ TODO: Gửi email chưa implement |

**Request Body:**
```json
{
  "email": "customer@example.com"
}
```

**Response:** `200 OK` — Luôn trả success (không leak thông tin email tồn tại)
```json
{
  "status": 200,
  "message": "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
  "data": null
}
```

---

### 2.10 Đặt lại mật khẩu

| | |
|---|---|
| **Endpoint** | 🟢 `POST /api/customers/reset-password` |
| **Mô tả** | Đặt lại mật khẩu bằng reset token |

**Request Body:**
```json
{
  "token": "jwt_reset_token_from_email",
  "newPassword": "newSecurePassword456"
}
```

**Error:** `400 Bad Request` — Token không hợp lệ hoặc đã hết hạn (15 phút)

---

### 2.11 Vô hiệu hóa tài khoản

| | |
|---|---|
| **Endpoint** | 🔒 `DELETE /api/customers/deactivate` |
| **Mô tả** | Vô hiệu hóa tài khoản khách hàng |

---

## 3. Staff

**Base path:** `/api/staff`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 3.1 | 🟢 POST | `/api/staff/login` | — | Đăng nhập nhân viên |
| 3.2 | 🔒 POST | `/api/staff/logout` | Token | Đăng xuất |
| 3.3 | 🔒 GET | `/api/staff/profile` | Token | Lấy thông tin profile |
| 3.4 | 🔒 PUT | `/api/staff/profile` | Token | Cập nhật profile |
| 3.5 | 🔒 PUT | `/api/staff/change-password` | Token | Đổi mật khẩu |

---

## 4. Category

**Base path:** `/api/categories`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 4.1 | 🟢 GET | `/api/categories` | — | Lấy tất cả danh mục |
| 4.2 | 🟢 GET | `/api/categories/:id` | — | Lấy danh mục theo ID |
| 4.3 | 🟢 GET | `/api/categories/:id/products` | — | Lấy sản phẩm theo danh mục |
| 4.4 | 🟢 GET | `/api/categories/promotions/:id` | — | Lấy khuyến mãi theo danh mục |

---

## 5. Color

**Base path:** `/api/colors`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 5.1 | 🟢 GET | `/api/colors` | — | Lấy tất cả màu |
| 5.2 | 🟢 GET | `/api/colors/active` | — | Lấy màu đang hoạt động |
| 5.3 | 🟢 GET | `/api/colors/:id` | — | Lấy màu theo ID |

---

## 6. Dimensions

**Base path:** `/api/dimensions`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 6.1 | 🟢 GET | `/api/dimensions` | — | Lấy tất cả kích thước |
| 6.2 | 🟢 GET | `/api/dimensions/:id` | — | Lấy kích thước theo ID |

---

## 7. Product

**Base path:** `/api/products`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 7.1 | 🟢 GET | `/api/products` | — | Lấy tất cả sản phẩm |
| 7.2 | 🟢 GET | `/api/products/search` | — | Tìm kiếm sản phẩm |
| 7.3 | 🟢 GET | `/api/products/trending` | — | Sản phẩm xu hướng |
| 7.4 | 🟢 GET | `/api/products/new-arrivals` | — | Sản phẩm mới |
| 7.5 | 🟢 GET | `/api/products/best-sellers` | — | Sản phẩm bán chạy |
| 7.6 | 🟢 GET | `/api/products/related/:id` | — | Sản phẩm liên quan |
| 7.7 | 🟢 GET | `/api/products/category/:categoryId` | — | Sản phẩm theo danh mục |
| 7.8 | 🟢 GET | `/api/products/attributes/:attributeId` | — | Chi tiết thuộc tính SP |
| 7.9 | 🟢 GET | `/api/products/stock/:attributeId` | — | Kiểm tra tồn kho |
| 7.10 | 🟢 POST | `/api/products/:id/view` | — | Tăng lượt xem sản phẩm |
| 7.11 | 🟢 GET | `/api/products/:id` | — | Lấy sản phẩm theo ID |

### Query Parameters cho Search (7.2)

```
GET /api/products/search?keyword=bàn&minPrice=100000&maxPrice=5000000&categoryId=1&page=1&limit=20
```

---

## 8. Product Attribute

**Base path:** `/api/product-attributes`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 8.1 | 🟢 GET | `/api/product-attributes/product/:productId` | — | Lấy attributes theo sản phẩm |
| 8.2 | 🟢 GET | `/api/product-attributes/:id/stock` | — | Kiểm tra tồn kho attribute |
| 8.3 | 🟢 GET | `/api/product-attributes/:id` | — | Lấy attribute theo ID |

---

## 9. Product Image

**Base path:** `/api/product-images`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 9.1 | 🟢 GET | `/api/product-images/product/:productId` | — | Lấy ảnh theo sản phẩm |
| 9.2 | 🟢 GET | `/api/product-images/:id` | — | Lấy ảnh theo ID |

---

## 10. Cart

**Base path:** `/api/cart`  
> ⚡ **Tất cả route đều yêu cầu đăng nhập (verifyToken)**

### Cart Operations

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 10.1 | 🔒 GET | `/api/cart` | Token | Lấy giỏ hàng |
| 10.2 | 🔒 GET | `/api/cart/items/count` | Token | Đếm số sản phẩm trong giỏ |
| 10.3 | 🔒 GET | `/api/cart/total` | Token | Tổng tiền giỏ hàng |
| 10.4 | 🔒 POST | `/api/cart/add` | Token | Thêm SP vào giỏ |
| 10.5 | 🔒 PUT | `/api/cart/update/:itemId` | Token | Cập nhật item trong giỏ |
| 10.6 | 🔒 DELETE | `/api/cart/remove/:itemId` | Token | Xóa item khỏi giỏ |
| 10.7 | 🔒 DELETE | `/api/cart/clear` | Token | Xóa toàn bộ giỏ hàng |
| 10.8 | 🔒 POST | `/api/cart/apply-promotion` | Token | Áp dụng mã khuyến mãi |
| 10.9 | 🔒 DELETE | `/api/cart/remove-promotion` | Token | Gỡ mã khuyến mãi |
| 10.10 | 🔒 POST | `/api/cart/sync` | Token | Đồng bộ giỏ hàng (guest→user) |
| 10.11 | 🔒 GET | `/api/cart/checkout-info` | Token | Thông tin checkout |

### Cart Items

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 10.12 | 🔒 GET | `/api/cart/items` | Token | Lấy tất cả items |
| 10.13 | 🔒 GET | `/api/cart/items/:itemId` | Token | Lấy item theo ID |
| 10.14 | 🔒 PUT | `/api/cart/items/:itemId/quantity` | Token | Cập nhật số lượng |
| 10.15 | 🔒 DELETE | `/api/cart/items/:itemId` | Token | Xóa item |

### Ví dụ: Thêm vào giỏ hàng (10.4)

**Request Body:**
```json
{
  "productAttributeId": 5,
  "quantity": 2
}
```

### Ví dụ: Áp dụng mã khuyến mãi (10.8)

**Request Body:**
```json
{
  "promotionCode": "SUMMER2026"
}
```

---

## 11. Promotion

**Base path:** `/api/promotions`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 11.1 | 🟢 GET | `/api/promotions` | — | Lấy khuyến mãi đang hoạt động |
| 11.2 | 🟢 GET | `/api/promotions/validate/:code` | — | Kiểm tra mã hợp lệ |
| 11.3 | 🟢 GET | `/api/promotions/code/:code` | — | Lấy KM theo mã |
| 11.4 | 🟢 GET | `/api/promotions/for-product/:productId` | — | Lấy KM cho sản phẩm |
| 11.5 | 🟢 GET | `/api/promotions/:id` | — | Lấy KM theo ID |

### Loại khuyến mãi

| Type | Giá trị | Mô tả |
|------|---------|-------|
| Phần trăm | `percentage` | Giảm theo % |
| Cố định | `fixed` | Giảm số tiền cố định |

---

## 12. Category Promotion

**Base path:** `/api/category-promotions`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 12.1 | 🟢 GET | `/api/category-promotions/category/:categoryId` | — | KM theo danh mục |
| 12.2 | 🟢 GET | `/api/category-promotions/promotion/:promotionId` | — | Danh mục theo KM |

---

## 13. Order

**Base path:** `/api/orders`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 13.1 | 🟢 GET | `/api/orders/tracking/:trackingNumber` | — | Tra cứu đơn hàng |
| 13.2 | 🔒 POST | `/api/orders` | Token | Tạo đơn hàng |
| 13.3 | 🔒 GET | `/api/orders` | Token | Lấy đơn hàng của tôi |
| 13.4 | 🔒 GET | `/api/orders/:id` | Token | Chi tiết đơn hàng |
| 13.5 | 🔒 GET | `/api/orders/:id/status` | Token | Trạng thái đơn hàng |
| 13.6 | 🔒 PUT | `/api/orders/:id/cancel` | Token | Hủy đơn hàng |
| 13.7 | 🔒 POST | `/api/orders/:id/confirm` | Token | Xác nhận nhận hàng |
| 13.8 | 🔒 POST | `/api/orders/:id/reorder` | Token | Đặt lại đơn hàng |

### Trạng thái đơn hàng

```
pending → confirmed → shipping → completed
   ↓
cancelled
```

| Status | Mô tả |
|--------|-------|
| `pending` | Chờ xác nhận |
| `confirmed` | Đã xác nhận |
| `shipping` | Đang giao hàng |
| `completed` | Hoàn thành |
| `cancelled` | Đã hủy |

### Ví dụ: Tạo đơn hàng (13.2)

**Request Body:**
```json
{
  "diaChiGiao": "456 Đường XYZ, Quận 3, TP.HCM",
  "soDienThoai": "0901234567",
  "ghiChu": "Giao giờ hành chính",
  "paymentMethod": "vnpay",
  "promotionCode": "SUMMER2026"
}
```

---

## 14. Order Detail

**Base path:** `/api/order-details`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 14.1 | 🔒 GET | `/api/order-details/order/:orderId` | Token | Lấy chi tiết theo đơn |
| 14.2 | 🔒 GET | `/api/order-details/:id` | Token | Lấy chi tiết theo ID |

---

## 15. Payment

**Base path:** `/api/payments`

| # | Method | Endpoint | Auth | Mô tả |
|---|--------|----------|------|-------|
| 15.1 | 🟢 GET | `/api/payments/vnpay/callback` | — | VNPay IPN callback |
| 15.2 | 🟢 GET | `/api/payments/vnpay/return` | — | VNPay redirect về client |
| 15.3 | 🔒 POST | `/api/payments/vnpay/create` | Token | Tạo thanh toán VNPay |
| 15.4 | 🔒 GET | `/api/payments/:id/status` | Token | Trạng thái thanh toán |
| 15.5 | 🔒 GET | `/api/payments/order/:orderId` | Token | Thanh toán theo đơn hàng |
| 15.6 | 🔒 POST | `/api/payments/cod/confirm` | Token | Xác nhận COD |

### Phương thức thanh toán

| Method | Giá trị | Mô tả |
|--------|---------|-------|
| VNPay | `vnpay` | Thanh toán online qua VNPay |
| COD | `cod` | Thanh toán khi nhận hàng |

### Trạng thái thanh toán

| Status | Mô tả |
|--------|-------|
| `pending` | Đang chờ |
| `success` | Thành công |
| `failed` | Thất bại |

---

## 16. Admin

**Base path:** `/api/admin`  
> 🔴 **Tất cả route yêu cầu JWT Token + quyền Admin/Staff**

### 16.1 Quản lý Danh mục

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.1.1 | 🔴 POST | `/api/admin/categories` | Tạo danh mục |
| 16.1.2 | 🔴 PUT | `/api/admin/categories/:id` | Cập nhật danh mục |
| 16.1.3 | 🔴 DELETE | `/api/admin/categories/:id` | Xóa danh mục |
| 16.1.4 | 🔴 POST | `/api/admin/categories/reorder` | Sắp xếp lại thứ tự |

**Ví dụ: Tạo danh mục**
```json
{
  "tenDanhMuc": "Ghế Sofa",
  "moTa": "Các loại ghế sofa cao cấp",
  "parentId": null,
  "thuTu": 1
}
```

---

### 16.2 Quản lý Màu sắc

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.2.1 | 🔴 POST | `/api/admin/colors` | Tạo màu |
| 16.2.2 | 🔴 PUT | `/api/admin/colors/:id` | Cập nhật màu |
| 16.2.3 | 🔴 DELETE | `/api/admin/colors/:id` | Xóa màu |

---

### 16.3 Quản lý Kích thước

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.3.1 | 🔴 POST | `/api/admin/dimensions` | Tạo kích thước |
| 16.3.2 | 🔴 PUT | `/api/admin/dimensions/:id` | Cập nhật kích thước |
| 16.3.3 | 🔴 DELETE | `/api/admin/dimensions/:id` | Xóa kích thước |

---

### 16.4 Quản lý Sản phẩm

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.4.1 | 🔴 POST | `/api/admin/products` | Tạo sản phẩm |
| 16.4.2 | 🔴 PUT | `/api/admin/products/:id` | Cập nhật sản phẩm |
| 16.4.3 | 🔴 DELETE | `/api/admin/products/:id` | Xóa sản phẩm |

---

### 16.5 Quản lý Product Attribute

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.5.1 | 🔴 POST | `/api/admin/product-attributes` | Tạo attribute |
| 16.5.2 | 🔴 PUT | `/api/admin/product-attributes/:id` | Cập nhật attribute |
| 16.5.3 | 🔴 PUT | `/api/admin/product-attributes/:id/stock` | Cập nhật tồn kho |
| 16.5.4 | 🔴 DELETE | `/api/admin/product-attributes/:id` | Xóa attribute |

---

### 16.6 Quản lý Ảnh sản phẩm

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.6.1 | 🔴 POST | `/api/admin/product-images` | Upload ảnh (multipart/form-data) |
| 16.6.2 | 🔴 PUT | `/api/admin/product-images/:id/main` | Đặt ảnh chính |
| 16.6.3 | 🔴 DELETE | `/api/admin/product-images/:id` | Xóa ảnh |
| 16.6.4 | 🔴 PUT | `/api/admin/product-images/reorder` | Sắp xếp thứ tự ảnh |

**Upload ảnh (16.6.1):**
```
Content-Type: multipart/form-data

Fields:
  - image: [file] (ảnh sản phẩm — upload Cloudinary)
  - productId: 1
  - isMain: false
```

---

### 16.7 Quản lý Khuyến mãi

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.7.1 | 🔴 GET | `/api/admin/promotions/all` | Lấy tất cả KM (kể cả inactive) |
| 16.7.2 | 🔴 POST | `/api/admin/promotions` | Tạo khuyến mãi |
| 16.7.3 | 🔴 PUT | `/api/admin/promotions/:id` | Cập nhật khuyến mãi |
| 16.7.4 | 🔴 DELETE | `/api/admin/promotions/:id` | Xóa khuyến mãi |
| 16.7.5 | 🔴 PUT | `/api/admin/promotions/:id/activate` | Kích hoạt KM |
| 16.7.6 | 🔴 PUT | `/api/admin/promotions/:id/deactivate` | Vô hiệu hóa KM |

---

### 16.8 Quản lý Category Promotion

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.8.1 | 🔴 GET | `/api/admin/category-promotions` | Lấy tất cả liên kết DM-KM |
| 16.8.2 | 🔴 POST | `/api/admin/category-promotions` | Gán KM cho danh mục |
| 16.8.3 | 🔴 DELETE | `/api/admin/category-promotions/:id` | Gỡ KM khỏi danh mục |

---

### 16.9 Quản lý Đơn hàng

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.9.1 | 🔴 GET | `/api/admin/orders` | Lấy tất cả đơn hàng |
| 16.9.2 | 🔴 GET | `/api/admin/orders/filter` | Lọc đơn hàng |
| 16.9.3 | 🔴 GET | `/api/admin/orders/statistics` | Thống kê đơn hàng |
| 16.9.4 | 🔴 GET | `/api/admin/orders/:id` | Chi tiết đơn hàng |
| 16.9.5 | 🔴 PUT | `/api/admin/orders/:id/status` | Cập nhật trạng thái |
| 16.9.6 | 🔴 PUT | `/api/admin/orders/:id/assign-shipper` | Gán shipper |

**Query Parameters cho Filter (16.9.2):**
```
GET /api/admin/orders/filter?status=pending&fromDate=2026-01-01&toDate=2026-12-31&page=1&limit=20
```

---

### 16.10 Quản lý Order Detail (Admin)

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.10.1 | 🔴 GET | `/api/admin/order-details/order/:orderId` | Chi tiết đơn (admin view) |

---

### 16.11 Quản lý Thanh toán

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.11.1 | 🔴 GET | `/api/admin/payments` | Lấy tất cả thanh toán |
| 16.11.2 | 🔴 GET | `/api/admin/payments/:id` | Chi tiết thanh toán |
| 16.11.3 | 🔴 POST | `/api/admin/payments/:id/refund` | Hoàn tiền |

---

### 16.12 Quản lý Nhân viên

| # | Method | Endpoint | Mô tả |
|---|--------|----------|-------|
| 16.12.1 | 🔴 GET | `/api/admin/staff` | Lấy danh sách NV |
| 16.12.2 | 🔴 POST | `/api/admin/staff` | Tạo nhân viên |
| 16.12.3 | 🔴 GET | `/api/admin/staff/:id` | Chi tiết nhân viên |
| 16.12.4 | 🔴 PUT | `/api/admin/staff/:id` | Cập nhật nhân viên |
| 16.12.5 | 🔴 DELETE | `/api/admin/staff/:id` | Xóa nhân viên |
| 16.12.6 | 🔴 PUT | `/api/admin/staff/:id/activate` | Kích hoạt NV |
| 16.12.7 | 🔴 PUT | `/api/admin/staff/:id/deactivate` | Vô hiệu hóa NV |

### Loại nhân viên

| Type | Giá trị | Mô tả |
|------|---------|-------|
| Staff | `Staff` | Nhân viên thường |
| Admin | `Admin` | Quản trị viên |

---

## 📊 Tổng hợp API

| Nhóm | Public 🟢 | Protected 🔒 | Admin 🔴 | Tổng |
|------|-----------|--------------|----------|------|
| Customer | 6 | 5 | — | 11 |
| Staff | 1 | 4 | — | 5 |
| Category | 4 | — | 4 | 8 |
| Color | 3 | — | 3 | 6 |
| Dimensions | 2 | — | 3 | 5 |
| Product | 11 | — | 3 | 14 |
| Product Attribute | 3 | — | 4 | 7 |
| Product Image | 2 | — | 4 | 6 |
| Cart | — | 15 | — | 15 |
| Promotion | 5 | — | 6 | 11 |
| Category Promotion | 2 | — | 3 | 5 |
| Order | 1 | 7 | 6 | 14 |
| Order Detail | — | 2 | 1 | 3 |
| Payment | 2 | 4 | 3 | 9 |
| **Tổng** | **42** | **37** | **40** | **119** |

---

## 🔧 Error Response Format

Tất cả error đều trả về format thống nhất:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Mô tả lỗi chi tiết",
  "path": "/api/customers/login"
}
```

### HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Request không hợp lệ |
| `401` | Chưa xác thực / Token sai |
| `403` | Không có quyền |
| `404` | Không tìm thấy |
| `503` | Spring Boot service không khả dụng |

---

## 🌐 Third-party Services

| Service | Dùng cho | Config |
|---------|----------|--------|
| **TiDB Cloud** | MySQL Database | `DATABASE_URL` |
| **Cloudinary** | Upload/quản lý ảnh | `CLOUDINARY_*` |
| **Nodemailer** | Gửi email xác thực/reset | `MAIL_*` |
| **VNPay** | Thanh toán online | `VNPAY_*` |
| **Socket.IO** | Real-time notifications | Tích hợp sẵn |

---

> 📝 **Ghi chú:** File này được tạo tự động dựa trên source code. Cập nhật lại khi có thay đổi API.
