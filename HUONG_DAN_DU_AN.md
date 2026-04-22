# Tài Liệu Hướng Dẫn Vận Hành Hệ Thống Backend (noithat_BackEnd)

## 1. Tổng Quan Dự Án (Project Overview)
Dự án này là một **Backend for Frontend (BFF)** được viết bằng **Node.js** và **Express.js**. Nó kết nối và sử dụng cơ sở dữ liệu **MySQL** thông qua ORM **Sequelize**, đồng thời có vai trò như một proxy để đôi khi giao tiếp với hệ thống **Spring Boot Microservice** song song. Hệ thống cũng được tích hợp **Socket.IO** để hỗ trợ real-time (tính năng thời gian thực).

---

## 2. Luồng Hoạt Động Cốt Lõi (Core Operation Flow)
Khi một Request từ Frontend (React/Vue/App, Web nội thất) gửi tới hệ thống, luồng xử lý sẽ đi theo tuyến đường sau vòng đời:
1. **Request (HTTP/HTTPS)** đi vào App Node.js qua file `server.js` (cổng 3000 hoặc theo cấu hình `.env`).
2. Đi qua các **Global Middleware** được cài đặt chung (như `cors` để chống chặn chéo domain, `helmet` (bảo mật), `morgan` (ghi log), `express.json` (phân giải định dạng Request body)).
3. Đi vào nhánh **Router chính** tại `src/routes/index.js`.
4. Dựa vào URL (ví dụ `/api/products`), request được định tuyến tiếp đến một **Router con** (vd: `product.routes.js`).
5. Nếu Endpoint (API) bị giới hạn quyền truy cập, request bắt buộc phải đi qua các **Middleware Xác Thực** (ví dụ `middleware/auth.js` cho User token, `middleware/adminAuth.js` để kiểm tra quyền Admin/Staff).
6. Nếu request "lọt" qua được đầy đủ, nó sẽ chạy vào đến ruột của **Controller** (vd: định tuyến kết nối nó với `src/controllers/product.controller.js`). Tại đây sẽ thực thi Business Logic (logics tính toán).
7. Controller sẽ tương tác với database thông qua các bảng SQL được khai báo thành mã code Object tại **Model (Sequelize)** (thuộc `src/models/`). Nó sẽ truy vấn (Lấy/Thêm/Sửa/Xóa). Hoặc trong một số hàm, Controller gọi **Service** (`src/services/springboot.service.js`) kết nối với Java Spring Boot API chứ không trực tiếp đụng tới MySQL.
8. Kết quả cuối cùng được Controller định dạng chuẩn hóa dùng `src/utils/response.js`.
9. Nó trả lại dữ liệu (JSON) cho Frontend.
10. Tại bất kì công đoạn nào (Từ Middleware đến Controller) Nếu có lỗi văng ra (`Exception`), chúng sẽ bị "bắt đáy" bởi `src/middleware/errorHandler.js` và bung ra các mã HTTP Error Code (400, 401, 404, 500...).

---

## 3. Cấu trúc Thư Mục (Directory Structure)

Dự án được cấu trúc theo hệ thống MVC hiện đại áp dụng cho Backend APIs RESTFul:

```text
noithat_BackEnd/
├── package.json           # File khai báo tên dự án, thư viện (dependencies) & script (start, dev)
├── server.js              # Entry point gốc của ứng dụng (Khởi tạo server, DB, cài các core setup)
├── .env                   # Chứa các biến môi trường cấu hình mật (Port, Chuỗi DB, Secret Keys v.v.)
│
└── src/                   # Thư mục "Trái tim" chứa toàn bộ mã nguồn chính
    ├── config/            # Chứa các module thiết lập thông số (Database, Email, Cloudinary)
    ├── controllers/       # Xử lý các logic nghiệp vụ từng API. Nhận "req" -> xử lý -> trả "res"
    ├── middleware/        # Các hàm chặn ở giữa chu trình sống (Check Token Auth, Error Handler, upload file)
    ├── models/            # Khai báo schema/kiến trúc các bảng Database MySQL thông qua Sequelize ORM
    ├── routes/            # Quản trị URL - Định tuyến các đường dẫn (GET, POST, PUT, DELETE) vào controller nào
    ├── services/          # Các class/tác vụ gọi Data bên ngoài (Ví dụ: Gọi fetch HTTP tới Spring Boot)
    ├── socket/            # Xử lý kết nối và bắn event thời gian thực (Real-time Socket.IO)
    └── utils/             # Các hàm Helper thủ thuật dùng chung (hàm phân trang, chuẩn hóa cấu trúc HTTP Response)
```

---

## 4. Phân Tích Chi Tiết Từng File / Folder / Component

