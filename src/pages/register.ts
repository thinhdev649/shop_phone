import { authService } from '../api/authService';
import { renderHeader, updateCartBadge } from '../components/header';
import { router } from '../utils/router';

export function renderRegisterPage(): void {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  if (authService.isAuthenticated()) {
    router.navigate('/');
    return;
  }

  app.innerHTML = `
    ${renderHeader()}
    <main class="main auth-page">
      <div class="container">
        <section class="auth-panel auth-panel-wide">
          <div class="auth-copy">
            <span class="auth-eyebrow">Tạo tài khoản</span>
            <h1 class="auth-title">Đăng ký tài khoản mới</h1>
            <p class="auth-desc">Mặc định tài khoản được tạo với quyền USER. Nếu cần quyền ADMIN, bật tùy chọn admin và nhập admin secret do backend cung cấp.</p>
          </div>

          <form id="register-form" class="auth-form">
            <div id="register-message" class="form-message" hidden></div>

            <div class="form-row">
              <div class="form-group">
                <label for="username" class="form-label">Tên đăng nhập</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  class="form-input"
                  minlength="4"
                  maxlength="100"
                  autocomplete="username"
                  required
                >
              </div>

              <div class="form-group">
                <label for="fullName" class="form-label">Họ tên</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  class="form-input"
                  maxlength="200"
                  autocomplete="name"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                maxlength="150"
                autocomplete="email"
                required
              >
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Mật khẩu</label>
              <input
                type="password"
                id="password"
                name="password"
                class="form-input"
                minlength="8"
                maxlength="255"
                autocomplete="new-password"
                required
              >
            </div>

            <label class="admin-toggle">
              <input type="checkbox" id="register-as-admin" name="registerAsAdmin">
              <span>
                Đăng ký quyền ADMIN
                <small>Chỉ bật khi có admin secret.</small>
              </span>
            </label>

            <div class="form-group" id="admin-secret-group" hidden>
              <label for="adminSecret" class="form-label">Admin secret</label>
              <input
                type="password"
                id="adminSecret"
                name="adminSecret"
                class="form-input"
                maxlength="200"
                placeholder="CHANGE_THIS_ADMIN_SECRET"
              >
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="register-submit">
              Đăng ký
            </button>

            <p class="auth-switch">
              Đã có tài khoản?
              <a href="/login" data-link>Đăng nhập</a>
            </p>
          </form>
        </section>
      </div>
    </main>
  `;

  updateCartBadge();
  setupRegisterForm();
}

function setupRegisterForm(): void {
  const form = document.getElementById('register-form') as HTMLFormElement | null;
  const adminToggle = document.getElementById('register-as-admin') as HTMLInputElement | null;
  const adminSecretGroup = document.getElementById('admin-secret-group');
  const adminSecretInput = document.getElementById('adminSecret') as HTMLInputElement | null;
  const submitButton = document.getElementById('register-submit') as HTMLButtonElement | null;
  const message = document.getElementById('register-message');

  adminToggle?.addEventListener('change', () => {
    const enabled = Boolean(adminToggle.checked);
    if (adminSecretGroup) adminSecretGroup.hidden = !enabled;
    if (adminSecretInput) adminSecretInput.required = enabled;
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const isAdmin = Boolean(adminToggle?.checked);

    const payload = {
      username: String(formData.get('username') || '').trim(),
      password: String(formData.get('password') || ''),
      fullName: String(formData.get('fullName') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      role: isAdmin ? 'ADMIN' : undefined,
      adminSecret: isAdmin ? String(formData.get('adminSecret') || '').trim() : undefined,
    };

    setMessage(message, '', '');
    setLoading(submitButton, true, 'Đang đăng ký...');

    try {
      await authService.register(payload);
      setMessage(message, 'Đăng ký thành công. Đang chuyển sang trang đăng nhập...', 'success');
      setTimeout(() => router.navigate('/login'), 900);
    } catch (error) {
      setMessage(message, error instanceof Error ? error.message : 'Đăng ký thất bại', 'error');
    } finally {
      setLoading(submitButton, false, 'Đăng ký');
    }
  });
}

function setLoading(button: HTMLButtonElement | null, loading: boolean, label: string): void {
  if (!button) return;
  button.disabled = loading;
  button.textContent = label;
}

function setMessage(element: HTMLElement | null, text: string, type: 'success' | 'error' | ''): void {
  if (!element) return;
  element.hidden = !text;
  element.textContent = text;
  element.className = `form-message ${type ? `form-message-${type}` : ''}`;
}
