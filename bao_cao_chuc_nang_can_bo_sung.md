# Checklist bổ sung API/Backend gửi sếp

## 1. API cho phân hệ Người dùng (Frontend - Khách hàng)

| STT | Hạng mục | Hiện trạng frontend | API/Backend cần bổ sung |
|---|---|---|---|
| 1 | Trang chủ - banner khuyến mãi | Frontend đã có banner tĩnh trên trang chủ. | Nếu cần quản lý động, bổ sung API banner: danh sách banner đang hiển thị, ảnh banner, tiêu đề, link điều hướng, thời gian bắt đầu/kết thúc. |
| 2 | Trang chủ - điện thoại mới nhất | Frontend đang hiển thị sản phẩm theo brand, chưa có logic "mới nhất" thật. | Bổ sung API lấy sản phẩm mới nhất, ví dụ `GET /api/products?sort=newest&limit=8`, cần có trường `createdAt` hoặc `releaseDate`. |
| 3 | Trang chủ - điện thoại bán chạy | Frontend chưa có dữ liệu bán chạy thật. | Bổ sung API lấy sản phẩm bán chạy, ví dụ `GET /api/products?sort=best_seller&limit=8`, cần có số lượng đã bán hoặc số đơn hàng. |
| 4 | Danh mục sản phẩm - lọc theo hãng | Frontend đã có danh mục/brand và trang sản phẩm theo hãng. | API category/brand hiện đã dùng được, nhưng nên chuẩn hóa response gồm `id`, `code`, `name`, `image/iconLink`, `productCount`. |
| 5 | Danh mục sản phẩm - lọc theo khoảng giá | Frontend chưa có lọc giá. | Bổ sung API lọc sản phẩm theo giá: `GET /api/products?category=apple&minPrice=10000000&maxPrice=30000000&page=1&limit=20`. |
| 6 | Danh sách sản phẩm | Frontend có trang tất cả sản phẩm nhưng đang gom sản phẩm bằng cách gọi từng category. | Nên có API lấy tất cả sản phẩm có phân trang: `GET /api/products?page=1&limit=20&sort=...` để frontend không phải gọi nhiều API. |
| 7 | Tìm kiếm sản phẩm theo tên | Frontend chưa có ô tìm kiếm và chưa có logic search. | Bổ sung API tìm kiếm: `GET /api/products/search?q=iphone&page=1&limit=20`, nên kết hợp được với lọc hãng và lọc giá. |
| 8 | Chi tiết sản phẩm - cấu hình | Frontend đã đọc được tên, ảnh, giá, RAM/ROM/Chip/Pin từ API detail. | Tiếp tục duy trì API chi tiết, nên chuẩn hóa các trường cấu hình: `ram`, `rom/storage`, `chip`, `battery`, `screen`, `camera`. |
| 9 | Chi tiết sản phẩm - trạng thái còn/hết hàng | Frontend hiện đang mặc định sản phẩm là còn hàng. | Bổ sung trường tồn kho trong API detail/list: `inStock`, `stockQuantity`, `status`. |
| 10 | Chi tiết sản phẩm - sản phẩm liên quan | Frontend đang suy đoán brand để lấy sản phẩm liên quan, chưa chính xác. | API detail nên trả `brandId/categoryId`, hoặc có API `GET /api/products/{id}/related`. |
| 11 | Giỏ hàng | Frontend đã có giỏ hàng localStorage, thêm/xóa/cập nhật số lượng. | Nếu chỉ làm giả lập thì tạm đủ. Nếu muốn lưu thật, bổ sung API cart: tạo giỏ, cập nhật số lượng, xóa item. |
| 12 | Đặt hàng giả lập | Frontend đã có form đặt hàng giả lập: họ tên, SĐT, địa chỉ. | Để quản lý đơn thật, bổ sung API `POST /api/orders` nhận thông tin khách hàng, sản phẩm, số lượng, tổng tiền, phí ship, payment method. |

## 2. API/Admin cho phân hệ Quản trị (Backend - Admin)

