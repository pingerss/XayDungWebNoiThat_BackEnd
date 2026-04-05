# API ENDPOINTS DOCUMENTATION
## E-Commerce Platform - Node.js BFF + Spring Boot

---

## 🏗️ **KIẾN TRÚC TỔNG THỂ**
Client (Web/Mobile)
↓
Node.js BFF (Port 3000) - Public API
↓
Spring Boot Core (Port 8080) - Internal API

- **Client chỉ gọi Node.js BFF**
- **Node.js tự xử lý**: Product, Category, Color, Dimensions, Cart, Cache, WebSocket
- **Node.js gọi Spring Boot** khi cần: Customer, Order, Payment, Promotion, Staff
- **Spring Boot không exposed ra ngoài** (internal network)

---

## 📑 MỤC LỤC

1. [Customer Endpoints](#1-customer-endpoints)
2. [Category Endpoints](#2-category-endpoints)
3. [Color Endpoints](#3-color-endpoints)
4. [Dimensions Endpoints](#4-dimensions-endpoints)
5. [Product Endpoints](#5-product-endpoints)
6. [Product Attributes Endpoints](#6-product-attributes-endpoints)
7. [Product Image Endpoints](#7-product-image-endpoints)
8. [Cart Endpoints](#8-cart-endpoints)
9. [Cart Item Endpoints](#9-cart-item-endpoints)
10. [Promotion Endpoints](#10-promotion-endpoints)
11. [Category Promotion Endpoints](#11-category-promotion-endpoints)
12. [Order Endpoints](#12-order-endpoints)
13. [Order Detail Endpoints](#13-order-detail-endpoints)
14. [Payment Endpoints](#14-payment-endpoints)
15. [Staff Endpoints](#15-staff-endpoints)
16. [WebSocket Events](#16-websocket-events)
17. [Spring Boot Internal Endpoints](#17-spring-boot-internal-endpoints)
18. [Common Headers](#18-common-headers)
19. [Error Codes](#19-error-codes)

---

## 1. 👤 **CUSTOMER ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/customers/register` | Đăng ký tài khoản mới | ❌ |
| `POST` | `/api/customers/login` | Đăng nhập | ❌ |
| `POST` | `/api/customers/logout` | Đăng xuất | ✅ |
| `GET` | `/api/customers/profile` | Lấy thông tin profile | ✅ |
| `PUT` | `/api/customers/profile` | Cập nhật profile | ✅ |
| `PUT` | `/api/customers/change-password` | Đổi mật khẩu | ✅ |
| `POST` | `/api/customers/forgot-password` | Quên mật khẩu (gửi email) | ❌ |
| `POST` | `/api/customers/reset-password` | Reset mật khẩu với token | ❌ |
| `POST` | `/api/customers/google` | Đăng nhập bằng Google | ❌ |
| `GET` | `/api/customers/verify-email/:token` | Xác thực email | ❌ |
| `DELETE` | `/api/customers/deactivate` | Vô hiệu hóa tài khoản | ✅ |

---

## 2. 📁 **CATEGORY ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/categories` | Lấy tất cả categories | ❌ |
| `GET` | `/api/categories/:id` | Lấy category theo ID | ❌ |
| `GET` | `/api/categories/tree` | Lấy category tree (nested) | ❌ |
| `GET` | `/api/categories/:id/products` | Lấy sản phẩm theo category | ❌ |
| `GET` | `/api/categories/promotions/:id` | Lấy promotions của category | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/categories` | Tạo category mới | Admin |
| `PUT` | `/api/admin/categories/:id` | Cập nhật category | Admin |
| `DELETE` | `/api/admin/categories/:id` | Xóa category | Admin |
| `POST` | `/api/admin/categories/reorder` | Sắp xếp lại thứ tự | Admin |

---

## 3. 🎨 **COLOR ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/colors` | Lấy tất cả màu sắc | ❌ |
| `GET` | `/api/colors/:id` | Lấy màu theo ID | ❌ |
| `GET` | `/api/colors/active` | Lấy màu đang active | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/colors` | Tạo màu mới | Admin |
| `PUT` | `/api/admin/colors/:id` | Cập nhật màu | Admin |
| `DELETE` | `/api/admin/colors/:id` | Xóa màu | Admin |

---

## 4. 📏 **DIMENSIONS ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/dimensions` | Lấy tất cả kích thước | ❌ |
| `GET` | `/api/dimensions/:id` | Lấy kích thước theo ID | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/dimensions` | Tạo kích thước mới | Admin |
| `PUT` | `/api/admin/dimensions/:id` | Cập nhật kích thước | Admin |
| `DELETE` | `/api/admin/dimensions/:id` | Xóa kích thước | Admin |

---

## 5. 📦 **PRODUCT ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/products` | Danh sách sản phẩm (phân trang, filter) | ❌ |
| `GET` | `/api/products/:id` | Chi tiết sản phẩm | ❌ |
| `GET` | `/api/products/search` | Tìm kiếm sản phẩm | ❌ |
| `GET` | `/api/products/trending` | Sản phẩm trending | ❌ |
| `GET` | `/api/products/new-arrivals` | Sản phẩm mới | ❌ |
| `GET` | `/api/products/best-sellers` | Sản phẩm bán chạy | ❌ |
| `GET` | `/api/products/related/:id` | Sản phẩm liên quan | ❌ |
| `GET` | `/api/products/category/:categoryId` | Sản phẩm theo category | ❌ |
| `GET` | `/api/products/attributes/:attributeId` | Chi tiết product attribute | ❌ |
| `GET` | `/api/products/stock/:attributeId` | Kiểm tra stock | ❌ |
| `POST` | `/api/products/:id/view` | Tăng lượt xem | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/products` | Tạo sản phẩm mới | Admin/Staff |
| `PUT` | `/api/admin/products/:id` | Cập nhật sản phẩm | Admin/Staff |
| `DELETE` | `/api/admin/products/:id` | Xóa sản phẩm | Admin |
| `POST` | `/api/admin/products/:id/images` | Thêm ảnh cho sản phẩm | Admin/Staff |
| `DELETE` | `/api/admin/products/:id/images/:imageId` | Xóa ảnh sản phẩm | Admin/Staff |

### Query Parameters cho GET /api/products

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Số trang | `1` |
| `limit` | number | Số item mỗi trang | `20` |
| `categoryId` | number | Lọc theo category | `5` |
| `colorId` | number | Lọc theo màu | `2` |
| `minPrice` | number | Giá tối thiểu | `100000` |
| `maxPrice` | number | Giá tối đa | `500000` |
| `sortBy` | string | Sắp xếp theo | `price`, `createdAt`, `sold` |
| `sortOrder` | string | Thứ tự | `ASC`, `DESC` |
| `keyword` | string | Từ khóa tìm kiếm | `áo thun` |

---

## 6. 🏷️ **PRODUCT ATTRIBUTES ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/product-attributes/product/:productId` | Lấy attributes theo sản phẩm | ❌ |
| `GET` | `/api/product-attributes/:id` | Chi tiết attribute | ❌ |
| `GET` | `/api/product-attributes/:id/stock` | Kiểm tra stock | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/product-attributes` | Tạo attribute mới | Admin/Staff |
| `PUT` | `/api/admin/product-attributes/:id` | Cập nhật attribute | Admin/Staff |
| `PUT` | `/api/admin/product-attributes/:id/stock` | Cập nhật stock | Admin/Staff |
| `DELETE` | `/api/admin/product-attributes/:id` | Xóa attribute | Admin |

---

## 7. 🖼️ **PRODUCT IMAGE ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/product-images/product/:productId` | Lấy ảnh của sản phẩm | ❌ |
| `GET` | `/api/product-images/:id` | Lấy ảnh theo ID | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/product-images` | Upload ảnh mới | Admin/Staff |
| `PUT` | `/api/admin/product-images/:id/main` | Đặt làm ảnh chính | Admin/Staff |
| `DELETE` | `/api/admin/product-images/:id` | Xóa ảnh | Admin/Staff |
| `PUT` | `/api/admin/product-images/reorder` | Sắp xếp lại thứ tự ảnh | Admin/Staff |

---

## 8. 🛒 **CART ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/cart` | Lấy giỏ hàng của tôi | ✅ |
| `GET` | `/api/cart/items/count` | Lấy số lượng items trong giỏ | ✅ |
| `GET` | `/api/cart/total` | Lấy tổng tiền giỏ hàng | ✅ |
| `POST` | `/api/cart/add` | Thêm sản phẩm vào giỏ | ✅ |
| `PUT` | `/api/cart/update/:itemId` | Cập nhật số lượng | ✅ |
| `DELETE` | `/api/cart/remove/:itemId` | Xóa sản phẩm khỏi giỏ | ✅ |
| `DELETE` | `/api/cart/clear` | Xóa toàn bộ giỏ hàng | ✅ |
| `POST` | `/api/cart/apply-promotion` | Áp dụng mã giảm giá | ✅ |
| `DELETE` | `/api/cart/remove-promotion` | Xóa mã giảm giá | ✅ |
| `POST` | `/api/cart/sync` | Đồng bộ giỏ hàng từ session | ✅ |
| `GET` | `/api/cart/checkout-info` | Lấy thông tin checkout | ✅ |

---

## 9. 📝 **CART ITEM ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/cart/items` | Lấy tất cả items trong giỏ | ✅ |
| `GET` | `/api/cart/items/:itemId` | Lấy chi tiết item | ✅ |
| `PUT` | `/api/cart/items/:itemId/quantity` | Cập nhật số lượng item | ✅ |
| `DELETE` | `/api/cart/items/:itemId` | Xóa item khỏi giỏ | ✅ |

---

## 10. 🎁 **PROMOTION ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/promotions` | Danh sách khuyến mãi đang active | ❌ |
| `GET` | `/api/promotions/:id` | Chi tiết khuyến mãi | ❌ |
| `GET` | `/api/promotions/validate/:code` | Validate mã giảm giá | ❌ |
| `GET` | `/api/promotions/code/:code` | Lấy khuyến mãi theo code | ❌ |
| `GET` | `/api/promotions/for-product/:productId` | Khuyến mãi cho sản phẩm | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/promotions` | Tạo khuyến mãi mới | Admin |
| `PUT` | `/api/admin/promotions/:id` | Cập nhật khuyến mãi | Admin |
| `DELETE` | `/api/admin/promotions/:id` | Xóa khuyến mãi | Admin |
| `PUT` | `/api/admin/promotions/:id/activate` | Kích hoạt khuyến mãi | Admin |
| `PUT` | `/api/admin/promotions/:id/deactivate` | Vô hiệu hóa khuyến mãi | Admin |
| `GET` | `/api/admin/promotions/all` | Danh sách tất cả khuyến mãi | Admin |

---

## 11. 🔗 **CATEGORY PROMOTION ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/category-promotions/category/:categoryId` | Lấy khuyến mãi theo category | ❌ |
| `GET` | `/api/category-promotions/promotion/:promotionId` | Lấy category theo khuyến mãi | ❌ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/admin/category-promotions` | Gán khuyến mãi cho category | Admin |
| `DELETE` | `/api/admin/category-promotions/:id` | Xóa gán khuyến mãi | Admin |
| `GET` | `/api/admin/category-promotions` | Danh sách tất cả gán | Admin |

---

## 12. 📦 **ORDER ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/orders` | Tạo đơn hàng mới | ✅ |
| `GET` | `/api/orders/:id` | Chi tiết đơn hàng | ✅ |
| `GET` | `/api/orders` | Danh sách đơn hàng của tôi | ✅ |
| `GET` | `/api/orders/:id/status` | Kiểm tra trạng thái đơn hàng | ✅ |
| `PUT` | `/api/orders/:id/cancel` | Hủy đơn hàng | ✅ |
| `POST` | `/api/orders/:id/confirm` | Xác nhận đơn hàng (COD) | ✅ |
| `GET` | `/api/orders/tracking/:trackingNumber` | Tra cứu đơn hàng theo mã vận đơn | ❌ |
| `POST` | `/api/orders/:id/reorder` | Đặt lại đơn hàng cũ | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/admin/orders` | Danh sách tất cả đơn hàng | Admin/Staff |
| `GET` | `/api/admin/orders/:id` | Chi tiết đơn hàng | Admin/Staff |
| `PUT` | `/api/admin/orders/:id/status` | Cập nhật trạng thái đơn hàng | Admin/Staff |
| `PUT` | `/api/admin/orders/:id/assign-shipper` | Gán người giao hàng | Admin/Staff |
| `GET` | `/api/admin/orders/filter` | Lọc đơn hàng theo điều kiện | Admin/Staff |
| `GET` | `/api/admin/orders/statistics` | Thống kê đơn hàng | Admin |

---

## 13. 📋 **ORDER DETAIL ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/order-details/order/:orderId` | Danh sách chi tiết theo đơn hàng | ✅ |
| `GET` | `/api/order-details/:id` | Chi tiết order detail | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/admin/order-details/order/:orderId` | Danh sách chi tiết đơn hàng | Admin/Staff |

---

## 14. 💳 **PAYMENT ENDPOINTS**

### Node.js BFF (Client gọi)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/payments/vnpay/create` | Tạo thanh toán VNPay | ✅ |
| `GET` | `/api/payments/vnpay/callback` | VNPay callback URL | ❌ |
| `GET` | `/api/payments/vnpay/return` | VNPay return URL (client redirect) | ❌ |
| `GET` | `/api/payments/:id/status` | Kiểm tra trạng thái thanh toán | ✅ |
| `GET` | `/api/payments/order/:orderId` | Lấy thông tin thanh toán theo đơn hàng | ✅ |
| `POST` | `/api/payments/cod/confirm` | Xác nhận thanh toán COD | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/admin/payments` | Danh sách tất cả thanh toán | Admin |
| `GET` | `/api/admin/payments/:id` | Chi tiết thanh toán | Admin |
| `POST` | `/api/admin/payments/:id/refund` | Hoàn tiền | Admin |

---

## 15. 👨💼 **STAFF ENDPOINTS**

### Node.js BFF (Client gọi - Staff/Admin)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/staff/login` | Đăng nhập | ❌ |
| `POST` | `/api/staff/logout` | Đăng xuất | ✅ |
| `GET` | `/api/staff/profile` | Lấy thông tin profile | ✅ |
| `PUT` | `/api/staff/profile` | Cập nhật profile | ✅ |
| `PUT` | `/api/staff/change-password` | Đổi mật khẩu | ✅ |

### Admin Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/admin/staff` | Danh sách tất cả staff | Admin |
| `POST` | `/api/admin/staff` | Tạo staff mới | Admin |
| `PUT` | `/api/admin/staff/:id` | Cập nhật staff | Admin |
| `DELETE` | `/api/admin/staff/:id` | Xóa staff | Admin |
| `PUT` | `/api/admin/staff/:id/activate` | Kích hoạt staff | Admin |
| `PUT` | `/api/admin/staff/:id/deactivate` | Vô hiệu hóa staff | Admin |
| `GET` | `/api/admin/staff/:id` | Chi tiết staff | Admin |

---

## 16. 🔌 **WEBSOCKET EVENTS**

### Socket.IO - Real-time Communication

| Event Name | Direction | Description | Payload |
|------------|-----------|-------------|---------|
| `authenticate` | Client → Server | Xác thực user | `{ customerId, token }` |
| `cart-updated` | Server → Client | Giỏ hàng thay đổi | `{ cartId, items, total }` |
| `order-created` | Server → Client | Đơn hàng mới được tạo | `{ orderId, status, total }` |
| `order-status` | Server → Client | Cập nhật trạng thái đơn hàng | `{ orderId, status, note }` |
| `track-order` | Client → Server | Theo dõi đơn hàng | `{ orderId }` |
| `stop-tracking` | Client → Server | Dừng theo dõi đơn hàng | `{ orderId }` |
| `promotion-applied` | Server → Client | Áp dụng mã giảm giá thành công | `{ code, discount, newTotal }` |
| `stock-alert` | Server → Client | Cảnh báo sản phẩm sắp hết hàng | `{ productId, name, stockLeft }` |
| `payment-success` | Server → Client | Thanh toán thành công | `{ orderId, transactionId }` |
| `payment-failed` | Server → Client | Thanh toán thất bại | `{ orderId, error }` |
| `disconnect` | Client → Server | Ngắt kết nối | - |

---

## 17. 🔗 **SPRING BOOT INTERNAL ENDPOINTS**

### Chỉ Node.js BFF gọi - Internal Network

#### Customer Internal APIs
- `POST /api/internal/customers/register`: Tạo customer mới
- `POST /api/internal/customers/verify`: Xác thực email/password
- `GET /api/internal/customers/:id`: Lấy thông tin customer
- `PUT /api/internal/customers/:id`: Cập nhật customer
- `PUT /api/internal/customers/:id/password`: Cập nhật mật khẩu
- `PUT /api/internal/customers/:id/status`: Active/Deactive customer
- `POST /api/internal/customers/google`: Xác thực Google ID
- `GET /api/internal/customers/email/:email`: Tìm customer theo email
- `GET /api/internal/customers`: Danh sách customer (admin)

#### Order Internal APIs
- `POST /api/internal/orders`: Tạo đơn hàng
- `GET /api/internal/orders/:id`: Lấy order theo ID
- `GET /api/internal/orders/:id/status`: Lấy trạng thái order
- `GET /api/internal/orders/customer/:customerId`: Lấy orders của customer
- `PUT /api/internal/orders/:id/status`: Cập nhật trạng thái order
- `PUT /api/internal/orders/:id/cancel`: Hủy order
- `GET /api/internal/orders/:id/details`: Lấy chi tiết order
- `GET /api/internal/orders/tracking/:trackingNumber`: Tìm order theo tracking number

#### Payment Internal APIs
- `POST /api/internal/payments`: Tạo payment record
- `POST /api/internal/payments/vnpay/create`: Tạo VNPay payment URL
- `GET /api/internal/payments/vnpay/callback`: Xử lý VNPay callback
...

---

## 18. 🔐 **COMMON HEADERS**

### Public Endpoints (No Auth)
```http
Content-Type: application/json
```

### Protected Endpoints (Need JWT)
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Spring Boot Internal Endpoints (Node.js gọi)
```http
X-API-Key: your-internal-api-key-here
X-User-Id: 1001
X-User-Role: customer
Content-Type: application/json
```

---

## 19. 📊 ERROR CODES
| Status Code | Description | When |
|-------------|-------------|------|
| 200 | Success | Mọi thứ OK |
| 201 | Created | Tạo resource thành công |
| 400 | Bad Request | Dữ liệu gửi lên không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Email đã tồn tại, mã giảm giá đã dùng |
| 422 | Unprocessable Entity | Hết hàng, số lượng không đủ |
| 429 | Too Many Requests | Gửi request quá nhanh |
| 500 | Internal Server Error | Lỗi server |

### Error Response Format
```json
{
    "timestamp": "2024-01-15T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Email đã tồn tại trong hệ thống",
    "path": "/api/customers/register"
}
```
