# TÀI LIỆU CHI TIẾT CÁC ENDPOINT API (RESTful)

Tài liệu này cung cấp danh sách đầy đủ các API Endpoint của hệ thống Backend (Node.js/Express.js), cùng với chức năng, tham số truyền vào, cách dùng chi tiết và **phân quyền (role)** được phép truy cập.

---

## 🔐 BẢNG QUY ĐỊNH PHÂN QUYỀN (ROLES)
- **Public**: Không yêu cầu đăng nhập/Token, ai cũng có thể gọi.
- **Customer (Khách hàng)**: Yêu cầu Header `Authorization: Bearer <token>` của người dùng thông thường.
- **Admin/Staff (Quản trị/Nhân viên)**: Yêu cầu Header `Authorization: Bearer <token>` có chứa role là Admin hoặc Staff.
- **Strict Admin (Tuân thủ Admin)**: Yêu cầu token bắt buộc thuộc quyền là Admin (không cho Staff thực hiện).

---

## 1. CUSTOMER & AUTHENTICATION (Khách Hàng & Xác Thực)
Base URL: `/api/customers`

| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền | Dữ liệu gửi (Body/Query) |
|---|---|---|---|---|
| `POST` | `/register` | Đăng ký tài khoản khách hàng mới | Public | Body: `{ email, password, full_name, phone }` |
| `POST` | `/login` | Đăng nhập tài khoản | Public | Body: `{ email, password }` |
| `POST` | `/forgot-password` | Yêu cầu quên mật khẩu (gửi email OTP) | Public | Body: `{ email }` |
| `POST` | `/reset-password` | Cài đặt lại mật khẩu bằng OTP | Public | Body: `{ email, otp, newPassword }` |
| `POST` | `/google` | Đăng nhập bằng tài khoản Google | Public | Body: `{ googleToken }` |
| `POST` | `/verify-otp` | Xác thực mã OTP | Public | Body: `{ email, otp }` |
| `POST` | `/logout` | Đăng xuất tài khoản | Customer | Header auth token |
| `GET` | `/profile` | Lấy thông tin cá nhân hiện tại | Customer | Header auth token |
| `PUT` | `/profile` | Cập nhật thông tin nhận hàng/cá nhân | Customer | Body: `{ full_name, phone, address... }` |
| `PUT` | `/change-password` | Đổi mật khẩu | Customer | Body: `{ oldPassword, newPassword }` |
| `DELETE` | `/deactivate` | Hủy/vô hiệu hóa tài khoản (xóa mềm) | Customer | Header auth token |

---

## 2. PRODUCTS (Sản Phẩm - Phía Cửa Hàng)
Base URL: `/api/products`

| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền | Dữ liệu gửi (Body/Query) |
|---|---|---|---|---|
| `GET` | `/` | Lấy danh sách sản phẩm (có hỗ trợ lọc/phân trang) | Public | Query: `?page=1&limit=10&priceMin=100&sort=desc` |
| `GET` | `/search` | Tìm kiếm sản phẩm theo tên / từ khóa | Public | Query: `?q=ban+ghe` |
| `GET` | `/trending` | Lấy danh sách sản phẩm nổi bật/nhiều view | Public | Không yêu cầu |
| `GET` | `/new-arrivals` | Lấy danh sách sản phẩm mới về | Public | Không yêu cầu |
| `GET` | `/best-sellers` | Lấy sản phẩm bán chạy nhất | Public | Không yêu cầu |
| `GET` | `/related/:id` | Lấy sản phẩm liên quan đến 1 mã sản phẩm | Public | Query: Bỏ qua |
| `GET` | `/category/:categoryId` | Lấy tất các sản phẩm thuộc danh mục | Public | Params: `categoryId` |
| `GET` | `/attributes/:attributeId` | Lấy chi tiết mẫu mã/biến thể (Màu, Size) | Public | Params: `attributeId` |
| `GET` | `/stock/:attributeId` | Kiểm tra tồn kho của mẫu mã/biến thể | Public | Params: `attributeId` |
| `POST` | `/:id/view` | Tăng số lượng lượt xem của sản phẩm (thống kê)| Public | Params: `id` |
| `GET` | `/:id` | Lấy thông tin chi tiết đầy đủ của sản phẩm | Public | Params: `id` |

---