| STT | Hạng mục | Cần bổ sung |
|---|---|---|
| 1 | Đăng nhập hệ thống | API đăng nhập admin, ví dụ `POST /api/admin/login`; trả token/session; có middleware bảo vệ các API admin. |
| 2 | Phân quyền admin | Có bảng user/admin, role, trạng thái tài khoản. Tối thiểu cần phân biệt admin với người dùng thường. |
| 3 | Quản lý sản phẩm - danh sách | API `GET /api/admin/products?page=1&limit=20&keyword=&category=&status=` để admin xem danh sách, tìm kiếm, lọc sản phẩm. |
| 4 | Quản lý sản phẩm - thêm mới | API `POST /api/admin/products` để thêm điện thoại: tên, hãng, giá, cấu hình, mô tả, tồn kho, ảnh, biến thể. |
| 5 | Quản lý sản phẩm - sửa | API `PUT/PATCH /api/admin/products/{id}` để sửa thông tin sản phẩm. |
| 6 | Quản lý sản phẩm - xóa | API `DELETE /api/admin/products/{id}`. Nên hỗ trợ xóa mềm bằng trường `isActive/status` để tránh mất dữ liệu đơn hàng. |
| 7 | Upload hình sản phẩm | API upload file ảnh: `POST /api/admin/uploads` hoặc upload trực tiếp trong API product. Cần trả về URL ảnh để frontend hiển thị. |
| 8 | Quản lý biến thể sản phẩm | Nếu sản phẩm có màu/dung lượng/giá riêng, cần API quản lý variants: màu sắc, ROM, giá, ảnh, tồn kho từng biến thể. |
| 9 | Quản lý danh mục/hãng | API CRUD category/brand: thêm, sửa, xóa, upload logo/icon, sắp xếp hiển thị. |
| 10 | Quản lý đơn hàng - danh sách | API `GET /api/admin/orders?page=1&limit=20&status=&keyword=` để xem danh sách khách đã đặt. |
| 11 | Quản lý đơn hàng - chi tiết | API `GET /api/admin/orders/{id}` trả thông tin khách hàng, địa chỉ, SĐT, email, danh sách sản phẩm, tổng tiền, trạng thái. |
| 12 | Quản lý đơn hàng - cập nhật trạng thái | API `PATCH /api/admin/orders/{id}/status` với các trạng thái: `Chờ xử lý`, `Đang giao`, `Đã giao`, `Đã hủy`. |
| 13 | Thống kê tổng số lượng điện thoại theo hãng | API dashboard thống kê số sản phẩm theo brand/category. |
| 14 | Thống kê doanh thu | API thống kê doanh thu theo ngày/tháng/năm, tổng doanh thu, tổng số đơn hàng. |
| 15 | Thống kê sản phẩm bán chạy | API lấy top sản phẩm bán chạy dựa trên đơn hàng đã giao. |

## 3. CSDL cần có tối thiểu

| Bảng | Mục đích | Trường nên có |
|---|---|---|
| `users` / `admins` | Đăng nhập quản trị | `id`, `username`, `passwordHash`, `role`, `status`, `createdAt` |
| `categories` / `brands` | Quản lý hãng điện thoại | `id`, `code`, `name`, `image/iconLink`, `description`, `status` |
| `products` | Quản lý điện thoại | `id`, `code`, `name`, `categoryId`, `price`, `salePrice`, `description`, `image`, `stockQuantity`, `status`, `createdAt` |
| `product_specs` | Cấu hình chi tiết | `productId`, `screen`, `chip`, `ram`, `storage`, `camera`, `battery` hoặc key-value |
| `product_images` | Nhiều ảnh sản phẩm | `id`, `productId`, `imageUrl`, `priority` |
| `product_variants` | Màu/dung lượng/giá riêng | `id`, `productId`, `name`, `color`, `storage`, `price`, `imageUrl`, `stockQuantity` |
| `orders` | Đơn hàng | `id`, `customerName`, `phone`, `email`, `address`, `total`, `shippingFee`, `paymentMethod`, `status`, `createdAt` |
| `order_items` | Sản phẩm trong đơn | `orderId`, `productId`, `productName`, `price`, `quantity`, `total` |
| `banners` | Banner khuyến mãi trang chủ | `id`, `title`, `imageUrl`, `link`, `startDate`, `endDate`, `status` |

## 4. Mức ưu tiên làm trước

1. API tìm kiếm sản phẩm theo tên.
2. API lọc sản phẩm theo hãng và khoảng giá.
3. API tồn kho thật: `inStock`, `stockQuantity`, `status`.
4. API tạo đơn hàng thật: `POST /api/orders`.
5. Admin đăng nhập.
6. Admin CRUD sản phẩm và upload ảnh.
7. Admin quản lý đơn hàng và cập nhật trạng thái.
8. API thống kê dashboard: sản phẩm theo hãng, doanh thu, đơn hàng, sản phẩm bán chạy.

## Kết luận

Frontend hiện đã có các màn hình khách hàng chính: trang chủ, danh mục theo hãng, danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng và đặt hàng giả lập. Để đủ yêu cầu trong đề bài và 2 ảnh checklist, backend cần bổ sung thêm các API về tìm kiếm, lọc giá, tồn kho thật, tạo đơn hàng, quản trị đăng nhập, CRUD sản phẩm, upload hình, quản lý đơn hàng và thống kê.