### 4.1. Khởi chạy: `server.js`
Đây là thân chính của cây đại thụ. Chạy lên bằng cách gọi dòng lệnh ở Terminal `npm start` hoặc `npm run dev`.
- **Nạp biến:** Trích xuất biến khai báo từ file `.env`.
- **Khởi tạo Express app:** Cài thiết lập port.
- **Khởi tạo real-time:** Nhúng Express bằng module HTTP thuần + cấp cho `Socket.IO`.
- **Bộ chặn (Middleware) Tổng:** Khai cài Helmet, Morgan, CORS, cấu hình Parse JSON.
- **Nạp Routers:** Nó nạp `src/routes/index.js` vào đường dẫn gốc `/api`. (Tức là API trên hệ thống luôn bắt đầu bằng `/api/...`)
- **Quản lý lỗi văng (Catch all errors):** Gắn ErrorHandler cuối cùng.
- **Khởi động DB & Hoạt động:** Test kết nối DB, dùng lệnh `sequelize.sync({ alter: false })` nạp cấu hình Model vào MySQL (nếu thiếu thì hệ thống báo lỗi chứ ko can thiệp alter structure, vì database khả năng xách chung backend khác). Và Server báo chạy lên thông qua console log port.

---

### 4.2. Thư mục `src/config/` (Cấu Hình / Integrations)
- `database.js`: Cầm các biến username, password, host từ `.env` để khai mở và duy trì cầu nối liên tục tới csdl MySQL.
- `cloudinary.js`: Cầu nối API với dịch vụ `Cloudinary` giúp chứa ảnh các sản phẩm/avatar. Bọc sẵn vào cấu trúc của middleware `multer` giúp code đầu vào hứng file ảnh dễ dàng.
- `email.js`: Cấu trúc thư viện `nodemailer` phụ trách logic đăng nhập hộp thư gmail ảo của dự án để chuẩn bị hàm chức năng tự động gửi hệ thống mail.
- `constants.js`: Những con số / chuỗi hằng định nghĩa của dự án. Gắn cố định tên biến dùng chung.

---

### 4.3. Thư mục `src/models/` (Data Entities - Cơ sở dữ liệu)
Là nơi định nghĩa dữ liệu để làm việc với Table trong Data. Có khoản 15+ model chính.
- **`index.js`**: Tồn tại để tập hợp toàn bộ Model hiện hữu vào chung một cục. Nơi đây khai báo tất cả các **Relationships (Các hàm liên kết)** (1-1, 1-N, N-N). 
  - (VD: `Product.hasMany(ProductImage)` nghĩa là 1 sản phẩm có nhiều ảnh, `Customer.hasMany(Cart)` 1 người có nhiều giỏ hàng con... )
- Các Tệp Schema Đại Diện: `Category.js` (Danh mục), `Product.js` (Sản phẩm cốt lõi), `ProductAttribute.js` (Các biến thể phân loại của sản phẩm liên quan đến size, kích cỡ, tồn kho, giá), `Cart.js`, `Order.js`, `Payment.js` v.v. Tất cả được cấu trúc Type thông qua thư viện `sequelize`.

---

### 4.4. Thư mục `src/routes/` (Bộ Định Tuyến URLs)
Lập bản đồ và khai thị URL nào sẽ kết nối vào điểm code nào trong ổ Controller.
- **`index.js`**: Nơi gộp nhóm khai báo. Khi URL chạm đến sẽ chẻ nhánh (`router.use('/products', productRoutes)`, `router.use('/admin', adminRoutes)`, v.v.).
- **Từng file module chuyên môn (`product.routes.js`, `cart.routes.js`, ...)**: 
  Sẽ thực hiện xác nhận request dùng METHOD nào: GET, POST, PUT hay DELETE và đi đôi với URL nhỏ và hàm cần gọi ở controller. (Ví dụ `router.get('/:id', productController.getById);` sẽ điều vào hàm getById của Product).
- **Tuyệt mật (`admin.routes.js`)**: Điểm đặc biệt tập trung toàn bộ route của công tác quản trị. Ở đầu file được cài đe chặn 2 vòng bảo vệ (`verifyToken`, `verifyAdmin`) đảm bảo 100% request lọt xuống dưới route admin đều là có token đăng nhập hợp lệ và là Role quản trị.

---

### 4.5. Thư mục `src/controllers/` (Não Bộ Nghiệp Vụ - Business Logic)
Nơi logic code diễn ra phức tạp nhất. Nhận Input (Request) -> Tính toán -> Trả Output (Response).
*Ví dụ hàm trong `cart.controller.js` ở luồng `addToCart`:*
1. Check thông tin User đầu vào (Đã dc login từ auth token).
2. Nhận bóc số dữ liệu payload từ Frontend gửi tới (`productId`, `productAttributeId`, `quantity`).
3. Truy vấn kho xem có hàng qua Model ở bảng không (`ProductAttribute`). Nếu thiếu hàng báo lỗi.
4. Truy vấn lại bảng giỏ hàng `Cart` cũ từ Id Khách Hàng. Tạo giỏ mới dính theo Id Khách nếu xưa giờ chưa mua.
5. Cập nhật dữ liệu vào `CartItem` (Tăng quantity nếu sp đã có trong rổ, tạo line mới nếu sp chưa có).
6. Định dạng JSON kết quả "Thêm hàng thành công" trả ra `response` báo cho Frontend.