## 3. CATEGORIES & OTHERS (Danh Mục, Màu Sắc, Kích Thước)
Base URLs: `/api/categories`, `/api/colors`, `/api/dimensions`

| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền | Dữ liệu gửi (Body/Query) |
|---|---|---|---|---|
| `GET` | `/categories` | Lấy cấu trúc danh mục, danh mục cha/con | Public | Không yêu cầu |
| `GET` | `/categories/:id` | Lấy chi tiết 1 Danh mục | Public | Params: `id` |
| `GET` | `/categories/promotions/:id`| Lấy mã giảm giá áp dụng cho DM | Public | Params: `id` (Mã danh mục) |
| `GET` | `/colors` | Lấy tất cả màu sắc hệ thống | Public | Không |
| `GET` | `/colors/active` | Lấy các màu đang được sử dụng (kích hoạt) | Public | Không |
| `GET` | `/colors/:id` | Lấy chi tiết màu | Public | Params: `id` |

---

## 4. CART & CART ITEMS (Giỏ Hàng)
Base URL: `/api/cart`
*(Tất cả API Giỏ hàng đều yêu cầu Role "Customer" - Token)*

| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền | Dữ liệu gửi (Body/Query) |
|---|---|---|---|---|
| `GET` | `/` | Lấy chi tiết giỏ hàng của Customer (Items) | Customer | Header auth token |
| `GET` | `/items/count` | Đếm tổng số lượng món hàng trong giỏ | Customer | Header auth token |
| `GET` | `/total` | Hiển thị tổng tiền tạm tính | Customer | Header auth token |
| `POST` | `/add` | Thêm 1 sản phẩm vào giỏ (chọn màu/size) | Customer | Body: `{ productId, attributeId, quantity }` |
| `PUT` | `/update/:itemId` | Sửa trực tiếp thông tin/số lượng mục | Customer | Body: `{ quantity }` |
| `PUT` | `/items/:itemId/quantity`| Cập nhật chỉ số lượng cho 1 mục trong giỏ | Customer | Body: `{ quantity }` |
| `DELETE` | `/remove/:itemId` | Xóa 1 sản phẩm ra khỏi giỏ | Customer | Params: `itemId` |
| `DELETE` | `/clear` | Xóa toàn bộ giỏ hàng | Customer | - |
| `POST` | `/apply-promotion` | Áp dụng Voucher vào giỏ | Customer | Body: `{ promotionId/Code }` |
| `POST` | `/sync` | Đồng bộ dử liệu giỏ Offline (LocalStorage) lên Server sau Login | Customer | Body: `{ items: [...] }` |
| `GET` | `/checkout-info` | Lấy Tóm tắt (Hóa đơn review cuối) sẵn sàng thanh toán| Customer | - |

---

## 5. ORDERS (Đơn Hàng)
Base URL: `/api/orders`

| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền | Dữ liệu gửi (Body/Query) |
|---|---|---|---|---|
| `GET` | `/tracking/:trackingNum` | Tra cứu đơn không cần đăng nhập qua Tracking No | Public | Params: `trackingNumber` |
| `POST` | `/` | Tạo Đơn hàng (Checkout) | Customer | Body: `{ addressInfo, paymentMethod... }` |
| `GET` | `/` | Lịch sử mua hàng của tôi (My Orders) | Customer | Query: `?status=PENDING` |
| `GET` | `/:id` | Chi tiết Đơn hàng | Customer | Params: `id` |
| `GET` | `/:id/status` | Tình trạng của đơn (vận chuyển/đóng gói) | Customer | Params: `id` |
| `PUT` | `/:id/cancel` | Hủy đơn hàng (nếu đang chờ xử lý) | Customer | Params: `id`, Body: `{ reason }` |
| `POST` | `/:id/confirm` | Xác nhận đã nhận hàng (Hoàn thành) | Customer | Params: `id` |

---

## 6. PAYMENTS (Thanh Toán / VNPay)
Base URL: `/api/payments`

| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền | Dữ liệu gửi (Body/Query) |
|---|---|---|---|---|
| `GET` | `/vnpay/callback` | Webhook VNPay gọi chéo Server xử lý giao dịch | Public (Auto) | Query: Dữ liệu VNPAY trả về |
| `GET` | `/vnpay/return` | URL chuyển hướng User sau khi trả tiền VNPay | Public | Query: Dữ liệu VNPAY trả về |
| `POST` | `/vnpay/create` | Tạo URL VNPay để thực hiện chuyển khoản | Customer | Body: `{ orderId, amount, bankCode }` |
| `GET` | `/:id/status` | Lấy trạng thái của Transaction/Giao dịch | Customer | Params: `id` |
| `GET` | `/order/:orderId` | Lấy giao dịch tương ứng với Order | Customer | Params: `orderId` |
| `POST` | `/cod/confirm` | Xác nhận chọn thanh toán Trả tiền mặt (COD) | Customer | Body: `{ orderId }` |

---

## 7. ADMIN / STAFF PORTAL (Hệ Thống Dành Cho Doanh Nghiệp)
Base URL: `/api/admin`
*(Khối này dành riêng cho Nhân Viên Mua Bán hoặc Người Quản Trị Hệ Thống)*

### 7.1. Quản lý Danh mục & Sản phẩm (Category/Product)
| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền |
|---|---|---|---|
| `POST/PUT/DELETE`| `/admin/categories[/:id]` | Thêm/Sửa/Xóa Danh Mục | Admin/Staff |
| `POST/PUT/DELETE`| `/admin/products[/:id]` | Thêm/Sửa/Xóa Sản phẩm (mô tả, giá) | Admin/Staff |
| `POST/PUT/DELETE`| `/admin/product-attributes`| Thêm/Sửa kích thước/màu của sp | Admin/Staff |
| `PUT` | `/admin/product-attributes/:id/stock`| Điều chỉnh kho hàng nhập vào/xuất ra | Admin/Staff |
| `POST/DELETE` | `/admin/product-images` | Đăng/Xóa ảnh Sản phẩm (Cloudinary) | Admin/Staff |
| `PUT` | `/admin/product-images/:id/main` | Đặt một ảnh làm Thumbnail đại diện | Admin/Staff |

### 7.2. Quản lý Đơn/Khách Hàng (Orders/Payments)
| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền |
|---|---|---|---|
| `GET` | `/admin/orders` | Quản trị lấy tất cả Đơn Hàng (List Order) | Admin/Staff |
| `GET` | `/admin/orders/statistics` | Dashboard/Thống kê Doanh thu (Chart) | Admin/Staff |
| `PUT` | `/admin/orders/:id/status` | Chuyển đổi trạng thái đơn (Duyệt/Giao hàng/Xong)| Admin/Staff |
| `PUT` | `/admin/orders/:id/assign-shipper`| Giao đơn cho đối tác vận chuyển | Admin/Staff |
| `POST` | `/admin/payments/:id/refund`| Hoàn tiền VNPay cho Khách khi đơn lỗi | Admin/Staff |

### 7.3. Promotions/Marketing
| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền |
|---|---|---|---|
| `POST/PUT/DELETE`| `/admin/promotions[/:id]` | Cấu hình mã giảm giá (Discount %) | Admin/Staff |
| `PUT` | `/admin/promotions/:id/activate` | Bật/Tắt hiệu lực của Khuyến Mãi | Admin/Staff |

### 7.4. Quản lý Nhân sự (Staff Accounts)
*Phần này yêu cầu token phải thuộc Strict Admin (Cấp bách/Chủ), Staff bình thường không được dùng.*
| Phương thức | Endpoint | Chức năng (Ý nghĩa) | Role / Quyền |
|---|---|---|---|
| `GET` | `/admin/staff` | Xem tất cả nhân sự cửa hàng | Strict Admin |
| `POST` | `/admin/staff` | Tạo mới Account nhân viên | Strict Admin |
| `PUT` | `/admin/staff/:id` | Sửa quyền/thông báo nhân sự | Strict Admin |
| `DELETE` | `/admin/staff/:id` | Xóa/Khóa nv nghỉ việc | Strict Admin |

---
**Gợi ý xuất nội dung ra .docx:**
Bạn hãy mở file này dưới dạng chế độ xem trước Markdown (`Markdown Preview`), ấn `Ctrl+A` -> `Ctrl+C` copy, sau đó mở phần mềm **Microsoft Word** dán `Ctrl+V` vào. Các bảng biểu và tiêu đề sẽ được Word tự động nhận cấu trúc chuẩn xác và đẹp lại như bình thường. Chỉnh sửa một chút theo ý muốn sau đó bấm `Ctrl + S` lưu dưới định dạng `.docx` nhé!