---

### 4.6. Thư mục `src/middleware/` (Bộ Kiểm Nét Đặc Biệt)
Nơi tạo các lệnh ngăn chặn đứng giữa Router và Controller. Nó nhận Req, có 2 quyền quyết định: "pass qua chạy tiếp" `(gọi next())` hoặc "từ chối chặn lại luôn" `(bắn Error 4xx)`.
- `auth.js` (`verifyToken`): Bóc JWT (JSON Web Token) ở trong Header. Phân tích token để biết chủ Request là khách hàng mang ID nào, sau đó đính trực tiếp object `{ id_user...}` vào `req.user` cho Controller dưới đọc được dễ dàng.
- `adminAuth.js`, `roleAuth.js`: Trích từ `req.user.role` để định đoạt quyền. Nếu thuộc nhóm cấm -> Từ chối chặn lối `403 Forbidden`.
- `errorHandler.js`: Tấm thảm bắt lỗi tuyệt đối. Nhận Input bằng biến đặc biệt `(err, req, res, next)`. Nếu API nổ lõi bên trong do bất kỳ điều gì, thông tin lỗi trôi về đây, gói gọn JSON format và bắn ra Frontend một cách văn minh nhất chứ không làm đơ máy chủ Node.js.

---

### 4.7. Thư mục `src/services/` (Tương Tác Bên Ngoài)
- Hiện tại có module `springboot.service.js`. Đây là lõi Service dùng axios bọc request API ra mạng ngoài, thực hiện fetch kết nối tới một Spring Boot Server khác ở Backend trong chu trình phần mềm microservice. Khi các route Controller cần data hay chức năng từ Spring, nó xài file này để "Nói Chuyện". Tại file có gài cảnh báo lỗi `503 Service Unavailable` nếu cục Spring đang "ngủ/không kết nối" được.

---

### 4.8. Thư mục `src/utils/` (Công Cụ Hỗ Trợ Đóng Gói)
File chức năng dạng Helper nhỏ được gọi linh tinh dạo khắp cả source-code.
- `response.js`: Kho hàm đúc sẵn format HTTP (`successResponse`, `createdResponse`, `errorResponse`, `paginatedResponse`). Thay vì các controller tự xài code thuần của Express (`res.status(200).json({})` lổn nhổn khác format nhau), thì chỉ cần xài hàm ở đây là toàn dự án đầu ra sẽ thống nhất chung 1 dạng object JSON, Frontend nhờ vậy bóc tách cực dễ.
- `helpers.js`: Gói các phép toán như đọc phân trang từ URL (`parsePagination(cắt page, limit)`).

---

## 5. Ví Dụ Cụ Thể: Walkthrough Luồng Lấy Sản Phẩm Theo Tìm Kiếm

Giả định **Frontend khách hàng gõ từ khóa "Sofa"** vào ô search tại Web, quy trình gọi code ngầm sẽ là:

1. **Frontend Request API:**
   `GET http://localhost:3000/api/products?page=1&keyword=Sofa`
2. **Server.js Nhận:**
   Đi vào `server.js`, qua mọi cors, json parse -> đi vào `app.use('/api', require('./src/routes/index'))`.
3. **Chỉ hướng Index Route:**
   Trong `src/routes/index.js`, URL nhánh con khớp ký tự `/products` => Nạp file điều hướng `router.use('/products', productRoutes)`.
4. **Phân Luồng Product Route:**
   Tại `src/routes/product.routes.js`, URL `/` với Method HTTP `GET` phân tích khớp code logic vào `router.get('/', productController.getAll)`.
5. **Logic trong Controller:**
   Nhảy bộ điều khiển vào `src/controllers/product.controller.js` ở function `getAll(...)`.
   - Hàm tải tính năng helper `parsePagination` lấy ra `page = 1`.
   - Khai báo gán object filter `where`. Thấy có biến search Keyword, nó định hình ra câu lệnh `{ name : { [Op.like]: '%Sofa%' }}`.
   - Code Controller giao tiếp Models của **Sequelize**: Chạy lệnh `Product.findAndCountAll(...)`. Trong lệnh đó chỉ ra kèm nhét các `include:` (thêm bản thể bảng Category, bảng mã màu Color, bảng ProductImage để hệ thống SQL chạy Join các bảng ra cấu trúc JSON Object lồng nhau).
   - Sequelzie gọi vào Data mySQL và bọc rinh về biến `rows` (Dữ liệu) và `count` (Tống lượng list).
6. **Bọc Trả Kết Quả Response:**
   Controller gọi hàm `paginatedResponse(res, rows, page, limit, count, 'Lấy SP thành công')`.
7. **Phản Hồi Frontend:**
   File utils `response.js` bóp dữ liệu lại báo mã HTTP là `200`. API trả về màn hình cho ứng dụng tải hiển thị list Sofa. Hoán thành toàn cục quy trình.
